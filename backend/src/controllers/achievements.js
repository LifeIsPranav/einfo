const { prisma } = require("../config/database");

class AchievementController {
  /**
   * Create a new achievement entry
   */
  async createAchievement(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        title,
        organization,
        duration,
        startDate,
        endDate,
        location,
        description,
        type,
        skillsInvolved,
        keyPoints,
        iconName,
        imageUrl,
        websiteUrl,
        displayOrder,
      } = req.body;

      // Get the next display order if not provided
      let order = displayOrder;
      if (order === undefined) {
        const lastAchievement = await prisma.achievement.findFirst({
          where: { userId },
          orderBy: { displayOrder: "desc" },
        });
        order = lastAchievement ? lastAchievement.displayOrder + 1 : 1;
      }

      const achievement = await prisma.achievement.create({
        data: {
          userId,
          title,
          organization,
          duration,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          location,
          description,
          type,
          skillsInvolved: skillsInvolved || [],
          keyPoints: keyPoints || [],
          iconName: iconName || "Trophy",
          imageUrl,
          websiteUrl,
          displayOrder: order,
          isActive: true,
        },
      });

      const formattedAchievement = {
        id: achievement.id,
        title: achievement.title,
        organization: achievement.organization,
        duration: achievement.duration,
        startDate: achievement.startDate?.toISOString() || null,
        endDate: achievement.endDate?.toISOString() || null,
        location: achievement.location || "",
        description: achievement.description || "",
        type: achievement.type,
        skillsInvolved: achievement.skillsInvolved || [],
        keyPoints: achievement.keyPoints || [],
        iconName: achievement.iconName || "Trophy",
        imageUrl: achievement.imageUrl || "",
        websiteUrl: achievement.websiteUrl || "",
        order: achievement.displayOrder,
      };

