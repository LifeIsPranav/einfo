const { prisma } = require("../config/database");

class ExperienceController {
  /**
   * Create a new work experience
   */
  async createExperience(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        company,
        position,
        startDate,
        endDate,
        location,
        description,
        iconName,
        achievements,
        projects,
        displayOrder,
      } = req.body;

      // Get the next display order if not provided
      let order = displayOrder;
      if (order === undefined) {
        const lastExp = await prisma.workExperience.findFirst({
          where: { userId },
          orderBy: { displayOrder: "desc" },
        });
        order = lastExp ? lastExp.displayOrder + 1 : 1;
      }

      const experience = await prisma.workExperience.create({
        data: {
          userId,
          company,
          position,
          startDate: startDate ? new Date(startDate) : null,
          endDate: endDate ? new Date(endDate) : null,
          location,
          description,
          iconName: iconName || "Building",
          achievements: achievements || [],
          displayOrder: order,
          isActive: true,
        },
      });

      // Add projects if provided
      if (projects && Array.isArray(projects)) {
        const projectPromises = projects.map((proj, index) =>
          prisma.workProject.create({
            data: {
              experienceId: experience.id,
              title: proj.title,
              description: proj.description || "",
              technologies: proj.technologies || [],
              displayOrder: index + 1,
            },
          })
        );
        await Promise.all(projectPromises);
      }

      // Fetch the complete experience with projects
      const completeExperience = await prisma.workExperience.findUnique({
        where: { id: experience.id },
        include: {
          projects: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      const formattedExperience = {
        id: completeExperience.id,
        company: completeExperience.company,
        position: completeExperience.position,
        startDate: completeExperience.startDate?.toISOString() || null,
        endDate: completeExperience.endDate?.toISOString() || null,
        location: completeExperience.location || "",
        description: completeExperience.description || "",
        iconName: completeExperience.iconName || "Building",
        achievements: completeExperience.achievements || [],
        projects: completeExperience.projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || "",
          technologies: project.technologies || [],
        })),
        order: completeExperience.displayOrder,
      };

