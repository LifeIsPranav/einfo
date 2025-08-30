const { prisma } = require("../config/database");

class ExtracurricularController {
  /**
   * Create a new extracurricular entry
   */
  async createExtracurricular(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        activityName,
        organization,
        duration,
        startDate,
        endDate,
        location,
        role,
        description,
        type,
        responsibilities,
        achievements,
        skillsDeveloped,
        iconName,
        imageUrl,
        websiteUrl,
        displayOrder,
      } = req.body;

      // Get the next display order if not provided
      let order = displayOrder;
      if (order === undefined) {
        const lastExtracurricular = await prisma.extracurricular.findFirst({
          where: { userId },
          orderBy: { displayOrder: "desc" },
        });
        order = lastExtracurricular ? lastExtracurricular.displayOrder + 1 : 1;
      }

      const extracurricular = await prisma.extracurricular.create({
        data: {
          userId,
          activityName,
          organization,
          duration,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          location,
          role,
          description,
          type,
          responsibilities: responsibilities || [],
          achievements: achievements || [],
          skillsDeveloped: skillsDeveloped || [],
          iconName: iconName || "Users",
          imageUrl,
          websiteUrl,
          displayOrder: order,
          isActive: true,
        },
      });

      const formattedExtracurricular = {
        id: extracurricular.id,
        activityName: extracurricular.activityName,
        organization: extracurricular.organization,
        duration: extracurricular.duration,
        startDate: extracurricular.startDate?.toISOString() || null,
        endDate: extracurricular.endDate?.toISOString() || null,
        location: extracurricular.location || "",
        role: extracurricular.role || "",
        description: extracurricular.description || "",
        type: extracurricular.type,
        responsibilities: extracurricular.responsibilities || [],
        achievements: extracurricular.achievements || [],
        skillsDeveloped: extracurricular.skillsDeveloped || [],
        iconName: extracurricular.iconName || "Users",
        imageUrl: extracurricular.imageUrl || "",
        websiteUrl: extracurricular.websiteUrl || "",
        order: extracurricular.displayOrder,
      };

