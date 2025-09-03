const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Check if all migrations have been applied to the database
 */
async function checkMigrations() {
  try {
    logger.info('Checking migration status...');
    
    // Get all migration folders from the filesystem
    const migrationsDir = path.join(__dirname, '../../prisma/migrations');
    
    // Check if migrations directory exists
    if (!fs.existsSync(migrationsDir)) {
      logger.warn('Migrations directory does not exist. This might be a fresh deployment.');
      return {
        status: 'no-migrations',
        totalMigrations: 0,
        appliedMigrations: 0,
        pendingMigrations: [],
        message: 'No migrations directory found. Database schema should be managed via Prisma generate.'
      };
    }
    
    const migrationFolders = fs.readdirSync(migrationsDir)
      .filter(item => {
        const itemPath = path.join(migrationsDir, item);
        return fs.statSync(itemPath).isDirectory() && item !== '_prisma_migrations';
      })
      .sort();
    
    logger.info(`Found ${migrationFolders.length} migration folders`);
    
    // Get applied migrations from the database
    let appliedMigrations = [];
    try {
      appliedMigrations = await prisma.$queryRaw`
        SELECT migration_name, finished_at 
        FROM _prisma_migrations 
        WHERE finished_at IS NOT NULL 
        ORDER BY started_at;
      `;
    } catch (error) {
      if (error.code === '42P01') { // Table doesn't exist
        logger.warn('Migration table does not exist. This might be a fresh database.');
        return {
          status: 'pending',
          totalMigrations: migrationFolders.length,
          appliedMigrations: 0,
          pendingMigrations: migrationFolders,
          message: 'Database appears to be uninitialized. Run migrations first.'
        };
      }
      throw error;
    }
    
    const appliedMigrationNames = appliedMigrations.map(m => m.migration_name);
    logger.info(`Found ${appliedMigrationNames.length} applied migrations`);
    
    // Check for pending migrations
    const pendingMigrations = migrationFolders.filter(
      migration => !appliedMigrationNames.includes(migration)
    );
    
    const status = pendingMigrations.length === 0 ? 'current' : 'pending';
    
    const result = {
      status,
      totalMigrations: migrationFolders.length,
      appliedMigrations: appliedMigrationNames.length,
      pendingMigrations,
      appliedMigrationsList: appliedMigrationNames,
      message: status === 'current' 
        ? 'All migrations are up to date' 
        : `${pendingMigrations.length} migration(s) need to be applied`
    };
    
    if (status === 'current') {
      logger.info('✅ All migrations are current');
    } else {
      logger.warn(`⚠️  ${pendingMigrations.length} pending migrations:`, {
        pendingMigrations
      });
    }
    
    return result;
    
  } catch (error) {
    logger.error('Error checking migrations', {
      error: error.message,
      stack: error.stack,
      code: error.code
    });
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// If called directly (not imported)
if (require.main === module) {
  checkMigrations()
    .then(result => {
      console.log('\n📊 Migration Status:');
      console.log(`Status: ${result.status}`);
      console.log(`Total migrations: ${result.totalMigrations}`);
      console.log(`Applied: ${result.appliedMigrations}`);
      console.log(`Message: ${result.message}`);
      
      if (result.pendingMigrations.length > 0) {
        console.log('\n⚠️  Pending migrations:');
        result.pendingMigrations.forEach(migration => {
          console.log(`  - ${migration}`);
        });
        console.log('\n💡 Run "npm run migrate:deploy" to apply pending migrations');
        process.exit(1); // Exit with error code if migrations are pending
      }
      
      console.log('\n✅ Database is up to date!');
    })
    .catch(error => {
      console.error('❌ Migration check failed:', error.message);
      process.exit(1);
    });
}

module.exports = { checkMigrations };
