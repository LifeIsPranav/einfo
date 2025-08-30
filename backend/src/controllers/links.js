const { prisma } = require("../config/database");

class LinksController {
  /**
   * Create a new link
   */
  async createLink(req, res, next) {
    try {
      const userId = req.user.id;
      const {
        title,
        description,
        url,
        iconName,
        imageUrl,
        projectDetails,
        displayOrder,
      } = req.body;

      // Get the next display order if not provided
      let order = displayOrder;
      if (order === undefined) {
        const lastLink = await prisma.profileLink.findFirst({
          where: { userId },
          orderBy: { displayOrder: "desc" },
        });
        order = lastLink ? lastLink.displayOrder + 1 : 1;
      }

      const link = await prisma.profileLink.create({
        data: {
          userId,
          title,
          description,
          url,
          iconName: iconName || "Link",
          imageUrl,
          projectDetails,
          displayOrder: order,
          isActive: true,
        },
      });

      res.status(201).json({
        success: true,
        message: "Link created successfully",
        data: { link },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get all links for authenticated user
   */
  async getLinks(req, res, next) {
    try {
      const userId = req.user.id;

      const links = await prisma.profileLink.findMany({
        where: { userId, isActive: true },
        orderBy: { displayOrder: "asc" },
      });

      const formattedLinks = links.map(link => ({
        id: link.id,
        title: link.title,
        description: link.description || "",
        url: link.url,
        iconName: link.iconName || "Link",
        imageUrl: link.imageUrl || "",
        projectDetails: link.projectDetails || "",
        order: link.displayOrder,
      }));

      res.json({
        success: true,
        message: "Links retrieved successfully",
        data: { links: formattedLinks },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get a specific link by ID
   */
  async getLink(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const link = await prisma.profileLink.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!link) {
        return res.status(404).json({
          success: false,
          message: "Link not found",
        });
      }

      const formattedLink = {
        id: link.id,
        title: link.title,
        description: link.description || "",
        url: link.url,
        iconName: link.iconName || "Link",
        imageUrl: link.imageUrl || "",
        projectDetails: link.projectDetails || "",
        order: link.displayOrder,
      };

      res.json({
        success: true,
        message: "Link retrieved successfully",
        data: { link: formattedLink },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a link
   */
  async updateLink(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const {
        title,
        description,
        url,
        iconName,
        imageUrl,
        projectDetails,
        displayOrder,
      } = req.body;

      const existingLink = await prisma.profileLink.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingLink) {
        return res.status(404).json({
          success: false,
          message: "Link not found",
        });
      }

      const updateData = {};
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description;
      if (url !== undefined) updateData.url = url;
      if (iconName !== undefined) updateData.iconName = iconName;
      if (imageUrl !== undefined) updateData.imageUrl = imageUrl;
      if (projectDetails !== undefined) updateData.projectDetails = projectDetails;
      if (displayOrder !== undefined) updateData.displayOrder = displayOrder;

      const link = await prisma.profileLink.update({
        where: { id },
        data: updateData,
      });

      const formattedLink = {
        id: link.id,
        title: link.title,
        description: link.description || "",
        url: link.url,
        iconName: link.iconName || "Link",
        imageUrl: link.imageUrl || "",
        projectDetails: link.projectDetails || "",
        order: link.displayOrder,
      };

      res.json({
        success: true,
        message: "Link updated successfully",
        data: { link: formattedLink },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a link (soft delete)
   */
  async deleteLink(req, res, next) {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const existingLink = await prisma.profileLink.findFirst({
        where: { id, userId, isActive: true },
      });

      if (!existingLink) {
        return res.status(404).json({
          success: false,
          message: "Link not found",
        });
      }

      await prisma.profileLink.update({
        where: { id },
        data: { isActive: false },
      });

      res.json({
        success: true,
        message: "Link deleted successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reorder links
   */
  async reorderLinks(req, res, next) {
    try {
      const userId = req.user.id;
      const { linkIds } = req.body; // Array of link IDs in new order

      if (!Array.isArray(linkIds)) {
        return res.status(400).json({
          success: false,
          message: "linkIds must be an array",
        });
      }

      // Verify all links belong to the user
      const userLinks = await prisma.profileLink.findMany({
        where: { userId, isActive: true },
        select: { id: true },
      });

      const userLinkIds = userLinks.map(link => link.id);
      const invalidIds = linkIds.filter(id => !userLinkIds.includes(id));

      if (invalidIds.length > 0) {
        return res.status(400).json({
          success: false,
          message: "Some link IDs are invalid or don't belong to you",
        });
      }

      // Update display orders
      const updatePromises = linkIds.map((linkId, index) =>
        prisma.profileLink.update({
          where: { id: linkId },
          data: { displayOrder: index + 1 },
        })
      );

      await Promise.all(updatePromises);

      res.json({
        success: true,
        message: "Links reordered successfully",
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Batch update links
   */
  async batchUpdateLinks(req, res, next) {
    try {
      const userId = req.user.id;
      const { links } = req.body; // Array of link objects with updates

      if (!Array.isArray(links)) {
        return res.status(400).json({
          success: false,
          message: "links must be an array",
        });
      }

      // Verify all links belong to the user
      const linkIds = links.map(link => link.id).filter(Boolean);
      if (linkIds.length > 0) {
        const userLinks = await prisma.profileLink.findMany({
          where: { id: { in: linkIds }, userId, isActive: true },
          select: { id: true },
        });

        const userLinkIds = userLinks.map(link => link.id);
        const invalidIds = linkIds.filter(id => !userLinkIds.includes(id));

        if (invalidIds.length > 0) {
          return res.status(400).json({
            success: false,
            message: "Some link IDs are invalid or don't belong to you",
          });
        }
      }

      const updatePromises = links.map(link => {
        if (link.id) {
          // Update existing link
          return prisma.profileLink.update({
            where: { id: link.id },
            data: {
              title: link.title,
              description: link.description,
              url: link.url,
              iconName: link.iconName || "Link",
              imageUrl: link.imageUrl,
              projectDetails: link.projectDetails,
              displayOrder: link.displayOrder,
            },
          });
        } else {
          // Create new link
          return prisma.profileLink.create({
            data: {
              userId,
              title: link.title,
              description: link.description,
              url: link.url,
              iconName: link.iconName || "Link",
              imageUrl: link.imageUrl,
              projectDetails: link.projectDetails,
              displayOrder: link.displayOrder,
              isActive: true,
            },
          });
        }
      });

      const updatedLinks = await Promise.all(updatePromises);

      const formattedLinks = updatedLinks.map(link => ({
        id: link.id,
        title: link.title,
        description: link.description || "",
        url: link.url,
        iconName: link.iconName || "Link",
        imageUrl: link.imageUrl || "",
        projectDetails: link.projectDetails || "",
        order: link.displayOrder,
      }));

      res.json({
        success: true,
        message: "Links updated successfully",
        data: { links: formattedLinks },
      });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new LinksController();
