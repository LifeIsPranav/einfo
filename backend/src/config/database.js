const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

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
    await prisma.$connect();
    
    // Always log database connection success, especially important for production
    const connectionMessage = "✅ Database connection established successfully";
    const connectionMeta = {
      provider: "postgresql",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString(),
      databaseUrl: process.env.DATABASE_URL ? "configured" : "not configured"
    };
    
    logger.info(connectionMessage, connectionMeta);
    
    // In production, also ensure this critical log appears in console for immediate visibility
    if (process.env.NODE_ENV === "production") {
      console.log(`[${new Date().toISOString()}] ${connectionMessage}`, connectionMeta);
    }
    
    // Test with a simple query
    await prisma.$queryRaw`SELECT 1 as test`;
    logger.info("✅ Database query test successful");
    
  } catch (error) {
    const errorMessage = "❌ Database connection failed";
    const errorMeta = {
      error: error.message,
      provider: "postgresql",
      environment: process.env.NODE_ENV || "development",
      timestamp: new Date().toISOString()
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
  await prisma.$disconnect();
  logger.info("Database connection closed");
});

process.on("SIGINT", async () => {
  logger.info("Received SIGINT signal, shutting down gracefully...");
  await prisma.$disconnect();
  logger.info("Database connection closed");
  process.exit(0);
});

process.on("SIGTERM", async () => {
  logger.info("Received SIGTERM signal, shutting down gracefully...");
  await prisma.$disconnect();
  logger.info("Database connection closed");
  process.exit(0);
});

// Database health check function
async function checkDatabaseHealth() {
  try {
    const start = Date.now();
    await prisma.$queryRaw`SELECT 1 as health_check`;
    const duration = Date.now() - start;
    
    logger.debug("Database health check passed", { 
      responseTime: `${duration}ms`,
      status: "healthy" 
    });
    
    return {
      status: "healthy",
      responseTime: duration,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    logger.error("Database health check failed", { 
      error: error.message,
      status: "unhealthy" 
    });
    
    return {
      status: "unhealthy",
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
}

module.exports = prisma;
module.exports.checkDatabaseHealth = checkDatabaseHealth;
