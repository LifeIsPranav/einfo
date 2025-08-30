const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const slowDown = require("express-slow-down");
const path = require("path");
require("dotenv").config();

const logger = require("./utils/logger");
const { checkMigrations } = require("./scripts/check-migrations");
const { testDatabaseConnection } = require("./config/database");

// Import routes
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const linkRoutes = require("./routes/links");
const portfolioRoutes = require("./routes/portfolio");
const experienceRoutes = require("./routes/experience");
const educationRoutes = require("./routes/education");
const achievementRoutes = require("./routes/achievements");
const extracurricularRoutes = require("./routes/extracurriculars");
const uploadRoutes = require("./routes/upload");
const analyticsRoutes = require("./routes/analytics");
const publicRoutes = require("./routes/public");
const adminRoutes = require("./routes/admin");

// Import middleware
const errorHandler = require("./middleware/errorHandler");
const notFoundHandler = require("./middleware/notFoundHandler");

const app = express();

// Trust proxy for accurate IP addresses (important for rate limiting)
app.set("trust proxy", 1);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  crossOriginEmbedderPolicy: false,
}));

// Compression middleware
app.use(compression());

// CORS configuration
const corsOptions = {
  origin: function (origin, callback) {
    const allowedOrigins = (process.env.CORS_ORIGINS || "").split(",").map(o => o.trim());
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
};

app.use(cors(corsOptions));

// Rate limiting (disabled in development)
if (process.env.NODE_ENV !== "development") {
  const limiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
      success: false,
      message: "Too many requests from this IP, please try again later.",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Stricter rate limiting for auth endpoints
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 10, // Limit each IP to 10 auth requests per windowMs
    message: {
      success: false,
      message: "Too many authentication attempts, please try again later",
    },
    standardHeaders: true,
    legacyHeaders: false,
  });

  // Speed limiter for additional protection
  const speedLimiter = slowDown({
    windowMs: 15 * 60 * 1000, // 15 minutes
    delayAfter: 50, // Allow 50 requests per 15 minutes, then...
    delayMs: () => 500, // Begin adding 500ms of delay per request above 50
    validate: { delayMs: false }, // Disable the warning
  });

  // Apply rate limiting to all routes
  app.use("/api/", limiter);
  app.use("/api/auth/", authLimiter); // Stricter limits for auth
  app.use("/api/", speedLimiter);
  
  logger.info("Rate limiting enabled");
} else {
  logger.info("Rate limiting disabled for development environment");
}

// Body parsing middleware
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));

// Logging middleware
if (process.env.NODE_ENV === "production") {
  app.use(morgan("combined"));
} else {
  app.use(morgan("dev"));
}

