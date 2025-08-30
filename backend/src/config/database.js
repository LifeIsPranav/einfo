const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

let prisma;

// Production-specific database URL modifications for Render
function getProductionDatabaseUrl() {
  let dbUrl = process.env.DATABASE_URL;
  
  if (process.env.NODE_ENV === "production") {
    // For Render and other cloud platforms, ensure proper SSL configuration
    if (dbUrl && !dbUrl.includes('sslmode=')) {
      dbUrl += (dbUrl.includes('?') ? '&' : '?') + 'sslmode=require';
    }
    
    // Add connection timeout for cloud deployments
    if (dbUrl && !dbUrl.includes('connect_timeout=')) {
      dbUrl += '&connect_timeout=20';
    }
    
    // Remove problematic channel_binding parameter that can cause SSL issues
    if (dbUrl && dbUrl.includes('channel_binding=require')) {
      dbUrl = dbUrl.replace(/[&?]channel_binding=require/g, '');
    }
    
    logger.info('Production database URL configured with SSL settings');
  }
  
  return dbUrl;
}

// Common Prisma client options for production
const productionOptions = {
  log: ["error", "warn"],
  datasources: {
    db: {
      url: getProductionDatabaseUrl()
    }
  },
  // Add connection timeout and retry configuration
  __internal: {
    engine: {
      connectTimeout: 30000,
      requestTimeout: 60000,
    }
  }
};

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient(productionOptions);
} else {
  if (!global.__prisma) {
    global.__prisma = new PrismaClient({
      log: ["query", "error", "warn"],
      datasources: {
        db: {
          url: process.env.DATABASE_URL
        }
      }
    });
  }
  prisma = global.__prisma;
}

// Test database connection with retry logic
async function testDatabaseConnection(retries = 3) {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      logger.info(`Testing database connection (attempt ${attempt}/${retries})...`);
      
      // Connect with timeout
      const connectPromise = prisma.$connect();
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Connection timeout')), 20000)
      );
      
      await Promise.race([connectPromise, timeoutPromise]);
      
      // Test with a simple query
      await prisma.$queryRaw`SELECT 1 as test`;
      
      logger.info('✅ Database connection successful');
      return true;
    } catch (error) {
      logger.error(`❌ Database connection attempt ${attempt} failed:`, {
        error: error.message,
        code: error.code
      });
      
      if (attempt === retries) {
        throw error;
      }
      
      // Wait before retry (exponential backoff)
      const waitTime = Math.min(1000 * Math.pow(2, attempt - 1), 5000);
      logger.info(`Retrying in ${waitTime}ms...`);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
}

// Handle graceful shutdown
process.on("beforeExit", async () => {
  await prisma.$disconnect();
});

process.on("SIGINT", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGTERM", async () => {
  await prisma.$disconnect();
  process.exit(0);
});

module.exports = { prisma, testDatabaseConnection };
