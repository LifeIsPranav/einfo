const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

let prisma;

// Enhanced Prisma configuration with SSL and connection handling
const prismaConfig = {
  log: process.env.NODE_ENV === "production" ? ["error"] : ["query", "error", "warn"],
  errorFormat: "pretty",
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
  // Add specific configuration for production SSL
  ...(process.env.NODE_ENV === "production" && {
    datasources: {
      db: {
        url: process.env.DATABASE_URL,
      },
    },
  }),
};

// Create Prisma instance with proper SSL handling
if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(prismaConfig);
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient(prismaConfig);
  }
  prisma = global.__prisma;
}

// Enhanced connection function with retry logic and SSL error handling
async function connectWithRetry(retries = 5, delay = 2000) {
  for (let i = 0; i < retries; i++) {
    try {
      await prisma.$connect();
      // Test the connection with a simple query
      await prisma.$queryRaw`SELECT 1`;
      logger.info("Database connected successfully");
      return true;
    } catch (error) {
      logger.warn(`Database connection attempt ${i + 1} failed:`, {
        error: error.message,
        code: error.code
      });
      
      // If it's an SSL/TLS error, log additional information
      if (error.message.includes('TLS') || error.message.includes('SSL') || error.message.includes('OpenSSL')) {
        logger.error("SSL/TLS connection error detected. Please check your DATABASE_URL includes sslmode=require", {
          error: error.message,
          connectionUrl: process.env.DATABASE_URL ? process.env.DATABASE_URL.replace(/:[^:@]+@/, ':***@') : 'NOT_SET'
        });
      }
      
      if (i === retries - 1) {
        logger.error("All database connection attempts failed", {
          error: error.message,
          stack: error.stack,
          code: error.code
        });
        throw error;
      }
      
      // Exponential backoff for retries
      await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, i)));
    }
  }
}

// Initialize connection
connectWithRetry().catch(error => {
  logger.error("Failed to establish database connection", error);
});

// Handle graceful shutdown
process.on("beforeExit", async () => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected on beforeExit");
  } catch (error) {
    logger.error("Error during database disconnect on beforeExit", error);
  }
});

process.on("SIGINT", async () => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected on SIGINT");
  } catch (error) {
    logger.error("Error during database disconnect on SIGINT", error);
  }
  process.exit(0);
});

process.on("SIGTERM", async () => {
  try {
    await prisma.$disconnect();
    logger.info("Database disconnected on SIGTERM");
  } catch (error) {
    logger.error("Error during database disconnect on SIGTERM", error);
  }
  process.exit(0);
});

module.exports = prisma;
