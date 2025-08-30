const { prisma } = require("../config/database");
const logger = require("../utils/logger");

class ProfileController {
  /**
   * Get current user's profile
   */
  async getMyProfile(req, res, next) {
    try {
      const userId = req.user.id;

      const user = await prisma.user.findUnique({
        where: { id: userId },
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
        },
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: "User not found",
        });
      }

      // Transform data to match frontend expectations
      const profileData = {
        user: {
          id: user.id,
          name: user.name,
          username: user.username,
          email: user.email,
          avatar: user.avatarUrl,
          instant_message_subject: user.instantMessageSubject,
          instant_message_body: user.instantMessageBody,
        },
        profile: {
          name: user.name,
          jobTitle: user.profile?.jobTitle || "",
          bio: user.profile?.bio || "",
          email: user.profile?.email || "",
          website: user.profile?.website || "",
          location: user.profile?.location || "",
          profileImage: user.profile?.profileImageUrl || user.avatarUrl || "",
          resumeUrl: user.profile?.resumeUrl || "",
          skills: user.profile?.skills || [],
        },
        visibilitySettings: {
          showLinks: user.profile?.showLinks ?? true,
          showExperience: user.profile?.showExperience ?? true,
          showPortfolio: user.profile?.showPortfolio ?? true,
          showEducation: user.profile?.showEducation ?? true,
          showAchievements: user.profile?.showAchievements ?? true,
          showExtracurriculars: user.profile?.showExtracurriculars ?? true,
          showTitles: user.profile?.showTitles ?? true,
        },
        links: user.links.map(link => ({
          id: link.id,
          title: link.title,
          description: link.description || "",
          url: link.url,
          iconName: link.iconName || "Link",
          imageUrl: link.imageUrl || "",
          projectDetails: link.projectDetails || "",
          order: link.displayOrder,
        })),
        portfolio: user.portfolio.map(project => ({
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
        })),
        experiences: user.experiences.map(exp => ({
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
        })),
        education: user.education.map(edu => ({
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
        })),
        achievements: user.achievements.map(ach => ({
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
        })),
        extracurriculars: user.extracurriculars.map(ext => ({
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
        })),
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

      // Track profile view
      // await this.trackProfileView(req, user.id);

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
          jobTitle: user.profile?.jobTitle || "",
          bio: user.profile?.bio || "",
          website: user.profile?.website || "",
          location: user.profile?.location || "",
          profileImage: user.profile?.profileImageUrl || user.avatarUrl || "",
          resumeUrl: user.profile?.resumeUrl || "",
          skills: user.profile?.skills || [],
        },
        visibilitySettings: {
          showLinks: user.profile?.showLinks ?? true,
          showExperience: user.profile?.showExperience ?? true,
          showPortfolio: user.profile?.showPortfolio ?? true,
          showEducation: user.profile?.showEducation ?? true,
          showAchievements: user.profile?.showAchievements ?? true,
          showExtracurriculars: user.profile?.showExtracurriculars ?? true,
          showTitles: user.profile?.showTitles ?? true,
        },
        links: user.profile?.showLinks ? user.links.map(link => ({
          id: link.id,
          title: link.title,
          description: link.description || "",
          url: link.url,
          iconName: link.iconName || "Link",
          imageUrl: link.imageUrl || "",
          projectDetails: link.projectDetails || "",
          order: link.displayOrder,
        })) : [],
        portfolio: user.profile?.showPortfolio ? user.portfolio.map(project => ({
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
        experiences: user.profile?.showExperience ? user.experiences.map(exp => ({
          id: exp.id,
          company: exp.company,
          position: exp.position,
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
        education: user.profile?.showEducation ? user.education.map(edu => ({
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
        achievements: user.profile?.showAchievements ? user.achievements.map(ach => ({
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
        extracurriculars: user.profile?.showExtracurriculars ? user.extracurriculars.map(ext => ({
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
   * Update profile basic information
   */
  async updateProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        name,
        jobTitle,
        bio,
        email,
        website,
        location,
        skills,
        showLinks,
        showExperience,
        showPortfolio,
        showEducation,
        showTitles,
      } = req.body;

      // Update user name if provided
      if (name !== undefined) {
        await prisma.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      // Update or create profile
      const profileData = {};
      if (jobTitle !== undefined) profileData.jobTitle = jobTitle;
      if (bio !== undefined) profileData.bio = bio;
      if (email !== undefined) profileData.email = email;
      if (website !== undefined) profileData.website = website;
      if (location !== undefined) profileData.location = location;
      if (skills !== undefined) profileData.skills = skills;
      if (showLinks !== undefined) profileData.showLinks = showLinks;
      if (showExperience !== undefined) profileData.showExperience = showExperience;
      if (showPortfolio !== undefined) profileData.showPortfolio = showPortfolio;
      if (showEducation !== undefined) profileData.showEducation = showEducation;
      if (showTitles !== undefined) profileData.showTitles = showTitles;

      const profile = await prisma.userProfile.upsert({
        where: { userId },
        update: profileData,
        create: {
          userId,
          ...profileData,
        },
      });

      res.json({
        success: true,
        message: "Profile updated successfully",
        data: { profile },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update account settings
   */
  async updateAccount(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, username } = req.body;

      const updateData = {};
      if (name !== undefined) updateData.name = name;
      
      // Check username availability if provided
      if (username !== undefined) {
        const existingUser = await prisma.user.findUnique({
          where: { username: username.toLowerCase() },
        });

        if (existingUser && existingUser.id !== userId) {
          return res.status(409).json({
            success: false,
            message: "Username already taken",
          });
        }

        updateData.username = username.toLowerCase();
      }

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Account updated successfully",
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            avatar: user.avatarUrl,
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update instant message
   */
  async updateInstantMessage(req, res, next) {
    try {
      const userId = req.user.id;
      const { instant_message_subject, instant_message_body } = req.body;

      const updateData = {};
      if (instant_message_subject !== undefined) updateData.instantMessageSubject = instant_message_subject;
      if (instant_message_body !== undefined) updateData.instantMessageBody = instant_message_body;

      const user = await prisma.user.update({
        where: { id: userId },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Instant message updated successfully",
        data: {
          instantMessageSubject: user.instantMessageSubject,
          instantMessageBody: user.instantMessageBody,
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
        userId: req.user?.id,
        path: req.originalUrl
      });
      // Don't throw error - analytics shouldn't break the main flow
    }
  }

  /**
   * Update basic profile information
   */
  async updateBasicProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const { name, jobTitle, bio, email, website, location, profileImage, resumeUrl, skills } = req.body;

      // Update user profile
      const updatedProfile = await prisma.userProfile.upsert({
        where: { userId },
        update: {
          jobTitle: jobTitle || "",
          bio: bio || "",
          email: email || "",
          website: website || "",
          location: location || "",
          profileImageUrl: profileImage || "",
          resumeUrl: resumeUrl || "",
          skills: skills || [],
        },
        create: {
          userId,
          jobTitle: jobTitle || "",
          bio: bio || "",
          email: email || "",
          website: website || "",
          location: location || "",
          profileImageUrl: profileImage || "",
          resumeUrl: resumeUrl || "",
          skills: skills || [],
        },
      });

      // Update user name if provided
      if (name) {
        await prisma.user.update({
          where: { id: userId },
          data: { name },
        });
      }

      res.json({
        success: true,
        message: "Basic profile updated successfully",
        data: { profile: updatedProfile },
      });
    } catch (error) {
      logger.error("Error updating basic profile", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestBody: req.body
      });
      res.status(500).json({
        success: false,
        message: "Failed to update basic profile",
      });
    }
  }

  /**
   * Update visibility settings
   */
  async updateVisibilitySettings(req, res, next) {
    try {
      const userId = req.user.id;
      const { showLinks, showExperience, showPortfolio, showEducation, showTitles } = req.body;

      const updatedSettings = await prisma.userProfile.upsert({
        where: { userId },
        update: {
          showLinks: showLinks !== undefined ? showLinks : true,
          showExperience: showExperience !== undefined ? showExperience : true,
          showPortfolio: showPortfolio !== undefined ? showPortfolio : true,
          showEducation: showEducation !== undefined ? showEducation : true,
          showTitles: showTitles !== undefined ? showTitles : true,
        },
        create: {
          userId,
          showLinks: showLinks !== undefined ? showLinks : true,
          showExperience: showExperience !== undefined ? showExperience : true,
          showPortfolio: showPortfolio !== undefined ? showPortfolio : true,
          showEducation: showEducation !== undefined ? showEducation : true,
          showTitles: showTitles !== undefined ? showTitles : true,
        },
      });

      res.json({
        success: true,
        message: "Visibility settings updated successfully",
        data: { visibilitySettings: updatedSettings },
      });
    } catch (error) {
      logger.error("Error updating visibility settings", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestBody: req.body
      });
      res.status(500).json({
        success: false,
        message: "Failed to update visibility settings",
      });
    }
  }

  /**
   * Update links
   */
  async updateLinks(req, res, next) {
    try {
      const userId = req.user.id;
      const { links } = req.body;

      // Delete existing links
      await prisma.profileLink.deleteMany({
        where: { userId },
      });

      // Create new links
      if (links && links.length > 0) {
        // Filter out links with empty titles or URLs
        const validLinks = links.filter(link => 
          link.title && link.title.trim() !== "" && 
          link.url && link.url.trim() !== ""
        );
        
        if (validLinks.length > 0) {
          await prisma.profileLink.createMany({
            data: validLinks.map((link, index) => ({
              userId,
              title: link.title.trim(),
              description: link.description || "",
              url: link.url.trim(),
              iconName: link.iconName || "",
              imageUrl: link.imageUrl || "",
              projectDetails: link.projectDetails || "",
              displayOrder: index,
              isActive: true,
            })),
          });
        }
      }

      // Get updated links
      const updatedLinks = await prisma.profileLink.findMany({
        where: { userId, isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      res.json({
        success: true,
        message: "Links updated successfully",
        data: { links: updatedLinks },
      });
    } catch (error) {
      logger.error("Error updating links", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestBody: req.body,
        errorType: error.name
      });
      
      // Check if it's a validation error
      if (error.name === 'PrismaClientValidationError') {
        return res.status(400).json({
          success: false,
          message: "Invalid link data. Please ensure all links have valid titles and URLs.",
        });
      }
      
      res.status(500).json({
        success: false,
        message: "Failed to update links",
      });
    }
  }

  /**
   * Update experiences
   */
  async updateExperiences(req, res, next) {
    try {
      const userId = req.user.id;
      const { experiences } = req.body;

      // Delete existing experiences
      await prisma.workExperience.deleteMany({
        where: { userId },
      });

      // Create new experiences
      if (experiences && experiences.length > 0) {
        await prisma.workExperience.createMany({
          data: experiences.map((exp, index) => ({
            userId,
            company: exp.company,
            position: exp.position,
            duration: exp.duration || "Duration not specified", // Store duration as string
            startDate: exp.startDate,
            endDate: exp.endDate || null,
            location: exp.location || "",
            description: exp.description || "",
            iconName: exp.iconName || "",
            achievements: exp.achievements || [],
            displayOrder: index,
            isActive: true,
          })),
        });
      }

      // Get updated experiences
      const updatedExperiences = await prisma.workExperience.findMany({
        where: { userId, isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      res.json({
        success: true,
        message: "Experiences updated successfully",
        data: { experiences: updatedExperiences },
      });
    } catch (error) {
      logger.error("Error updating experiences", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestBody: req.body
      });
      res.status(500).json({
        success: false,
        message: "Failed to update experiences",
      });
    }
  }

  /**
   * Update portfolio
   */
  async updatePortfolio(req, res, next) {
    try {
      const userId = req.user.id;
      const { portfolio } = req.body;

      // Delete existing portfolio projects (cascade will delete images)
      await prisma.portfolioProject.deleteMany({
        where: { userId },
      });

      // Create new portfolio projects with images
      if (portfolio && portfolio.length > 0) {
        for (let i = 0; i < portfolio.length; i++) {
          const project = portfolio[i];
          
          // Create the project
          const createdProject = await prisma.portfolioProject.create({
            data: {
              userId,
              title: project.title,
              description: project.description || "",
              category: project.category || "",
              url: project.url || "",
              iconName: project.iconName || "",
              displayOrder: i,
              isActive: true,
            },
          });

          // Create project images if they exist
          if (project.images && project.images.length > 0) {
            await prisma.portfolioImage.createMany({
              data: project.images.map((image, imageIndex) => ({
                projectId: createdProject.id,
                url: image.url,
                title: image.title || "",
                description: image.description || "",
                displayOrder: imageIndex,
              })),
            });
          }
        }
      }

      // Get updated portfolio with images
      const updatedPortfolio = await prisma.portfolioProject.findMany({
        where: { userId, isActive: true },
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { displayOrder: "asc" },
      });

      // Format the response to match frontend expectations
      const formattedPortfolio = updatedPortfolio.map(project => ({
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
      }));

      res.json({
        success: true,
        message: "Portfolio updated successfully",
        data: { portfolio: formattedPortfolio },
      });
    } catch (error) {
      logger.error("Error updating portfolio", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestBody: req.body
      });
      res.status(500).json({
        success: false,
        message: "Failed to update portfolio",
      });
    }
  }

  /**
   * Update education
   */
  async updateEducation(req, res, next) {
    try {
      const userId = req.user.id;
      const { education } = req.body;

      // Delete existing education
      await prisma.education.deleteMany({
        where: { userId },
      });

      // Create new education entries
      if (education && education.length > 0) {
        await prisma.education.createMany({
          data: education.map((edu, index) => ({
            userId,
            institution: edu.institution,
            degree: edu.degree,
            duration: edu.duration,
            startDate: edu.startDate,
            endDate: edu.endDate || null,
            location: edu.location || "",
            description: edu.description || "",
            educationType: edu.educationType || "degree",
            gpa: edu.gpa || "",
            achievements: edu.achievements || [],
            courses: edu.courses || [],
            iconName: edu.iconName || "",
            imageUrl: edu.imageUrl || "",
            websiteUrl: edu.websiteUrl || "",
            displayOrder: index,
            isActive: true,
          })),
        });
      }

      // Get updated education
      const updatedEducation = await prisma.education.findMany({
        where: { userId, isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      res.json({
        success: true,
        message: "Education updated successfully",
        data: { education: updatedEducation },
      });
    } catch (error) {
      logger.error("Error updating education", {
        error: error.message,
        stack: error.stack,
        userId: req.user?.id,
        requestBody: req.body
      });
      res.status(500).json({
        success: false,
        message: "Failed to update education",
      });
    }
  }
}

module.exports = new ProfileController();