// Static files
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ 
    status: "OK", 
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
  });
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/links", linkRoutes);
app.use("/api/portfolio", portfolioRoutes);
app.use("/api/experience", experienceRoutes);
app.use("/api/education", educationRoutes);
app.use("/api/achievements", achievementRoutes);
app.use("/api/extracurriculars", extracurricularRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/admin", adminRoutes);

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

const PORT = process.env.PORT || 8000;
// const HOST = process.env.API_HOST || "localhost";
const HOST = process.env.NODE_ENV === 'production' ? '0.0.0.0' : (process.env.API_HOST || "localhost");

// Add root route for Render health checks
app.get("/", (req, res) => {
  res.json({ 
    message: "E-Info Backend API is running!",
    status: "healthy",
    version: "1.0.0"
  });
});

// Database health check endpoint
app.get("/health/db", async (req, res) => {
  try {
    await testDatabaseConnection();
    res.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(503).json({
      status: "unhealthy",
      database: "disconnected",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Startup function with database and migration checks
async function startServer() {
  try {
    logger.info('Starting server initialization...');
    console.log(`🚀 Initializing E-Info Backend Server`);
    console.log(`📍 Environment: ${process.env.NODE_ENV || "development"}`);
    console.log(`🔧 Node.js version: ${process.version}`);
    
    // Step 1: Test database connection first
    logger.info('Step 1: Testing database connection...');
    console.log(`🔗 Testing database connection...`);
    await testDatabaseConnection();
    console.log(`✅ Database connection successful`);
    
    // Step 2: Check migrations (only in production)
    if (process.env.NODE_ENV === 'production') {
      logger.info('Step 2: Checking migration status...');
      console.log(`📋 Checking database migrations...`);
      
      try {
        const migrationStatus = await checkMigrations();
        
        if (migrationStatus.status !== 'current') {
          logger.error('Cannot start server: pending migrations detected', {
            pendingMigrations: migrationStatus.pendingMigrations
          });
          console.error('\n❌ Cannot start server: Database migrations are not current!');
          console.error('Pending migrations:', migrationStatus.pendingMigrations);
          console.error('Run "npm run migrate-deploy" first, then restart the server.\n');
          process.exit(1);
        }
        
        logger.info('✅ All migrations are current');
        console.log(`✅ All database migrations are current`);
      } catch (migrationError) {
        logger.warn('Migration check failed, but continuing startup:', {
          error: migrationError.message
        });
        console.log(`⚠️  Migration check failed, but continuing startup`);
      }
    }
    
    // Step 3: Start the server
    logger.info('Step 3: Starting HTTP server...');
    console.log(`🌐 Starting HTTP server on ${HOST}:${PORT}...`);
    
    const server = app.listen(PORT, HOST, () => {
      logger.info("Server started successfully", {
        port: PORT,
        host: HOST,
        environment: process.env.NODE_ENV || "development",
        urls: {
          server: `http://${HOST}:${PORT}`,
          health: `http://${HOST}:${PORT}/health`,
          dbHealth: `http://${HOST}:${PORT}/health/db`
        }
      });
      
      console.log(`\n✅ Server is running on http://${HOST}:${PORT}`);
      console.log(`🌐 Environment: ${process.env.NODE_ENV || "development"}`);
      console.log(`🔗 Health check: http://${HOST}:${PORT}/health`);
      console.log(`🗄️  Database health: http://${HOST}:${PORT}/health/db`);
      console.log(`📝 API Documentation: Available at /api endpoints\n`);
    });
    
    // Handle server errors
    server.on('error', (error) => {
      logger.error('Server error:', { error: error.message });
      console.error('❌ Server error:', error.message);
      process.exit(1);
    });
    
    return server;
    
  } catch (error) {
    logger.error('Failed to start server', {
      error: error.message,
      stack: error.stack
    });
    console.error('\n❌ Server startup failed:', error.message);
    
    // Provide specific guidance based on error type
    if (error.message.includes('TLS') || error.message.includes('SSL') || error.message.includes('OpenSSL')) {
      console.error('\n💡 SSL/TLS Connection Error:');
      console.error('This appears to be a database SSL connection issue.');
      console.error('Please ensure your DATABASE_URL includes proper SSL parameters.');
      console.error('For Neon DB, use: sslmode=require (remove channel_binding=require if present)');
    } else if (error.message.includes('timeout') || error.message.includes('ETIMEDOUT')) {
      console.error('\n💡 Connection Timeout:');
      console.error('Database connection timed out. Check your network connection.');
      console.error('This might be due to firewall restrictions or high latency.');
    } else if (error.message.includes('authentication') || error.message.includes('password')) {
      console.error('\n💡 Authentication Error:');
      console.error('Check your database credentials in DATABASE_URL.');
    } else if (error.message.includes('ENOTFOUND') || error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Connection Refused/Not Found:');
      console.error('Cannot reach the database server. Check the hostname and port.');
    }
    
    console.error('\n🔧 Troubleshooting steps:');
    console.error('1. Verify DATABASE_URL environment variable');
    console.error('2. Check database server status');
    console.error('3. Ensure firewall allows database connections');
    console.error('4. Try running: npm run test-ssl');
    console.error('5. Check if SSL/TLS configuration is correct\n');
    
    process.exit(1);
  }
}

// Start the server
startServer();

module.exports = app;
