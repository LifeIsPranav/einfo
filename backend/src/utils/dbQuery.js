// Utility functions for database queries regardless of connection strategy
const logger = require('../utils/logger');

/**
 * Execute a query using the established database connection
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise} Query result
 */
async function query(text, params = []) {
  const dbConnection = global.dbConnection;
  const strategy = global.dbStrategy;

  if (!dbConnection) {
    throw new Error('Database connection not established. Make sure the server started successfully.');
  }

  try {
    let result;

    if (strategy === 'pg.connect' || strategy === 'Client') {
      // Direct client query
      result = await dbConnection.query(text, params);
    } else if (strategy === 'Pool') {
      // Pool query
      result = await dbConnection.query(text, params);
    } else if (strategy === 'prisma') {
      // Prisma raw query - convert to Prisma format
      if (params.length > 0) {
        // For parameterized queries with Prisma, we need to use template literals
        // This is a simplified approach - you might need to adjust based on your needs
        result = await dbConnection.$queryRawUnsafe(text, ...params);
      } else {
        result = await dbConnection.$queryRaw`${text}`;
      }
    } else {
      throw new Error(`Unknown database strategy: ${strategy}`);
    }

    logger.debug('Database query executed successfully', {
      strategy,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      paramCount: params.length,
      rowCount: result?.rows?.length || result?.length || 0
    });

    return result;
  } catch (error) {
    logger.error('Database query failed', {
      strategy,
      query: text.substring(0, 100) + (text.length > 100 ? '...' : ''),
      error: error.message,
      paramCount: params.length
    });
    throw error;
  }
}

/**
 * Execute a transaction using the established database connection
 * @param {Function} callback - Function that receives the client/transaction object
 * @returns {Promise} Transaction result
 */
async function transaction(callback) {
  const dbConnection = global.dbConnection;
  const strategy = global.dbStrategy;

  if (!dbConnection) {
    throw new Error('Database connection not established');
  }

  try {
    if (strategy === 'pg.connect' || strategy === 'Client') {
      // Direct client transaction
      await dbConnection.query('BEGIN');
      try {
        const result = await callback(dbConnection);
        await dbConnection.query('COMMIT');
        return result;
      } catch (error) {
        await dbConnection.query('ROLLBACK');
        throw error;
      }
    } else if (strategy === 'Pool') {
      // Pool transaction
      const client = await dbConnection.connect();
      try {
        await client.query('BEGIN');
        const result = await callback(client);
        await client.query('COMMIT');
        return result;
      } catch (error) {
        await client.query('ROLLBACK');
        throw error;
      } finally {
        client.release();
      }
    } else if (strategy === 'prisma') {
      // Prisma transaction
      return await dbConnection.$transaction(callback);
    } else {
      throw new Error(`Unknown database strategy: ${strategy}`);
    }
  } catch (error) {
    logger.error('Database transaction failed', {
      strategy,
      error: error.message
    });
    throw error;
  }
}

/**
 * Get connection info for debugging
 * @returns {Object} Connection information
 */
function getConnectionInfo() {
  return {
    strategy: global.dbStrategy || 'not connected',
    connected: !!global.dbConnection,
    timestamp: new Date().toISOString()
  };
}

module.exports = {
  query,
  transaction,
  getConnectionInfo
};