      res.status(201).json({
        success: true,
        message: "Extracurricular activity created successfully",
        data: { extracurricular: formattedExtracurricular },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all extracurriculars for authenticated user
   */
  async getExtracurriculars(req, res, next) {
    try {
      const userId = req.user.id;

      const extracurriculars = await prisma.extracurricular.findMany({
        where: { userId, isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      const formattedExtracurriculars = extracurriculars.map((extracurricular) => ({
        id: extracurricular.id,
        activityName: extracurricular.activityName,
        organization: extracurricular.organization,
        duration: extracurricular.duration,
        startDate: extracurricular.startDate?.toISOString() || null,
        endDate: extracurricular.endDate?.toISOString() || null,
        location: extracurricular.location || "",
        role: extracurricular.role || "",
        description: extracurricular.description || "",
        type: extracurricular.type,
        responsibilities: extracurricular.responsibilities || [],
        achievements: extracurricular.achievements || [],
        skillsDeveloped: extracurricular.skillsDeveloped || [],
        iconName: extracurricular.iconName || "Users",
        imageUrl: extracurricular.imageUrl || "",
        websiteUrl: extracurricular.websiteUrl || "",
        order: extracurricular.displayOrder,
      }));

      res.json({
        success: true,
        data: { extracurriculars: formattedExtracurriculars },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a single extracurricular by ID
   */
  async getExtracurricular(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const extracurricular = await prisma.extracurricular.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!extracurricular) {
        return res.status(404).json({
          success: false,
          message: "Extracurricular activity not found",
        });
      }

      const formattedExtracurricular = {
        id: extracurricular.id,
        activityName: extracurricular.activityName,
        organization: extracurricular.organization,
        duration: extracurricular.duration,
        startDate: extracurricular.startDate?.toISOString() || null,
        endDate: extracurricular.endDate?.toISOString() || null,
        location: extracurricular.location || "",
        role: extracurricular.role || "",
        description: extracurricular.description || "",
        type: extracurricular.type,
        responsibilities: extracurricular.responsibilities || [],
        achievements: extracurricular.achievements || [],
        skillsDeveloped: extracurricular.skillsDeveloped || [],
        iconName: extracurricular.iconName || "Users",
        imageUrl: extracurricular.imageUrl || "",
        websiteUrl: extracurricular.websiteUrl || "",
        order: extracurricular.displayOrder,
      };

      res.json({
        success: true,
        data: { extracurricular: formattedExtracurricular },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an extracurricular
   */
  async updateExtracurricular(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        activityName,
        organization,
        duration,
        startDate,
        endDate,
        location,
        role,
        description,
        type,
        responsibilities,
        achievements,
        skillsDeveloped,
        iconName,
        imageUrl,
        websiteUrl,
        displayOrder,
      } = req.body;

      // Check if extracurricular exists and belongs to user
      const existingExtracurricular = await prisma.extracurricular.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingExtracurricular) {
        return res.status(404).json({
          success: false,
          message: "Extracurricular activity not found",
        });
      }

      const extracurricular = await prisma.extracurricular.update({
        where: { id },
        data: {
          activityName,
          organization,
          duration,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          location,
          role,
          description,
          type,
          responsibilities: responsibilities || [],
          achievements: achievements || [],
          skillsDeveloped: skillsDeveloped || [],
          iconName: iconName || "Users",
          imageUrl,
          websiteUrl,
          displayOrder: displayOrder !== undefined ? displayOrder : existingExtracurricular.displayOrder,
        },
      });

      const formattedExtracurricular = {
        id: extracurricular.id,
        activityName: extracurricular.activityName,
        organization: extracurricular.organization,
        duration: extracurricular.duration,
        startDate: extracurricular.startDate?.toISOString() || null,
        endDate: extracurricular.endDate?.toISOString() || null,
        location: extracurricular.location || "",
        role: extracurricular.role || "",
        description: extracurricular.description || "",
        type: extracurricular.type,
        responsibilities: extracurricular.responsibilities || [],
        achievements: extracurricular.achievements || [],
        skillsDeveloped: extracurricular.skillsDeveloped || [],
        iconName: extracurricular.iconName || "Users",
        imageUrl: extracurricular.imageUrl || "",
        websiteUrl: extracurricular.websiteUrl || "",
        order: extracurricular.displayOrder,
      };

      res.json({
        success: true,
        message: "Extracurricular activity updated successfully",
        data: { extracurricular: formattedExtracurricular },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an extracurricular (soft delete)
   */
  async deleteExtracurricular(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      // Check if extracurricular exists and belongs to user
      const existingExtracurricular = await prisma.extracurricular.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingExtracurricular) {
        return res.status(404).json({
          success: false,
          message: "Extracurricular activity not found",
        });
      }

      await prisma.extracurricular.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Extracurricular activity deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder extracurriculars
   */
  async reorderExtracurriculars(req, res, next) {
    try {
      const userId = req.user.id;
      const { extracurricularIds } = req.body;

      if (!Array.isArray(extracurricularIds)) {
        return res.status(400).json({
          success: false,
          message: "extracurricularIds must be an array",
        });
      }

      // Verify all extracurriculars belong to the user
      const userExtracurriculars = await prisma.extracurricular.findMany({
        where: { userId, isActive: true },
        select: { id: true },
      });

      const userExtracurricularIds = userExtracurriculars.map((ext) => ext.id);
      const invalidIds = extracurricularIds.filter((id) => !userExtracurricularIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: `Invalid extracurricular IDs: ${invalidIds.join(", ")}`,
        });
      }

      // Update display orders
      const updatePromises = extracurricularIds.map((id, index) =>
        prisma.extracurricular.update({
          where: { id },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Extracurricular activities reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update extracurriculars
   */
  async batchUpdateExtracurriculars(req, res, next) {
    try {
      const userId = req.user.id;
      const { extracurriculars } = req.body;

      if (!Array.isArray(extracurriculars)) {
        return res.status(400).json({
          success: false,
          message: "extracurriculars must be an array",
        });
      }

      // Delete existing extracurriculars (soft delete)
      await prisma.extracurricular.updateMany({
        where: { userId },
        data: { isActive: false },
      });

      // Create new extracurriculars
      const extracurricularPromises = extracurriculars.map((extData, index) => {
        return prisma.extracurricular.create({
          data: {
            userId,
            activityName: extData.activityName,
            organization: extData.organization,
            duration: extData.duration,
            startDate: extData.startDate ? new Date(extData.startDate) : null,
            endDate: extData.endDate ? new Date(extData.endDate) : null,
            location: extData.location,
            role: extData.role,
            description: extData.description,
            type: extData.type,
            responsibilities: extData.responsibilities || [],
            achievements: extData.achievements || [],
            skillsDeveloped: extData.skillsDeveloped || [],
            iconName: extData.iconName || "Users",
            imageUrl: extData.imageUrl,
            websiteUrl: extData.websiteUrl,
            displayOrder: index + 1,
            isActive: true,
          },
        });
      });

      const createdExtracurriculars = await Promise.all(extracurricularPromises);

      const formattedExtracurriculars = createdExtracurriculars.map((extracurricular) => ({
        id: extracurricular.id,
        activityName: extracurricular.activityName,
        organization: extracurricular.organization,
        duration: extracurricular.duration,
        startDate: extracurricular.startDate?.toISOString() || null,
        endDate: extracurricular.endDate?.toISOString() || null,
        location: extracurricular.location || "",
        role: extracurricular.role || "",
        description: extracurricular.description || "",
        type: extracurricular.type,
        responsibilities: extracurricular.responsibilities || [],
        achievements: extracurricular.achievements || [],
        skillsDeveloped: extracurricular.skillsDeveloped || [],
        iconName: extracurricular.iconName || "Users",
        imageUrl: extracurricular.imageUrl || "",
        websiteUrl: extracurricular.websiteUrl || "",
        order: extracurricular.displayOrder,
      }));

      res.json({
        success: true,
        message: "Extracurricular activities updated successfully",
        data: { extracurriculars: formattedExtracurriculars },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExtracurricularController();
