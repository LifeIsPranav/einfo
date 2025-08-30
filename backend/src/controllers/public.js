const { prisma } = require("../config/database");
const emailService = require("../services/email");
const logger = require("../utils/logger");

class PublicController {
  /**
   * Get public profile by username
   */
  async getPublicProfile(req, res, next) {
    try {
      const { username } = req.params;

      const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
        include: {
          profile: true,
          links: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
          portfolio: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
            include: {
              images: {
                orderBy: { displayOrder: "asc" },
              },
            },
          },
          experiences: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
            include: {
              projects: {
                orderBy: { displayOrder: "asc" },
              },
            },
          },
          education: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
          achievements: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
          extracurriculars: {
            where: { isActive: true },
            orderBy: { displayOrder: "asc" },
          },
          _count: {
            select: {
              receivedStars: true,
            },
          },
        },
      });

      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      // Track profile view with simple analytics
      try {
        const simpleAnalytics = require('../services/simpleAnalytics');
        await simpleAnalytics.incrementProfileView(username);
      } catch (error) {
        logger.error("Error tracking profile view", {
          error: error.message,
          stack: error.stack,
          username: username,
          method: 'incrementProfileView'
        });
        // Continue execution even if tracking fails
      }

      // Check if profile sections should be shown
      const showLinks = user.profile?.showLinks ?? true;
      const showExperience = user.profile?.showExperience ?? true;
      const showPortfolio = user.profile?.showPortfolio ?? true;
      const showEducation = user.profile?.showEducation ?? true;
      const showAchievements = user.profile?.showAchievements ?? true;
      const showExtracurriculars = user.profile?.showExtracurriculars ?? true;
      const showTitles = user.profile?.showTitles ?? true;

      // Transform data to match frontend expectations
      const profileData = {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          avatar: user.profile?.profileImageUrl || user.avatarUrl || "",
          instantMessage: user.instantMessageBody || "",
        },
        profile: {
          name: user.name,
          jobTitle: showTitles ? (user.profile?.jobTitle || "") : "",
          bio: user.profile?.bio || "",
          email: user.profile?.email || "",
          website: user.profile?.website || "",
          location: user.profile?.location || "",
          profileImage: user.profile?.profileImageUrl || user.avatarUrl || "",
          resumeUrl: user.profile?.resumeUrl || "",
          skills: user.profile?.skills || [],
        },
        visibilitySettings: {
          showLinks,
          showExperience,
          showPortfolio,
          showEducation,
          showAchievements,
          showExtracurriculars,
          showTitles,
        },
        links: showLinks ? user.links.map(link => ({
          id: link.id,
          title: link.title,
          description: link.description || "",
          url: link.url,
          iconName: link.iconName || "Link",
          imageUrl: link.imageUrl || "",
          projectDetails: link.projectDetails || "",
          order: link.displayOrder,
        })) : [],
        portfolio: showPortfolio ? user.portfolio.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || "",
          category: project.category || "",
          url: project.url || "",
          iconName: project.iconName || "FolderOpen",
          images: project.images.map(img => ({
            id: img.id,
            url: img.url,
            title: img.title || "",
            description: img.description || "",
          })),
          order: project.displayOrder,
        })) : [],
        experiences: showExperience ? user.experiences.map(exp => ({
          id: exp.id,
          company: exp.company,
          position: exp.position,
          duration: exp.duration || "Duration not specified", // Use duration field directly
          startDate: exp.startDate?.toISOString() || null,
          endDate: exp.endDate?.toISOString() || null,
          location: exp.location || "",
          description: exp.description || "",
          iconName: exp.iconName || "Building",
          achievements: exp.achievements || [],
          projects: exp.projects.map(project => ({
            id: project.id,
            title: project.title,
            description: project.description || "",
            technologies: project.technologies || [],
          })),
          order: exp.displayOrder,
        })) : [],
        education: showEducation ? user.education.map(edu => ({
          id: edu.id,
          institution: edu.institution,
          degree: edu.degree,
          duration: edu.duration,
          startDate: edu.startDate?.toISOString() || null,
          endDate: edu.endDate?.toISOString() || null,
          location: edu.location || "",
          description: edu.description || "",
          educationType: edu.educationType,
          gpa: edu.gpa || "",
          achievements: edu.achievements || [],
          courses: edu.courses || [],
          iconName: edu.iconName || "GraduationCap",
          imageUrl: edu.imageUrl || "",
          websiteUrl: edu.websiteUrl || "",
          order: edu.displayOrder,
        })) : [],
        achievements: showAchievements ? user.achievements.map(ach => ({
          id: ach.id,
          title: ach.title,
          organization: ach.organization,
          duration: ach.duration,
          startDate: ach.startDate?.toISOString() || null,
          endDate: ach.endDate?.toISOString() || null,
          location: ach.location || "",
          description: ach.description || "",
          type: ach.type,
          skillsInvolved: ach.skillsInvolved || [],
          keyPoints: ach.keyPoints || [],
          iconName: ach.iconName || "Trophy",
          imageUrl: ach.imageUrl || "",
          websiteUrl: ach.websiteUrl || "",
          order: ach.displayOrder,
        })) : [],
        extracurriculars: showExtracurriculars ? user.extracurriculars.map(ext => ({
          id: ext.id,
          activityName: ext.activityName,
          organization: ext.organization,
          duration: ext.duration,
          startDate: ext.startDate?.toISOString() || null,
          endDate: ext.endDate?.toISOString() || null,
          location: ext.location || "",
          role: ext.role || "",
          description: ext.description || "",
          type: ext.type,
          responsibilities: ext.responsibilities || [],
          achievements: ext.achievements || [],
          skillsDeveloped: ext.skillsDeveloped || [],
          iconName: ext.iconName || "Users",
          imageUrl: ext.imageUrl || "",
          websiteUrl: ext.websiteUrl || "",
          order: ext.displayOrder,
        })) : [],
        stats: {
          stars: user._count.receivedStars,
        },
      };

      res.json({
        success: true,
        message: "Profile retrieved successfully",
        data: profileData,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Send message to profile owner
   */
  async sendMessage(req, res, next) {
    try {
      const { username } = req.params;
      const { message, senderEmail, senderName } = req.body;

      if (!message || !senderEmail) {
        return res.status(400).json({
          success: false,
          message: "Message and sender email are required",
        });
      }

      const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
        select: {
          id: true,
          email: true,
          name: true,
          username: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      // Send email using the email service
      await emailService.sendMessage(senderEmail, user.email, message);

      res.json({
        success: true,
        message: "Message sent successfully",
      });
    } catch (error) {
      logger.error("Error sending message", {
        error: error.message,
        stack: error.stack,
        username: req.params.username,
        senderEmail: req.body.senderEmail
      });
      res.status(500).json({
        success: false,
        message: "Failed to send message",
      });
    }
  }

  /**
   * Star a profile
   */
  async starProfile(req, res, next) {
    try {
      const { username } = req.params;
      const { visitorIp } = req.body;

      const user = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
        select: {
          id: true,
          isActive: true,
        },
      });

      if (!user || !user.isActive) {
        return res.status(404).json({
          success: false,
          message: "Profile not found",
        });
      }

      // Check if this IP has already starred this profile
      const existingStar = await prisma.profileStar.findFirst({
        where: {
          userId: user.id,
          visitorIp: visitorIp || req.ip,
        },
      });

      if (existingStar) {
        return res.status(400).json({
          success: false,
          message: "You have already starred this profile",
        });
      }

      // Create star record
      await prisma.profileStar.create({
        data: {
          userId: user.id,
          visitorIp: visitorIp || req.ip,
        },
      });

      // Get updated star count
      const starCount = await prisma.profileStar.count({
        where: { userId: user.id },
      });

      res.json({
        success: true,
        message: "Profile starred successfully",
        data: {
          starCount,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Search profiles
   */
  async searchProfiles(req, res, next) {
    try {
      const { 
        q, 
        skills, 
        location, 
        jobTitle, 
        page = 1, 
        limit = 20 
      } = req.query;

      const offset = (page - 1) * limit;
      const searchConditions = {
        isActive: true,
        profile: {
          isNot: null,
        },
      };

      // Build search conditions
      if (q) {
        searchConditions.OR = [
          { name: { contains: q, mode: 'insensitive' } },
          { username: { contains: q, mode: 'insensitive' } },
          { profile: { bio: { contains: q, mode: 'insensitive' } } },
          { profile: { jobTitle: { contains: q, mode: 'insensitive' } } },
        ];
      }

      if (skills) {
        const skillsArray = skills.split(',').map(skill => skill.trim());
        searchConditions.profile.skills = {
          hasSome: skillsArray,
        };
      }

      if (location) {
        searchConditions.profile.location = {
          contains: location,
          mode: 'insensitive',
        };
      }

      if (jobTitle) {
        searchConditions.profile.jobTitle = {
          contains: jobTitle,
          mode: 'insensitive',
        };
      }

      const users = await prisma.user.findMany({
        where: searchConditions,
        include: {
          profile: {
            select: {
              jobTitle: true,
              bio: true,
              location: true,
              skills: true,
              profileImageUrl: true,
              showLinks: true,
              showExperience: true,
              showPortfolio: true,
              showEducation: true,
            },
          },
          _count: {
            select: {
              receivedStars: true,
            },
          },
        },
        skip: offset,
        take: parseInt(limit),
        orderBy: {
          receivedStars: {
            _count: 'desc',
          },
        },
      });

      const totalCount = await prisma.user.count({
        where: searchConditions,
      });

      const profiles = users.map(user => ({
        id: user.id,
        name: user.name,
        username: user.username,
        jobTitle: user.profile?.jobTitle || "",
        bio: user.profile?.bio || "",
        location: user.profile?.location || "",
        skills: user.profile?.skills || [],
        profileImage: user.profile?.profileImageUrl || user.avatarUrl || "",
        starCount: user._count.receivedStars,
      }));

      res.json({
        success: true,
        message: "Search results retrieved successfully",
        data: {
          profiles,
          pagination: {
            page: parseInt(page),
            limit: parseInt(limit),
            total: totalCount,
            pages: Math.ceil(totalCount / limit),
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Track profile view
   */
  async trackProfileView(req, userId) {
    try {
      const visitorIp = req.ip || req.connection.remoteAddress;
      const userAgent = req.get("User-Agent");
      const referrer = req.get("Referrer");

      await prisma.profileAnalytic.create({
        data: {
          userId,
          visitorIp,
          userAgent,
          referrer,
          eventType: "profile_view",
          metadata: {
            timestamp: new Date().toISOString(),
            path: req.originalUrl,
          },
        },
      });
    } catch (error) {
      logger.error("Error tracking profile view", {
        error: error.message,
        stack: error.stack,
        userId: req.params.userId,
        path: req.originalUrl
      });
      // Don't throw error - analytics shouldn't break the main flow
    }
  }

  /**
   * Track a click for simple analytics
   */
  async trackClick(req, res, next) {
    try {
      const { username } = req.params;
      
      if (!username) {
        return res.status(400).json({
          success: false,
          message: "Username is required",
        });
      }

      const simpleAnalytics = require('../services/simpleAnalytics');
      await simpleAnalytics.incrementClick(username);

      res.json({
        success: true,
        message: "Click tracked successfully",
      });
    } catch (error) {
      logger.error("Error tracking click", {
        error: error.message,
        stack: error.stack,
        username: req.params.username,
        method: 'incrementClick'
      });
      res.status(500).json({
        success: false,
        message: "Failed to track click",
      });
    }
  }
}

module.exports = new PublicController();
