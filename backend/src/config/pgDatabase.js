const { Client, Pool } = require('pg');
const logger = require('../utils/logger');

class PgDatabaseManager {
  constructor() {
    this.pool = null;
    this.client = null;
    this.done = null;
    this.connectionString = process.env.DATABASE_URL;
  }

  // Clean connection string to remove incompatible parameters
  getCleanConnectionString() {
    if (!this.connectionString) {
      throw new Error('DATABASE_URL not configured');
    }
    
    // Remove channel_binding parameter which causes SSL issues on Render
    return this.connectionString.replace(/[?&]channel_binding=require/g, '');
  }

  // Method 1: Use pg.connect() as suggested from Stack Overflow
  async connectWithPgConnect() {
    const pg = require('pg');
    
    return new Promise((resolve, reject) => {
      const cleanConnectionString = this.getCleanConnectionString();
      
      logger.info('Attempting pg.connect with connection string...');
      
      pg.connect(cleanConnectionString, (err, client, done) => {
        if (err) {
          logger.error('❌ pg.connect failed:', { error: err.message });
          reject(err);
          return;
        }
        
        logger.info('✅ pg.connect successful');
        this.client = client;
        this.done = done;
        resolve({ client, done });
      });
    });
  }

  // Method 2: Use connection pool
  async connectWithPool() {
    try {
      const cleanConnectionString = this.getCleanConnectionString();
      
      // Different SSL settings based on environment
      const sslConfig = process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false;
      
      this.pool = new Pool({
        connectionString: cleanConnectionString,
        ssl: sslConfig,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 5000,
      });

      // Test the connection
      const client = await this.pool.connect();
      await client.query('SELECT 1 as test');
      client.release();
      
      logger.info('✅ Pool connection successful');
      return this.pool;
    } catch (error) {
      logger.error('❌ Pool connection failed:', { error: error.message });
      throw error;
    }
  }

  // Method 3: Use direct client connection
  async connectWithClient() {
    try {
      const cleanConnectionString = this.getCleanConnectionString();
      
      // Different SSL settings based on environment
      const sslConfig = process.env.NODE_ENV === 'production' 
        ? { rejectUnauthorized: false } 
        : false;
      
      this.client = new Client({
        connectionString: cleanConnectionString,
        ssl: sslConfig,
      });

      await this.client.connect();
      await this.client.query('SELECT 1 as test');
      
      logger.info('✅ Client connection successful');
      return this.client;
    } catch (error) {
      logger.error('❌ Client connection failed:', { error: error.message });
      throw error;
    }
  }

  // Test all connection strategies and return the first successful one
  async testConnection() {
    const strategies = [
      { name: 'pg.connect', method: () => this.connectWithPgConnect() },
      { name: 'Pool', method: () => this.connectWithPool() },
      { name: 'Client', method: () => this.connectWithClient() },
    ];

    let lastError;

    for (const strategy of strategies) {
      try {
        logger.info(`🔄 Trying ${strategy.name} strategy...`);
        await strategy.method();
        
        // Test with actual query based on strategy
        if (strategy.name === 'pg.connect') {
          const result = await this.client.query('SELECT NOW() as current_time, 1 as health_check');
          logger.info(`✅ ${strategy.name} strategy works!`, { 
            currentTime: result.rows[0]?.current_time,
            healthCheck: result.rows[0]?.health_check 
          });
          return { strategy: strategy.name, connection: this.client };
          
        } else if (strategy.name === 'Pool') {
          const client = await this.pool.connect();
          const result = await client.query('SELECT NOW() as current_time, 1 as health_check');
          client.release();
          logger.info(`✅ ${strategy.name} strategy works!`, { 
            currentTime: result.rows[0]?.current_time,
            healthCheck: result.rows[0]?.health_check 
          });
          return { strategy: strategy.name, connection: this.pool };
          
        } else {
          const result = await this.client.query('SELECT NOW() as current_time, 1 as health_check');
          logger.info(`✅ ${strategy.name} strategy works!`, { 
            currentTime: result.rows[0]?.current_time,
            healthCheck: result.rows[0]?.health_check 
          });
          return { strategy: strategy.name, connection: this.client };
        }
      } catch (error) {
        lastError = error;
        logger.error(`❌ ${strategy.name} strategy failed:`, { error: error.message });
        
        // Clean up failed connections
        try {
          if (this.done) {
            this.done();
            this.done = null;
          }
          if (this.client && this.client.end) {
            await this.client.end();
            this.client = null;
          }
          if (this.pool) {
            await this.pool.end();
            this.pool = null;
          }
        } catch (cleanupError) {
          // Ignore cleanup errors
        }
        
        continue;
      }
    }

    throw new Error(`All PostgreSQL connection strategies failed. Last error: ${lastError?.message}`);
  }

  // Health check function
  async checkHealth(connection, strategy) {
    try {
      const start = Date.now();
      let result;

      if (strategy === 'pg.connect' || strategy === 'Client') {
        result = await connection.query('SELECT 1 as health_check, NOW() as current_time');
      } else if (strategy === 'Pool') {
        const client = await connection.connect();
        try {
          result = await client.query('SELECT 1 as health_check, NOW() as current_time');
        } finally {
          client.release();
        }
      }

      const duration = Date.now() - start;
      
      return {
        status: 'healthy',
        responseTime: duration,
        timestamp: new Date().toISOString(),
        strategy: strategy,
        healthCheck: result.rows[0]?.health_check,
        currentTime: result.rows[0]?.current_time
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        error: error.message,
        timestamp: new Date().toISOString(),
        strategy: strategy
      };
    }
  }

  // Graceful disconnect
  async disconnect() {
    try {
      if (this.done) {
        this.done(); // Release pg.connect connection
        this.done = null;
        logger.info('Released pg.connect connection');
      }
      if (this.client && this.client.end) {
        await this.client.end();
        this.client = null;
        logger.info('Closed client connection');
      }
      if (this.pool) {
        await this.pool.end();
        this.pool = null;
        logger.info('Closed pool connection');
      }
    } catch (error) {
      logger.error('Error disconnecting from database:', { error: error.message });
    }
  }
}

module.exports = new PgDatabaseManager();
