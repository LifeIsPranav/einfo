const { prisma } = require('../config/database');
const bcrypt = require('bcrypt');
const logger = require('../utils/logger');

const prisma = new PrismaClient();

/**
 * Create the first super admin user
 * This script should only be run once during initial setup
 */
async function createSuperAdmin() {
  try {
    console.log('🚀 Creating super admin user...');

    // Check if any admin already exists
    const existingAdmins = await prisma.admin.count();
    if (existingAdmins > 0) {
      console.log('❌ Admin users already exist. Super admin setup skipped.');
      console.log('   Use the admin panel to create additional admin users.');
      return {
        success: false,
        message: 'Admin users already exist',
        skipped: true
      };
    }

    // Default super admin credentials
    const superAdminData = {
      email: process.env.SUPER_ADMIN_EMAIL || 'admin@example.com',
      username: process.env.SUPER_ADMIN_USERNAME || 'superadmin',
      name: process.env.SUPER_ADMIN_NAME || 'Super Administrator',
      password: process.env.SUPER_ADMIN_PASSWORD || 'ChangeMe123!',
      role: 'super_admin'
    };

    // Security warning for production
    if (!process.env.SUPER_ADMIN_PASSWORD && process.env.NODE_ENV === 'production') {
      console.error('❌ SECURITY WARNING: SUPER_ADMIN_PASSWORD environment variable must be set in production!');
      console.error('   Please set SUPER_ADMIN_PASSWORD before running this script.');
      return {
        success: false,
        message: 'Missing required environment variables for production',
        error: 'SUPER_ADMIN_PASSWORD required in production'
      };
    }

    // Hash the password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(superAdminData.password, saltRounds);

    // Create the super admin
    const superAdmin = await prisma.admin.create({
      data: {
        email: superAdminData.email.toLowerCase(),
        username: superAdminData.username.toLowerCase(),
        name: superAdminData.name,
        password: hashedPassword,
        role: superAdminData.role,
        isActive: true
      }
    });

    // Log the creation activity
    await prisma.adminActivityLog.create({
      data: {
        adminId: superAdmin.id,
        action: 'SUPER_ADMIN_CREATED',
        details: JSON.stringify({
          message: 'Initial super admin user created during setup',
          createdBy: 'system'
        })
      }
    });

    console.log('✅ Super admin created successfully!');
    console.log('');
    console.log('📧 Email:', superAdminData.email);
    console.log('👤 Username:', superAdminData.username);
    if (!process.env.SUPER_ADMIN_PASSWORD) {
      console.log('🔑 Password:', superAdminData.password);
      console.log('');
      console.log('⚠️  IMPORTANT: Please change the default password immediately!');
    }
    console.log('');

    return {
      success: true,
      message: 'Super admin created successfully',
      admin: {
        id: superAdmin.id,
        email: superAdmin.email,
        username: superAdmin.username,
        name: superAdmin.name,
        role: superAdmin.role
      }
    };

  } catch (error) {
    console.error('❌ Failed to create super admin:', error.message);
    logger.error('Super admin creation failed', {
      error: error.message,
      stack: error.stack
    });
    
    return {
      success: false,
      message: 'Failed to create super admin',
      error: error.message
    };
  } finally {
    await prisma.$disconnect();
  }
}

// Run the script if called directly
if (require.main === module) {
  createSuperAdmin()
    .then((result) => {
      if (result.success) {
        console.log('🎉 Setup completed successfully!');
        process.exit(0);
      } else if (result.skipped) {
        process.exit(0);
      } else {
        console.error('💥 Setup failed!');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Unexpected error during setup:', error);
      process.exit(1);
    });
}

module.exports = createSuperAdmin;