      res.status(201).json({
        success: true,
        message: "Work experience created successfully",
        data: { experience: formattedExperience },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all work experiences for authenticated user
   */
  async getExperiences(req, res, next) {
    try {
      const userId = req.user.id;

      const experiences = await prisma.workExperience.findMany({
        where: { userId, isActive: true },
        include: {
          projects: {
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { displayOrder: "asc" },
      });

      const formattedExperiences = experiences.map(exp => ({
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
      }));

      res.json({
        success: true,
        message: "Work experiences retrieved successfully",
        data: { experiences: formattedExperiences },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific work experience by ID
   */
  async getExperience(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const experience = await prisma.workExperience.findFirst({
        where: { id, userId, isActive: true },
        include: {
          projects: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: "Work experience not found",
        });
      }

      const formattedExperience = {
        id: experience.id,
        company: experience.company,
        position: experience.position,
        startDate: experience.startDate?.toISOString() || null,
        endDate: experience.endDate?.toISOString() || null,
        location: experience.location || "",
        description: experience.description || "",
        iconName: experience.iconName || "Building",
        achievements: experience.achievements || [],
        projects: experience.projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || "",
          technologies: project.technologies || [],
        })),
        order: experience.displayOrder,
      };

      res.json({
        success: true,
        message: "Work experience retrieved successfully",
        data: { experience: formattedExperience },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a work experience
   */
  async updateExperience(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        company,
        position,
        startDate,
        endDate,
        location,
        description,
        iconName,
        achievements,
        displayOrder,
      } = req.body;

      const existingExperience = await prisma.workExperience.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingExperience) {
        return res.status(404).json({
          success: false,
          message: "Work experience not found",
        });
      }

      const updateData = {};
      if (company !== undefined) updateData.company = company;
      if (position !== undefined) updateData.position = position;
      if (startDate !== undefined) updateData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== undefined) updateData.endDate = endDate ? new Date(endDate) : null;
      if (location !== undefined) updateData.location = location;
      if (description !== undefined) updateData.description = description;
      if (iconName !== undefined) updateData.iconName = iconName;
      if (achievements !== undefined) updateData.achievements = achievements;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

      const experience = await prisma.workExperience.update({
        where: { id },
        data: updateData,
        include: {
          projects: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      const formattedExperience = {
        id: experience.id,
        company: experience.company,
        position: experience.position,
        startDate: experience.startDate?.toISOString() || null,
        endDate: experience.endDate?.toISOString() || null,
        location: experience.location || "",
        description: experience.description || "",
        iconName: experience.iconName || "Building",
        achievements: experience.achievements || [],
        projects: experience.projects.map(project => ({
          id: project.id,
          title: project.title,
          description: project.description || "",
          technologies: project.technologies || [],
        })),
        order: experience.displayOrder,
      };

      res.json({
        success: true,
        message: "Work experience updated successfully",
        data: { experience: formattedExperience },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a work experience (soft delete)
   */
  async deleteExperience(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existingExperience = await prisma.workExperience.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingExperience) {
        return res.status(404).json({
          success: false,
          message: "Work experience not found",
        });
      }

      await prisma.workExperience.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Work experience deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add project to work experience
   */
  async addExperienceProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { title, description, technologies } = req.body;

      const experience = await prisma.workExperience.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: "Work experience not found",
        });
      }

      // Get the next display order
      const lastProject = await prisma.workProject.findFirst({
        where: { experienceId: id },
        orderBy: { displayOrder: "desc" },
      });

      const project = await prisma.workProject.create({
        data: {
          experienceId: id,
          title,
          description: description || "",
          technologies: technologies || [],
          displayOrder: lastProject ? lastProject.displayOrder + 1 : 1,
        },
      });

      res.status(201).json({
        success: true,
        message: "Experience project added successfully",
        data: {
          project: {
            id: project.id,
            title: project.title,
            description: project.description || "",
            technologies: project.technologies || [],
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update experience project
   */
  async updateExperienceProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { id, projectId } = req.params;
      const { title, description, technologies } = req.body;

      const experience = await prisma.workExperience.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: "Work experience not found",
        });
      }

      const existingProject = await prisma.workProject.findFirst({
        where: { id: projectId, experienceId: id },
      });

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: "Experience project not found",
        });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (technologies !== undefined) updateData.technologies = technologies;

      const project = await prisma.workProject.update({
        where: { id: projectId },
        data: updateData,
      });

      res.json({
        success: true,
        message: "Experience project updated successfully",
        data: {
          project: {
            id: project.id,
            title: project.title,
            description: project.description || "",
            technologies: project.technologies || [],
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove project from work experience
   */
  async removeExperienceProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { id, projectId } = req.params;

      const experience = await prisma.workExperience.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: "Work experience not found",
        });
      }

      const project = await prisma.workProject.findFirst({
        where: { id: projectId, experienceId: id },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Experience project not found",
        });
      }

      await prisma.workProject.delete({
        where: { id: projectId },
      });

      res.json({
        success: true,
        message: "Experience project removed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder experience projects
   */
  async reorderExperienceProjects(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { projectIds } = req.body;

      const experience = await prisma.workExperience.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!experience) {
        return res.status(404).json({
          success: false,
          message: "Work experience not found",
        });
      }

      if (!Array.isArray(projectIds)) {
        return res.status(400).json({
          success: false,
          message: "projectIds must be an array",
        });
      }

      // Verify all projects belong to the experience
      const experienceProjects = await prisma.workProject.findMany({
        where: { experienceId: id },
        select: { id: true },
      });

      const experienceProjectIds = experienceProjects.map(proj => proj.id);
      const invalidIds = projectIds.filter(projectId => !experienceProjectIds.includes(projectId));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some project IDs are invalid or don't belong to this experience",
        });
      }

      // Update display orders
      const updatePromises = projectIds.map((projectId, index) =>
        prisma.workProject.update({
          where: { id: projectId },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Experience projects reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder work experiences
   */
  async reorderExperiences(req, res, next) {
    try {
      const userId = req.user.id;
      const { experienceIds } = req.body;

      if (!Array.isArray(experienceIds)) {
        return res.status(400).json({
          success: false,
          message: "experienceIds must be an array",
        });
      }

      // Verify all experiences belong to the user
      const userExperiences = await prisma.workExperience.findMany({
        where: { userId, isActive: true },
        select: { id: true },
      });

      const userExperienceIds = userExperiences.map(exp => exp.id);
      const invalidIds = experienceIds.filter(id => !userExperienceIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some experience IDs are invalid or don't belong to you",
        });
      }

      // Update display orders
      const updatePromises = experienceIds.map((experienceId, index) =>
        prisma.workExperience.update({
          where: { id: experienceId },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Work experiences reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update work experiences
   */
  async batchUpdateExperiences(req, res, next) {
    try {
      const userId = req.user.id;
      const { experiences } = req.body;

      if (!Array.isArray(experiences)) {
        return res.status(400).json({
          success: false,
          message: "experiences must be an array",
        });
      }

      // Verify all experiences belong to the user
      const experienceIds = experiences.map(exp => exp.id).filter(Boolean);
      if (experienceIds.length > 0) {
        const userExperiences = await prisma.workExperience.findMany({
          where: { id: { in: experienceIds }, userId, isActive: true },
          select: { id: true },
        });

        const userExperienceIds = userExperiences.map(exp => exp.id);
        const invalidIds = experienceIds.filter(id => !userExperienceIds.includes(id));

        if (invalidIds.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Some experience IDs are invalid or don't belong to you",
          });
        }
      }

      const updatePromises = experiences.map(exp => {
        if (exp.id) {
          // Update existing experience
          return prisma.workExperience.update({
            where: { id: exp.id },
            data: {
              company: exp.company,
              position: exp.position,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              location: exp.location,
              description: exp.description,
              iconName: exp.iconName || "Building",
              achievements: exp.achievements || [],
              displayOrder: exp.displayOrder,
            },
            include: {
              projects: {
                orderBy: { displayOrder: "asc" },
              },
            },
          });
        } else {
          // Create new experience
          return prisma.workExperience.create({
            data: {
              userId,
              company: exp.company,
              position: exp.position,
              startDate: exp.startDate ? new Date(exp.startDate) : null,
              endDate: exp.endDate ? new Date(exp.endDate) : null,
              location: exp.location,
              description: exp.description,
              iconName: exp.iconName || "Building",
              achievements: exp.achievements || [],
              displayOrder: exp.displayOrder,
              isActive: true,
            },
            include: {
              projects: {
                orderBy: { displayOrder: "asc" },
              },
            },
          });
        }
      });

      const updatedExperiences = await Promise.all(updatePromises);

      const formattedExperiences = updatedExperiences.map(exp => ({
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
      }));

      res.json({
        success: true,
        message: "Work experiences updated successfully",
        data: { experiences: formattedExperiences },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExperienceController();
