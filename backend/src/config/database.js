const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");
const pgDatabase = require("./pgDatabase");

let prisma;

if (process.env.NODE_ENV === "production") {
  logger.info("Initializing Prisma Client for production environment");
  prisma = new PrismaClient({
    log: [
      { emit: 'event', level: 'query' },
      { emit: 'event', level: 'error' },
      { emit: 'event', level: 'info' },
      { emit: 'event', level: 'warn' },
    ],
  });
} else {
  if (!global.__prisma) {
    logger.info("Initializing Prisma Client for development environment with query logging");
    global.__prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'query' },
        { emit: 'event', level: 'error' },
        { emit: 'event', level: 'info' },
        { emit: 'event', level: 'warn' },
      ],
    });
  }
  prisma = global.__prisma;
}

// Set up event listeners for Prisma logs
prisma.$on('query', (e) => {
  logger.debug(`Database Query: ${e.query}`, {
    params: e.params,
    duration: `${e.duration}ms`,
    target: e.target
  });
});

prisma.$on('error', (e) => {
  logger.error(`Database Error: ${e.message}`, {
    target: e.target,
    timestamp: e.timestamp
  });
});

prisma.$on('info', (e) => {
  logger.info(`Database Info: ${e.message}`, {
    target: e.target,
    timestamp: e.timestamp
  });
});

prisma.$on('warn', (e) => {
  logger.warn(`Database Warning: ${e.message}`, {
    target: e.target,
    timestamp: e.timestamp
  });
});

// Test database connection and log the result
async function testDatabaseConnection() {
  try {
    // First, try the pg.connect() approach for better compatibility
    logger.info("Testing database connection strategies...");
    
    try {
      const pgResult = await pgDatabase.testConnection();
      logger.info("✅ PostgreSQL direct connection successful", {
        strategy: pgResult.strategy,
        timestamp: new Date().toISOString()
      });
      
      // Store the successful connection globally
      global.dbConnection = pgResult.connection;
      global.dbStrategy = pgResult.strategy;
      
      // Test Prisma with the same connection string
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 as test`;
      
      logger.info("✅ Prisma connection also successful", {
        provider: "postgresql",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
      });
      
      return { pgConnection: pgResult, prismaWorking: true };
      
    } catch (pgError) {
      logger.warn("PostgreSQL direct connection failed, trying Prisma only", {
        error: pgError.message
      });
      
      // Fallback to Prisma only
      await prisma.$connect();
      await prisma.$queryRaw`SELECT 1 as test`;
      
      logger.info("✅ Prisma connection successful (fallback)", {
        provider: "postgresql",
        environment: process.env.NODE_ENV || "development",
        timestamp: new Date().toISOString()
      });
      
      global.dbConnection = prisma;
      global.dbStrategy = "prisma";
      
      return { pgConnection: null, prismaWorking: true };
    }
    
  } catch (error) {
    const errorMessage = "❌ Database connection failed";
    const errorMeta = {
      error: error.message,
      stack: error.stack,
      provider: "postgresql",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      sslMode: process.env.DATABASE_URL?.includes('sslmode') ? 'configured' : 'not configured',
      connectionType: process.env.DATABASE_URL?.includes('pooler') ? 'pooled' : 'direct'
    };
    
    logger.error(errorMessage, errorMeta);
    
    // In production, also ensure this critical error appears in console for immediate visibility
    if (process.env.NODE_ENV === "production") {
      console.error(`[${new Date().toISOString()}] ${errorMessage}`, errorMeta);
    }
    
    throw error;
  }
}

// Initialize database connection with logging
testDatabaseConnection().catch((error) => {
  logger.error("Failed to initialize database connection", { error: error.message });
  process.exit(1);
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  logger.info("Application is shutting down, disconnecting from database...");
  await pgDatabase.disconnect();
  await prisma.$disconnect();
  logger.info("Database connections closed");
});

process.on("SIGINT", async () => {
  logger.info("Received SIGINT signal, shutting down gracefully...");
  await pgDatabase.disconnect();
  await prisma.$disconnect();
  logger.info("Database connections closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM signal, shutting down gracefully...");
  await pgDatabase.disconnect();
  await prisma.$disconnect();
  logger.info("Database connections closed");
  process.exit(0);
});

// Database health check function
async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    
    // Use the established connection strategy
    if (global.dbConnection && global.dbStrategy) {
      const healthResult = await pgDatabase.checkHealth(global.dbConnection, global.dbStrategy);
      
      if (healthResult.status === 'healthy') {
        logger.debug("Database health check passed", healthResult);
        return healthResult;
      } else {
        throw new Error(healthResult.error);
      }
    } else {
      // Fallback to Prisma health check
      await prisma.$queryRaw`SELECT 1 as health_check`;
      const duration = Date.now() - start;
      
      const result = {
        status: "healthy",
        responseTime: duration,
        timestamp: new Date().toISOString(),
        strategy: "prisma"
      };
      
      logger.debug("Database health check passed (Prisma fallback)", result);
      return result;
    }
  } catch (error) {
    const result = {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString(),
      strategy: global.dbStrategy || "unknown"
    };
    
    logger.error("Database health check failed", result);
    return result;
  }
}

module.exports = prisma;
module.exports.checkDatabaseHealth = checkDatabaseHealth;
module.exports.testDatabaseConnection = testDatabaseConnection;
