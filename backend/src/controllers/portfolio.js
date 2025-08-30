const { prisma } = require("../config/database");

class PortfolioController {
  /**
   * Create a new portfolio project
   */
  async createProject(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        title,
        description,
        category,
        url,
        iconName,
        images,
        displayOrder,
      } = req.body;

      // Get the next display order if not provided
      let order = displayOrder;
      if (order === undefined) {
        const lastProject = await prisma.portfolioProject.findFirst({
          where: { userId },
          orderBy: { displayOrder: "desc" },
        });
        order = lastProject ? lastProject.displayOrder + 1 : 1;
      }

      const project = await prisma.portfolioProject.create({
        data: {
          userId,
          title,
          description,
          category,
          url,
          iconName: iconName || "FolderOpen",
          displayOrder: order,
          isActive: true,
        },
      });

      // Add images if provided
      if (images && Array.isArray(images)) {
        const imagePromises = images.map((img, index) =>
          prisma.portfolioImage.create({
            data: {
              projectId: project.id,
              url: img.url,
              title: img.title || "",
              description: img.description || "",
              displayOrder: index + 1,
            },
          })
        );
        await Promise.all(imagePromises);
      }

      // Fetch the complete project with images
      const completeProject = await prisma.portfolioProject.findUnique({
        where: { id: project.id },
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      const formattedProject = {
        id: completeProject.id,
        title: completeProject.title,
        description: completeProject.description || "",
        category: completeProject.category || "",
        url: completeProject.url || "",
        iconName: completeProject.iconName || "FolderOpen",
        images: completeProject.images.map(img => ({
          id: img.id,
          url: img.url,
          title: img.title || "",
          description: img.description || "",
        })),
        order: completeProject.displayOrder,
      };

      res.status(201).json({
        success: true,
        message: "Portfolio project created successfully",
        data: { project: formattedProject },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all portfolio projects for authenticated user
   */
  async getProjects(req, res, next) {
    try {
      const userId = req.user.id;

      const projects = await prisma.portfolioProject.findMany({
        where: { userId, isActive: true },
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
        orderBy: { displayOrder: "asc" },
      });

      const formattedProjects = projects.map(project => ({
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
        message: "Portfolio projects retrieved successfully",
        data: { projects: formattedProjects },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific portfolio project by ID
   */
  async getProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const project = await prisma.portfolioProject.findFirst({
        where: { id, userId, isActive: true },
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Portfolio project not found",
        });
      }

      const formattedProject = {
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
      };

      res.json({
        success: true,
        message: "Portfolio project retrieved successfully",
        data: { project: formattedProject },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a portfolio project
   */
  async updateProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        title,
        description,
        category,
        url,
        iconName,
        displayOrder,
      } = req.body;

      const existingProject = await prisma.portfolioProject.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: "Portfolio project not found",
        });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (category !== undefined) updateData.category = category;
      if (url !== undefined) updateData.url = url;
      if (iconName !== undefined) updateData.iconName = iconName;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

      const project = await prisma.portfolioProject.update({
        where: { id },
        data: updateData,
        include: {
          images: {
            orderBy: { displayOrder: "asc" },
          },
        },
      });

      const formattedProject = {
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
      };

      res.json({
        success: true,
        message: "Portfolio project updated successfully",
        data: { project: formattedProject },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a portfolio project (soft delete)
   */
  async deleteProject(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existingProject = await prisma.portfolioProject.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingProject) {
        return res.status(404).json({
          success: false,
          message: "Portfolio project not found",
        });
      }

      await prisma.portfolioProject.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Portfolio project deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Add image to portfolio project
   */
  async addProjectImage(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { url, title, description } = req.body;

      const project = await prisma.portfolioProject.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Portfolio project not found",
        });
      }

      // Get the next display order
      const lastImage = await prisma.portfolioImage.findFirst({
        where: { projectId: id },
        orderBy: { displayOrder: "desc" },
      });

      const image = await prisma.portfolioImage.create({
        data: {
          projectId: id,
          url,
          title: title || "",
          description: description || "",
          displayOrder: lastImage ? lastImage.displayOrder + 1 : 1,
        },
      });

      res.status(201).json({
        success: true,
        message: "Project image added successfully",
        data: {
          image: {
            id: image.id,
            url: image.url,
            title: image.title || "",
            description: image.description || "",
          },
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Remove image from portfolio project
   */
  async removeProjectImage(req, res, next) {
    try {
      const userId = req.user.id;
      const { id, imageId } = req.params;

      const project = await prisma.portfolioProject.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Portfolio project not found",
        });
      }

      const image = await prisma.portfolioImage.findFirst({
        where: { id: imageId, projectId: id },
      });

      if (!image) {
        return res.status(404).json({
          success: false,
          message: "Project image not found",
        });
      }

      await prisma.portfolioImage.delete({
        where: { id: imageId },
      });

      res.json({
        success: true,
        message: "Project image removed successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder project images
   */
  async reorderProjectImages(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { imageIds } = req.body;

      const project = await prisma.portfolioProject.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Portfolio project not found",
        });
      }

      if (!Array.isArray(imageIds)) {
        return res.status(400).json({
          success: false,
          message: "imageIds must be an array",
        });
      }

      // Verify all images belong to the project
      const projectImages = await prisma.portfolioImage.findMany({
        where: { projectId: id },
        select: { id: true },
      });

      const projectImageIds = projectImages.map(img => img.id);
      const invalidIds = imageIds.filter(imageId => !projectImageIds.includes(imageId));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some image IDs are invalid or don't belong to this project",
        });
      }

      // Update display orders
      const updatePromises = imageIds.map((imageId, index) =>
        prisma.portfolioImage.update({
          where: { id: imageId },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Project images reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder portfolio projects
   */
  async reorderProjects(req, res, next) {
    try {
      const userId = req.user.id;
      const { projectIds } = req.body;

      if (!Array.isArray(projectIds)) {
        return res.status(400).json({
          success: false,
          message: "projectIds must be an array",
        });
      }

      // Verify all projects belong to the user
      const userProjects = await prisma.portfolioProject.findMany({
        where: { userId, isActive: true },
        select: { id: true },
      });

      const userProjectIds = userProjects.map(project => project.id);
      const invalidIds = projectIds.filter(id => !userProjectIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some project IDs are invalid or don't belong to you",
        });
      }

      // Update display orders
      const updatePromises = projectIds.map((projectId, index) =>
        prisma.portfolioProject.update({
          where: { id: projectId },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Portfolio projects reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update portfolio projects
   */
  async batchUpdateProjects(req, res, next) {
    try {
      const userId = req.user.id;
      const { projects } = req.body;

      if (!Array.isArray(projects)) {
        return res.status(400).json({
          success: false,
          message: "projects must be an array",
        });
      }

      // Verify all projects belong to the user
      const projectIds = projects.map(project => project.id).filter(Boolean);
      if (projectIds.length > 0) {
        const userProjects = await prisma.portfolioProject.findMany({
          where: { id: { in: projectIds }, userId, isActive: true },
          select: { id: true },
        });

        const userProjectIds = userProjects.map(project => project.id);
        const invalidIds = projectIds.filter(id => !userProjectIds.includes(id));

        if (invalidIds.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Some project IDs are invalid or don't belong to you",
          });
        }
      }

      const updatePromises = projects.map(project => {
        if (project.id) {
          // Update existing project
          return prisma.portfolioProject.update({
            where: { id: project.id },
            data: {
              title: project.title,
              description: project.description,
              category: project.category,
              url: project.url,
              iconName: project.iconName || "FolderOpen",
              displayOrder: project.displayOrder,
            },
            include: {
              images: {
                orderBy: { displayOrder: "asc" },
              },
            },
          });
        } else {
          // Create new project
          return prisma.portfolioProject.create({
            data: {
              userId,
              title: project.title,
              description: project.description,
              category: project.category,
              url: project.url,
              iconName: project.iconName || "FolderOpen",
              displayOrder: project.displayOrder,
              isActive: true,
            },
            include: {
              images: {
                orderBy: { displayOrder: "asc" },
              },
            },
          });
        }
      });

      const updatedProjects = await Promise.all(updatePromises);

      const formattedProjects = updatedProjects.map(project => ({
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
        message: "Portfolio projects updated successfully",
        data: { projects: formattedProjects },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new PortfolioController();
