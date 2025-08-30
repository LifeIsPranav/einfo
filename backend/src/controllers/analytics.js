const { prisma } = require("../config/database");
const logger = require("../utils/logger");

class AnalyticsController {
  /**
   * Get simple analytics for dashboard
   */
  async getSimpleAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      
      const simpleAnalytics = require('../services/simpleAnalytics');
      const stats = await simpleAnalytics.getUserAnalytics(userId);

      res.json({
        success: true,
        data: {
          totalViews: stats.totalViews,
          totalClicks: stats.totalClicks,
        },
      });
    } catch (error) {
      logger.error("Error getting simple analytics", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id
      });
      res.status(500).json({
        success: false,
        message: "Failed to get analytics",
        data: {
          totalViews: 0,
          totalClicks: 0,
        },
      });
    }
  }

  /**
   * Get profile analytics (legacy - keeping for compatibility)
   */
  async getProfileAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const { timeRange = '30d' } = req.query;

      let startDate = new Date();
      switch (timeRange) {
        case '7d':
          startDate.setDate(startDate.getDate() - 7);
          break;
        case '30d':
          startDate.setDate(startDate.getDate() - 30);
          break;
        case '90d':
          startDate.setDate(startDate.getDate() - 90);
          break;
        case '1y':
          startDate.setFullYear(startDate.getFullYear() - 1);
          break;
        default:
          startDate.setDate(startDate.getDate() - 30);
      }

      // Get total profile views
      const totalViews = await prisma.profileAnalytic.count({
        where: {
          userId,
          eventType: 'profile_view',
          createdAt: {
            gte: startDate,
          },
        },
      });

      // Get unique visitors
      const uniqueVisitors = await prisma.profileAnalytic.groupBy({
        by: ['visitorIp'],
        where: {
          userId,
          eventType: 'profile_view',
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          visitorIp: true,
        },
      });

      // Get daily views
      const dailyViews = await prisma.$queryRaw`
        SELECT 
          DATE(created_at) as date,
          COUNT(*) as views
        FROM profile_analytics
        WHERE user_id = ${userId}
          AND event_type = 'profile_view'
          AND created_at >= ${startDate}
        GROUP BY DATE(created_at)
        ORDER BY date ASC
      `;

      // Get top referrers
      const topReferrers = await prisma.profileAnalytic.groupBy({
        by: ['referrer'],
        where: {
          userId,
          eventType: 'profile_view',
          createdAt: {
            gte: startDate,
          },
          referrer: {
            not: null,
          },
        },
        _count: {
          referrer: true,
        },
        orderBy: {
          _count: {
            referrer: 'desc',
          },
        },
        take: 10,
      });

      // Get user agent info (browsers/devices)
      const userAgents = await prisma.profileAnalytic.groupBy({
        by: ['userAgent'],
        where: {
          userId,
          eventType: 'profile_view',
          createdAt: {
            gte: startDate,
          },
          userAgent: {
            not: null,
          },
        },
        _count: {
          userAgent: true,
        },
        orderBy: {
          _count: {
            userAgent: 'desc',
          },
        },
        take: 10,
      });

      res.json({
        success: true,
        message: "Profile analytics retrieved successfully",
        data: {
          totalViews,
          uniqueVisitors: uniqueVisitors.length,
          dailyViews: dailyViews.map(item => ({
            date: item.date,
            views: parseInt(item.views),
          })),
          topReferrers: topReferrers.map(item => ({
            referrer: item.referrer,
            count: item._count.referrer,
          })),
          userAgents: userAgents.map(item => ({
            userAgent: item.userAgent,
            count: item._count.userAgent,
          })),
          timeRange,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile views with pagination
   */
  async getProfileViews(req, res, next) {
    try {
      const userId = req.user.id;
      const { page = 1, limit = 20 } = req.query;
      const offset = (page - 1) * limit;

      const views = await prisma.profileAnalytic.findMany({
        where: {
          userId,
          eventType: 'profile_view',
        },
        select: {
          id: true,
          visitorIp: true,
          userAgent: true,
          referrer: true,
          createdAt: true,
          metadata: true,
        },
        orderBy: {
          createdAt: 'desc',
        },
        skip: offset,
        take: parseInt(limit),
      });

      const totalViews = await prisma.profileAnalytic.count({
        where: {
          userId,
          eventType: 'profile_view',
        },
      });

      res.json({
        success: true,
        message: "Profile views retrieved successfully",
        data: {
          views,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalViews,
            pages: Math.ceil(totalViews / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get profile summary analytics
   */
  async getProfileSummary(req, res, next) {
    try {
      const userId = req.user.id;

      // Get total profile views all time
      const totalViews = await prisma.profileAnalytic.count({
        where: {
          userId,
          eventType: 'profile_view',
        },
      });

      // Get views from last 30 days
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const recentViews = await prisma.profileAnalytic.count({
        where: {
          userId,
          eventType: 'profile_view',
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
      });

      // Get views from previous 30 days for comparison
      const sixtyDaysAgo = new Date();
      sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

      const previousViews = await prisma.profileAnalytic.count({
        where: {
          userId,
          eventType: 'profile_view',
          createdAt: {
            gte: sixtyDaysAgo,
            lt: thirtyDaysAgo,
          },
        },
      });

      // Calculate growth percentage
      const growth = previousViews > 0 
        ? ((recentViews - previousViews) / previousViews) * 100 
        : recentViews > 0 ? 100 : 0;

      // Get unique visitors in last 30 days
      const uniqueVisitors = await prisma.profileAnalytic.groupBy({
        by: ['visitorIp'],
        where: {
          userId,
          eventType: 'profile_view',
          createdAt: {
            gte: thirtyDaysAgo,
          },
        },
        _count: {
          visitorIp: true,
        },
      });

      // Get profile completeness score
      const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
          profile: true,
          links: { where: { isActive: true } },
          portfolio: { where: { isActive: true } },
          experiences: { where: { isActive: true } },
          education: { where: { isActive: true } },
        },
      });

      let completenessScore = 0;
      if (user) {
        if (user.name) completenessScore += 10;
        if (user.username) completenessScore += 10;
        if (user.profile?.bio) completenessScore += 15;
        if (user.profile?.jobTitle) completenessScore += 10;
        if (user.profile?.location) completenessScore += 5;
        if (user.profile?.profileImageUrl) completenessScore += 10;
        if (user.links.length > 0) completenessScore += 10;
        if (user.portfolio.length > 0) completenessScore += 10;
        if (user.experiences.length > 0) completenessScore += 10;
        if (user.education.length > 0) completenessScore += 10;
      }

      res.json({
        success: true,
        message: "Profile summary retrieved successfully",
        data: {
          totalViews,
          recentViews,
          growth: Math.round(growth * 100) / 100,
          uniqueVisitors: uniqueVisitors.length,
          completenessScore,
          profileStats: {
            linksCount: user?.links.length || 0,
            portfolioCount: user?.portfolio.length || 0,
            experiencesCount: user?.experiences.length || 0,
            educationCount: user?.education.length || 0,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AnalyticsController();
