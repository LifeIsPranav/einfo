const { prisma } = require('../config/database');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const logger = require('../utils/logger');

class AdminController {
  /**
   * Admin login
   */
  async login(req, res, next) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email and password are required'
        });
      }

      // Find admin by email
      const admin = await prisma.admin.findUnique({
        where: { email: email.toLowerCase() }
      });

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Verify password
      const isValidPassword = await bcrypt.compare(password, admin.password);
      if (!isValidPassword) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Update last login
      await prisma.admin.update({
        where: { id: admin.id },
        data: { lastLogin: new Date() }
      });

      // Log admin login
      await this.logActivity(admin.id, 'login', null, null, req);

      // Generate JWT token
      const token = jwt.sign(
        { 
          adminId: admin.id, 
          email: admin.email,
          role: admin.role,
          type: 'admin'
        },
        process.env.JWT_SECRET || 'fallback_secret',
        { expiresIn: '8h' }
      );

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          admin: {
            id: admin.id,
            email: admin.email,
            name: admin.name,
            username: admin.username,
            role: admin.role
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin dashboard data
   */
  async getDashboard(req, res, next) {
    try {
      const adminId = req.admin.adminId;

      // Get system stats
      const totalUsers = await prisma.user.count();
      const activeUsers = await prisma.user.count({
        where: { isActive: true }
      });
      const totalProfiles = await prisma.userProfile.count();
      
      // Get recent activities (last 10)
      const recentActivities = await prisma.adminActivityLog.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          admin: {
            select: { name: true, email: true }
          }
        }
      });

      // Log dashboard access
      await this.logActivity(adminId, 'view_dashboard', null, null, req);

      res.json({
        success: true,
        data: {
          stats: {
            totalUsers,
            activeUsers,
            totalProfiles,
            inactiveUsers: totalUsers - activeUsers
          },
          recentActivities
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get paginated list of users
   */
  async getUsers(req, res, next) {
    try {
      const adminId = req.admin.adminId;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100); // Max 100 per page, default 10
      const search = req.query.search || '';
      const status = req.query.status; // 'active', 'inactive', or undefined for all

      const skip = (page - 1) * limit;

      // Build where clause
      const whereClause = {
        AND: [
          search ? {
            OR: [
              { name: { contains: search, mode: 'insensitive' } },
              { email: { contains: search, mode: 'insensitive' } },
              { username: { contains: search, mode: 'insensitive' } }
            ]
          } : {},
          status ? { isActive: status === 'active' } : {}
        ]
      };

      // Get total count for pagination
      const totalUsers = await prisma.user.count({ where: whereClause });

      // Get users with pagination
      const users = await prisma.user.findMany({
        where: whereClause,
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          isActive: true,
          emailVerified: true,
          totalViews: true,
          totalClicks: true,
          createdAt: true,
          profile: {
            select: {
              profileImageUrl: true,
              jobTitle: true,
              location: true
            }
          },
          _count: {
            select: {
              links: true,
              portfolio: true,
              experiences: true,
              receivedStars: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      });

      // Log users view
      await this.logActivity(adminId, 'view_users', null, null, req, {
        page,
        limit,
        search,
        status,
        resultCount: users.length
      });

      const totalPages = Math.ceil(totalUsers / limit);

      res.json({
        success: true,
        data: {
          users,
          pagination: {
            currentPage: page,
            totalPages,
            totalUsers,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed user information
   */
  async getUserDetails(req, res, next) {
    try {
      const adminId = req.admin.adminId;
      const userId = req.params.userId;

      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          links: { where: { isActive: true } },
          portfolio: {
            where: { isActive: true },
            include: { images: true }
          },
          experiences: { where: { isActive: true } },
          education: { where: { isActive: true } },
          achievements: { where: { isActive: true } },
          extracurriculars: { where: { isActive: true } },
          analytics: {
            orderBy: { createdAt: 'desc' },
            take: 100
          },
          receivedStars: true
        }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Log user details view
      await this.logActivity(adminId, 'view_user_details', userId, null, req);

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Toggle user active status
   */
  async toggleUserStatus(req, res, next) {
    try {
      const adminId = req.admin.adminId;
      const userId = req.params.userId;
      const { isActive } = req.body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: { isActive },
        select: {
          id: true,
          name: true,
          email: true,
          username: true,
          isActive: true
        }
      });

      // Log the action
      await this.logActivity(
        adminId, 
        isActive ? 'activate_user' : 'deactivate_user', 
        userId, 
        null, 
        req,
        { previousStatus: !isActive, newStatus: isActive }
      );

      res.json({
        success: true,
        message: `User ${isActive ? 'activated' : 'deactivated'} successfully`,
        data: { user }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create new admin (only super_admin can do this)
   */
  async createAdmin(req, res, next) {
    try {
      const creatorId = req.admin.adminId;
      const creatorRole = req.admin.role;
      const { email, username, name, password, role = 'admin' } = req.body;

      // Only super_admin can create other admins
      if (creatorRole !== 'super_admin') {
        return res.status(403).json({
          success: false,
          message: 'Only super admins can create new admins'
        });
      }

      // Validate required fields
      if (!email || !username || !name || !password) {
        return res.status(400).json({
          success: false,
          message: 'Email, username, name, and password are required'
        });
      }

      // Check if admin already exists
      const existingAdmin = await prisma.admin.findFirst({
        where: {
          OR: [
            { email: email.toLowerCase() },
            { username: username.toLowerCase() }
          ]
        }
      });

      if (existingAdmin) {
        return res.status(400).json({
          success: false,
          message: 'Admin with this email or username already exists'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create admin
      const newAdmin = await prisma.admin.create({
        data: {
          email: email.toLowerCase(),
          username: username.toLowerCase(),
          name,
          password: hashedPassword,
          role,
          createdByAdminId: creatorId
        },
        select: {
          id: true,
          email: true,
          username: true,
          name: true,
          role: true,
          isActive: true,
          createdAt: true
        }
      });

      // Log admin creation
      await this.logActivity(creatorId, 'create_admin', null, newAdmin.id, req, {
        newAdminEmail: newAdmin.email,
        newAdminRole: newAdmin.role
      });

      res.status(201).json({
        success: true,
        message: 'Admin created successfully',
        data: { admin: newAdmin }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get admin activity logs
   */
  async getActivityLogs(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);
      const action = req.query.action;
      const adminId = req.query.adminId;

      const skip = (page - 1) * limit;

      const whereClause = {
        AND: [
          action ? { action } : {},
          adminId ? { adminId } : {}
        ]
      };

      const totalLogs = await prisma.adminActivityLog.count({ where: whereClause });

      const logs = await prisma.adminActivityLog.findMany({
        where: whereClause,
        include: {
          admin: {
            select: { name: true, email: true }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      });

      const totalPages = Math.ceil(totalLogs / limit);

      res.json({
        success: true,
        data: {
          logs,
          pagination: {
            currentPage: page,
            totalPages,
            totalLogs,
            hasNext: page < totalPages,
            hasPrev: page > 1
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Admin logout
   */
  async logout(req, res, next) {
    try {
      const adminId = req.admin.adminId;

      // Log logout
      await this.logActivity(adminId, 'logout', null, null, req);

      res.json({
        success: true,
        message: 'Logged out successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper method to log admin activities
   */
  async logActivity(adminId, action, targetUserId = null, targetAdminId = null, req = null, additionalDetails = null) {
    try {
      const details = {
        ...additionalDetails,
        timestamp: new Date().toISOString()
      };

      // Create the new activity log
      await prisma.adminActivityLog.create({
        data: {
          adminId,
          action,
          targetUserId,
          targetAdminId,
          details: JSON.stringify(details),
          ipAddress: req?.ip || req?.connection?.remoteAddress,
          userAgent: req?.get('User-Agent')
        }
      });

      // Keep only the 10 most recent activities to save storage
      const totalActivities = await prisma.adminActivityLog.count();
      
      if (totalActivities > 10) {
        // Get the IDs of activities to keep (10 most recent)
        const activitiesToKeep = await prisma.adminActivityLog.findMany({
          select: { id: true },
          orderBy: { createdAt: 'desc' },
          take: 10
        });

        const idsToKeep = activitiesToKeep.map(activity => activity.id);

        // Delete all activities except the 10 most recent
        await prisma.adminActivityLog.deleteMany({
          where: {
            id: {
              notIn: idsToKeep
            }
          }
        });

        logger.info('Admin activity cleanup completed', {
          totalBefore: totalActivities,
          kept: 10,
          deleted: totalActivities - 10
        });
      }
    } catch (error) {
      logger.error('Failed to log admin activity', {
        error: error.message,
        adminId,
        action
      });
    }
  }
}

const adminController = new AdminController();

// Bind all methods to preserve 'this' context
Object.getOwnPropertyNames(AdminController.prototype).forEach(methodName => {
  if (methodName !== 'constructor' && typeof adminController[methodName] === 'function') {
    adminController[methodName] = adminController[methodName].bind(adminController);
  }
});

module.exports = adminController;