      res.status(201).json({
        success: true,
        message: "Achievement created successfully",
        data: { achievement: formattedAchievement },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all achievements for authenticated user
   */
  async getAchievements(req, res, next) {
    try {
      const userId = req.user.id;

      const achievements = await prisma.achievement.findMany({
        where: { userId, isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      const formattedAchievements = achievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        organization: achievement.organization,
        duration: achievement.duration,
        startDate: achievement.startDate?.toISOString() || null,
        endDate: achievement.endDate?.toISOString() || null,
        location: achievement.location || "",
        description: achievement.description || "",
        type: achievement.type,
        skillsInvolved: achievement.skillsInvolved || [],
        keyPoints: achievement.keyPoints || [],
        iconName: achievement.iconName || "Trophy",
        imageUrl: achievement.imageUrl || "",
        websiteUrl: achievement.websiteUrl || "",
        order: achievement.displayOrder,
      }));

      res.json({
        success: true,
        data: { achievements: formattedAchievements },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single achievement by ID
   */
  async getAchievement(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const achievement = await prisma.achievement.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!achievement) {
        return res.status(404).json({
          success: false,
          message: "Achievement not found",
        });
      }

      const formattedAchievement = {
        id: achievement.id,
        title: achievement.title,
        organization: achievement.organization,
        duration: achievement.duration,
        startDate: achievement.startDate?.toISOString() || null,
        endDate: achievement.endDate?.toISOString() || null,
        location: achievement.location || "",
        description: achievement.description || "",
        type: achievement.type,
        skillsInvolved: achievement.skillsInvolved || [],
        keyPoints: achievement.keyPoints || [],
        iconName: achievement.iconName || "Trophy",
        imageUrl: achievement.imageUrl || "",
        websiteUrl: achievement.websiteUrl || "",
        order: achievement.displayOrder,
      };

      res.json({
        success: true,
        data: { achievement: formattedAchievement },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an achievement
   */
  async updateAchievement(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        title,
        organization,
        duration,
        startDate,
        endDate,
        location,
        description,
        type,
        skillsInvolved,
        keyPoints,
        iconName,
        imageUrl,
        websiteUrl,
        displayOrder,
      } = req.body;

      // Check if achievement exists and belongs to user
      const existingAchievement = await prisma.achievement.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingAchievement) {
        return res.status(404).json({
          success: false,
          message: "Achievement not found",
        });
      }

      const achievement = await prisma.achievement.update({
        where: { id },
        data: {
          title,
          organization,
          duration,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          location,
          description,
          type,
          skillsInvolved: skillsInvolved || [],
          keyPoints: keyPoints || [],
          iconName: iconName || "Trophy",
          imageUrl,
          websiteUrl,
          displayOrder: displayOrder !== undefined ? displayOrder : existingAchievement.displayOrder,
        },
      });

      const formattedAchievement = {
        id: achievement.id,
        title: achievement.title,
        organization: achievement.organization,
        duration: achievement.duration,
        startDate: achievement.startDate?.toISOString() || null,
        endDate: achievement.endDate?.toISOString() || null,
        location: achievement.location || "",
        description: achievement.description || "",
        type: achievement.type,
        skillsInvolved: achievement.skillsInvolved || [],
        keyPoints: achievement.keyPoints || [],
        iconName: achievement.iconName || "Trophy",
        imageUrl: achievement.imageUrl || "",
        websiteUrl: achievement.websiteUrl || "",
        order: achievement.displayOrder,
      };

      res.json({
        success: true,
        message: "Achievement updated successfully",
        data: { achievement: formattedAchievement },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an achievement (soft delete)
   */
  async deleteAchievement(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Check if achievement exists and belongs to user
      const existingAchievement = await prisma.achievement.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingAchievement) {
        return res.status(404).json({
          success: false,
          message: "Achievement not found",
        });
      }

      await prisma.achievement.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Achievement deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder achievements
   */
  async reorderAchievements(req, res, next) {
    try {
      const userId = req.user.id;
      const { achievementIds } = req.body;

      if (!Array.isArray(achievementIds)) {
        return res.status(400).json({
          success: false,
          message: "achievementIds must be an array",
        });
      }

      // Verify all achievements belong to the user
      const userAchievements = await prisma.achievement.findMany({
        where: { userId, isActive: true },
        select: { id: true },
      });

      const userAchievementIds = userAchievements.map((ach) => ach.id);
      const invalidIds = achievementIds.filter((id) => !userAchievementIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid achievement IDs: ${invalidIds.join(", ")}`,
        });
      }

      // Update display orders
      const updatePromises = achievementIds.map((id, index) =>
        prisma.achievement.update({
          where: { id },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Achievements reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update achievements
   */
  async batchUpdateAchievements(req, res, next) {
    try {
      const userId = req.user.id;
      const { achievements } = req.body;

      if (!Array.isArray(achievements)) {
        return res.status(400).json({
          success: false,
          message: "achievements must be an array",
        });
      }

      // Delete existing achievements (soft delete)
      await prisma.achievement.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      // Create new achievements
      const achievementPromises = achievements.map((achData, index) => {
        return prisma.achievement.create({
          data: {
            userId,
            title: achData.title,
            organization: achData.organization,
            duration: achData.duration,
            startDate: achData.startDate ? new Date(achData.startDate) : null,
            endDate: achData.endDate ? new Date(achData.endDate) : null,
            location: achData.location,
            description: achData.description,
            type: achData.type,
            skillsInvolved: achData.skillsInvolved || [],
            keyPoints: achData.keyPoints || [],
            iconName: achData.iconName || "Trophy",
            imageUrl: achData.imageUrl,
            websiteUrl: achData.websiteUrl,
            displayOrder: index + 1,
            isActive: true,
          },
        });
      });

      const createdAchievements = await Promise.all(achievementPromises);

      const formattedAchievements = createdAchievements.map((achievement) => ({
        id: achievement.id,
        title: achievement.title,
        organization: achievement.organization,
        duration: achievement.duration,
        startDate: achievement.startDate?.toISOString() || null,
        endDate: achievement.endDate?.toISOString() || null,
        location: achievement.location || "",
        description: achievement.description || "",
        type: achievement.type,
        skillsInvolved: achievement.skillsInvolved || [],
        keyPoints: achievement.keyPoints || [],
        iconName: achievement.iconName || "Trophy",
        imageUrl: achievement.imageUrl || "",
        websiteUrl: achievement.websiteUrl || "",
        order: achievement.displayOrder,
      }));

      res.json({
        success: true,
        message: "Achievements updated successfully",
        data: { achievements: formattedAchievements },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new AchievementController();
