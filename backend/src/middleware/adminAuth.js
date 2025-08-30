const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Admin authentication middleware
 */
const adminAuth = async (req, res, next) => {
  try {
    const authHeader = req.header('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No valid token provided.'
      });
    }

    const token = authHeader.replace('Bearer ', '');

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback_secret');
      
      // Check if it's an admin token
      if (!decoded.adminId || decoded.type !== 'admin') {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Admin authentication required.'
        });
      }

      // Check if admin exists and is active
      const admin = await prisma.admin.findUnique({
        where: { id: decoded.adminId },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          role: true,
          isActive: true
        }
      });

      if (!admin || !admin.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Access denied. Admin account not found or inactive.'
        });
      }

      // Add admin info to request
      req.admin = {
        adminId: admin.id,
        email: admin.email,
        name: admin.name,
        username: admin.username,
        role: admin.role
      };

      next();
    } catch (jwtError) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. Invalid token.'
      });
    }
  } catch (error) {
    logger.error('Admin auth middleware error', {
      error: error.message,
      stack: error.stack
    });
    
    return res.status(500).json({
      success: false,
      message: 'Internal server error during authentication'
    });
  }
};

/**
 * Super admin only middleware
 */
const superAdminOnly = (req, res, next) => {
  if (req.admin.role !== 'super_admin') {
    return res.status(403).json({
      success: false,
      message: 'Access denied. Super admin privileges required.'
    });
  }
  next();
};

module.exports = {
  adminAuth,
  superAdminOnly
};
