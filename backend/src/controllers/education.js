const { prisma } = require("../config/database");

class EducationController {
  /**
   * Create a new education entry
   */
  async createEducation(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        institution,
        degree,
        duration,
        startDate,
        endDate,
        location,
        description,
        educationType,
        gpa,
        achievements,
        courses,
        iconName,
        imageUrl,
        websiteUrl,
        displayOrder,
      } = req.body;

      // Get the next display order if not provided
      let order = displayOrder;
      if (order === undefined) {
        const lastEducation = await prisma.education.findFirst({
          where: { userId },
          orderBy: { displayOrder: "desc" },
        });
        order = lastEducation ? lastEducation.displayOrder + 1 : 1;
      }

      const education = await prisma.education.create({
        data: {
          userId,
          institution,
          degree,
          duration,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          location,
          description,
          educationType,
          gpa,
          achievements: achievements || [],
          courses: courses || [],
          iconName: iconName || "GraduationCap",
          imageUrl,
          websiteUrl,
          displayOrder: order,
          isActive: true,
        },
      });

      const formattedEducation = {
        id: education.id,
        institution: education.institution,
        degree: education.degree,
        duration: education.duration,
        startDate: education.startDate?.toISOString() || null,
        endDate: education.endDate?.toISOString() || null,
        location: education.location || "",
        description: education.description || "",
        educationType: education.educationType,
        gpa: education.gpa || "",
        achievements: education.achievements || [],
        courses: education.courses || [],
        iconName: education.iconName || "GraduationCap",
        imageUrl: education.imageUrl || "",
        websiteUrl: education.websiteUrl || "",
        order: education.displayOrder,
      };

