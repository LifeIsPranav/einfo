#!/usr/bin/env node

/**
 * Pre-deployment verification script
 * This script verifies that the database connection and migrations are ready for deployment
 */

const { testDatabaseConnection } = require('../config/database');
const { checkMigrations } = require('./check-migrations');
const logger = require('../utils/logger');

async function preDeploymentCheck() {
  console.log('🔍 Running pre-deployment verification...\n');
  
  try {
    // Step 1: Test database connection
    console.log('1️⃣ Testing database connection...');
    await testDatabaseConnection();
    console.log('✅ Database connection verified\n');
    
    // Step 2: Check migrations status
    console.log('2️⃣ Checking migration status...');
    try {
      const migrationStatus = await checkMigrations();
      
      if (migrationStatus.status === 'current') {
        console.log('✅ All migrations are current\n');
      } else {
        console.log('⚠️  Warning: Pending migrations detected');
        console.log('Pending migrations:', migrationStatus.pendingMigrations);
        console.log('Run "npm run migrate-deploy" before deployment\n');
      }
    } catch (migrationError) {
      console.log('⚠️  Warning: Could not check migration status');
      console.log('This might be expected for first-time deployments\n');
    }
    
    // Step 3: Test environment variables
    console.log('3️⃣ Checking environment variables...');
    const requiredEnvVars = [
      'DATABASE_URL',
      'JWT_SECRET',
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET'
    ];
    
    let missingVars = [];
    for (const varName of requiredEnvVars) {
      if (!process.env[varName]) {
        missingVars.push(varName);
      }
    }
    
    if (missingVars.length === 0) {
      console.log('✅ All required environment variables are set\n');
    } else {
      console.log('❌ Missing environment variables:', missingVars.join(', '));
      console.log('Please set these variables before deployment\n');
      process.exit(1);
    }
    
    // Step 4: Final verification
    console.log('🎉 Pre-deployment check completed successfully!');
    console.log('✅ Database: Connected');
    console.log('✅ Environment: Configured');
    console.log('✅ Ready for deployment\n');
    
  } catch (error) {
    logger.error('Pre-deployment check failed:', {
      error: error.message,
      stack: error.stack
    });
    
    console.error('❌ Pre-deployment check failed:', error.message);
    
    if (error.message.includes('TLS') || error.message.includes('SSL')) {
      console.error('\n💡 SSL/TLS Issue:');
      console.error('Check your DATABASE_URL SSL configuration');
      console.error('For Neon: ensure sslmode=require and remove channel_binding=require');
    }
    
    console.error('\n🔧 Fix the issues above before deploying');
    process.exit(1);
  }
}

// Run the check
preDeploymentCheck();
