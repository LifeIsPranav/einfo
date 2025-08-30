#!/usr/bin/env node

/**
 * Safe deployment script for production
 * Handles both migration-based and push-based deployments
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function runCommand(command, description) {
  console.log(`🔄 ${description}...`);
  try {
    execSync(command, { stdio: 'inherit' });
    console.log(`✅ ${description} completed`);
  } catch (error) {
    console.error(`❌ ${description} failed:`, error.message);
    process.exit(1);
  }
}

async function safeDeploy() {
  console.log('🚀 Starting safe deployment process...\n');
  
  try {
    // Step 1: Generate Prisma client
    runCommand('npx prisma generate', 'Generating Prisma client');
    
    // Step 2: Check if migrations exist
    const migrationsDir = path.join(__dirname, '../prisma/migrations');
    const migrationFiles = fs.existsSync(migrationsDir) 
      ? fs.readdirSync(migrationsDir).filter(f => f !== '_prisma_migrations' && fs.statSync(path.join(migrationsDir, f)).isDirectory())
      : [];
    
    console.log(`\n📋 Found ${migrationFiles.length} migration files`);
    
    if (migrationFiles.length > 0) {
      // Use migrations for deployment
      console.log('📦 Using migration-based deployment (recommended)');
      runCommand('npx prisma migrate deploy', 'Applying database migrations');
    } else {
      // Use db push for initial deployment
      console.log('🔧 Using schema push for initial deployment');
      console.log('⚠️  Warning: This is for initial setup only');
      runCommand('npx prisma db push', 'Pushing schema to database');
    }
    
    // Step 3: Run pre-deployment checks
    console.log('\n🔍 Running deployment verification...');
    runCommand('node src/scripts/pre-deploy-check.js', 'Pre-deployment verification');
    
    console.log('\n🎉 Deployment preparation completed successfully!');
    console.log('✅ Database: Ready');
    console.log('✅ Schema: Applied');
    console.log('✅ Verification: Passed');
    console.log('\n🚀 Server is ready to start with: npm start');
    
  } catch (error) {
    console.error('\n❌ Deployment preparation failed:', error.message);
    console.error('\n🔧 Troubleshooting:');
    console.error('1. Check your DATABASE_URL');
    console.error('2. Ensure database server is accessible');
    console.error('3. Verify schema.prisma is valid');
    console.error('4. Run npm run test-ssl to check connection');
    process.exit(1);
  }
}

safeDeploy();