      res.status(201).json({
        success: true,
        message: "Education entry created successfully",
        data: { education: formattedEducation },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all education entries for authenticated user
   */
  async getEducations(req, res, next) {
    try {
      const userId = req.user.id;

      const educations = await prisma.education.findMany({
        where: { userId, isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      const formattedEducations = educations.map(edu => ({
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
      }));

      res.json({
        success: true,
        message: "Education entries retrieved successfully",
        data: { educations: formattedEducations },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific education entry by ID
   */
  async getEducation(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const education = await prisma.education.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!education) {
        return res.status(404).json({
          success: false,
          message: "Education entry not found",
        });
      }

      const formattedEducation = {
        id: education.id,
        institution: education.institution,
        degree: education.degree,
        startDate: education.startDate?.toISOString() || null,
        endDate: education.endDate?.toISOString() || null,
        location: education.location || "",
        description: education.description || "",
        educationType: education.educationType,
        gpa: education.gpa || "",
        achievements: education.achievements || [],
        courses: education.courses || [],
        iconName: education.iconName || "GraduationCap",
        imageUrl: education.imageUrl || "",
        websiteUrl: education.websiteUrl || "",
        order: education.displayOrder,
      };

      res.json({
        success: true,
        message: "Education entry retrieved successfully",
        data: { education: formattedEducation },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update an education entry
   */
  async updateEducation(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        institution,
        degree,
        duration,
        startDate,
        endDate,
        location,
        description,
        educationType,
        gpa,
        achievements,
        courses,
        iconName,
        imageUrl,
        websiteUrl,
        displayOrder,
      } = req.body;

      const existingEducation = await prisma.education.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingEducation) {
        return res.status(404).json({
          success: false,
          message: "Education entry not found",
        });
      }

      const updateData = {};
      if (institution !== undefined) updateData.institution = institution;
      if (degree !== undefined) updateData.degree = degree;
      if (duration !== undefined) updateData.duration = duration;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (location !== undefined) updateData.location = location;
      if (description !== undefined) updateData.description = description;
      if (educationType !== undefined) updateData.educationType = educationType;
      if (gpa !== undefined) updateData.gpa = gpa;
      if (achievements !== undefined) updateData.achievements = achievements;
      if (courses !== undefined) updateData.courses = courses;
      if (iconName !== undefined) updateData.iconName = iconName;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

      const education = await prisma.education.update({
        where: { id },
        data: updateData,
      });

      const formattedEducation = {
        id: education.id,
        institution: education.institution,
        degree: education.degree,
        duration: education.duration,
        startDate: education.startDate?.toISOString() || null,
        endDate: education.endDate?.toISOString() || null,
        location: education.location || "",
        description: education.description || "",
        educationType: education.educationType,
        gpa: education.gpa || "",
        achievements: education.achievements || [],
        courses: education.courses || [],
        iconName: education.iconName || "GraduationCap",
        imageUrl: education.imageUrl || "",
        websiteUrl: education.websiteUrl || "",
        order: education.displayOrder,
      };

      res.json({
        success: true,
        message: "Education entry updated successfully",
        data: { education: formattedEducation },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete an education entry (soft delete)
   */
  async deleteEducation(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existingEducation = await prisma.education.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingEducation) {
        return res.status(404).json({
          success: false,
          message: "Education entry not found",
        });
      }

      await prisma.education.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Education entry deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder education entries
   */
  async reorderEducations(req, res, next) {
    try {
      const userId = req.user.id;
      const { educationIds } = req.body;

      if (!Array.isArray(educationIds)) {
        return res.status(400).json({
          success: false,
          message: "educationIds must be an array",
        });
      }

      // Verify all education entries belong to the user
      const userEducations = await prisma.education.findMany({
        where: { userId, isActive: true },
        select: { id: true },
      });

      const userEducationIds = userEducations.map(edu => edu.id);
      const invalidIds = educationIds.filter(id => !userEducationIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some education IDs are invalid or don't belong to you",
        });
      }

      // Update display orders
      const updatePromises = educationIds.map((educationId, index) =>
        prisma.education.update({
          where: { id: educationId },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Education entries reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update education entries
   */
  async batchUpdateEducations(req, res, next) {
    try {
      const userId = req.user.id;
      const { educations } = req.body;

      if (!Array.isArray(educations)) {
        return res.status(400).json({
          success: false,
          message: "educations must be an array",
        });
      }

      // Verify all education entries belong to the user
      const educationIds = educations.map(edu => edu.id).filter(Boolean);
      if (educationIds.length > 0) {
        const userEducations = await prisma.education.findMany({
          where: { id: { in: educationIds }, userId, isActive: true },
          select: { id: true },
        });

        const userEducationIds = userEducations.map(edu => edu.id);
        const invalidIds = educationIds.filter(id => !userEducationIds.includes(id));

        if (invalidIds.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Some education IDs are invalid or don't belong to you",
          });
        }
      }

      const updatePromises = educations.map(edu => {
        if (edu.id) {
          // Update existing education
          return prisma.education.update({
            where: { id: edu.id },
            data: {
              institution: edu.institution,
              degree: edu.degree,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              location: edu.location,
              description: edu.description,
              educationType: edu.educationType,
              gpa: edu.gpa,
              achievements: edu.achievements || [],
              courses: edu.courses || [],
              iconName: edu.iconName || "GraduationCap",
              imageUrl: edu.imageUrl,
              websiteUrl: edu.websiteUrl,
              displayOrder: edu.displayOrder,
            },
          });
        } else {
          // Create new education
          return prisma.education.create({
            data: {
              userId,
              institution: edu.institution,
              degree: edu.degree,
              startDate: edu.startDate ? new Date(edu.startDate) : null,
              endDate: edu.endDate ? new Date(edu.endDate) : null,
              location: edu.location,
              description: edu.description,
              educationType: edu.educationType,
              gpa: edu.gpa,
              achievements: edu.achievements || [],
              courses: edu.courses || [],
              iconName: edu.iconName || "GraduationCap",
              imageUrl: edu.imageUrl,
              websiteUrl: edu.websiteUrl,
              displayOrder: edu.displayOrder,
              isActive: true,
            },
          });
        }
      });

      const updatedEducations = await Promise.all(updatePromises);

      const formattedEducations = updatedEducations.map(edu => ({
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
      }));

      res.json({
        success: true,
        message: "Education entries updated successfully",
        data: { educations: formattedEducations },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new EducationController();
