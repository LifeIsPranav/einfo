const { prisma } = require('../config/database');
const logger = require('../utils/logger');

/**
 * Simple analytics service for tracking views and clicks
 */
class SimpleAnalytics {
  /**
   * Increment profile view count
   * @param {string} username - The username of the profile being viewed
   */
  async incrementProfileView(username) {
    try {
      await prisma.user.update({
        where: { username },
        data: {
          totalViews: {
            increment: 1
          }
        }
      });
    } catch (error) {
      logger.error('Failed to increment profile view', {
        error: error.message,
        stack: error.stack,
        username: username
      });
      // Silent fail - don't break the main flow
    }
  }

  /**
   * Increment click count for a user
   * @param {string} username - The username of the profile owner
   */
  async incrementClick(username) {
    try {
      await prisma.user.update({
        where: { username },
        data: {
          totalClicks: {
            increment: 1
          }
        }
      });
    } catch (error) {
      logger.error('Failed to increment click', {
        error: error.message,
        stack: error.stack,
        username: username
      });
      // Silent fail - don't break the main flow
    }
  }

  /**
   * Get analytics for a user
   * @param {string} userId - The user ID
   */
  async getUserAnalytics(userId) {
    try {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: {
          totalViews: true,
          totalClicks: true
        }
      });
      
      return {
        totalViews: user?.totalViews || 0,
        totalClicks: user?.totalClicks || 0
      };
    } catch (error) {
      logger.error('Failed to get user analytics', {
        error: error.message,
        stack: error.stack,
        userId: userId
      });
      return {
        totalViews: 0,
        totalClicks: 0
      };
    }
  }
}

module.exports = new SimpleAnalytics();
