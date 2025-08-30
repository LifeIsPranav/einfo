const cloudinaryUpload = require("../services/cloudinaryUpload");
const multer = require("multer");
const { prisma } = require("../config/database");

class UploadController {
  /**
   * Upload profile image
   */
  async uploadProfileImage(req, res, next) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Validate file size (100KB = 102400 bytes)
      const maxSize = 100 * 1024; // 100KB
      if (req.file.size > maxSize) {
        return res.status(400).json({
          success: false,
          message: `File too large. Maximum size is 100KB for profile images.`,
        });
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
      if (!allowedTypes.includes(req.file.mimetype)) {
        return res.status(400).json({
          success: false,
          message: "Invalid file type. Only JPEG, PNG, WebP, and GIF images are allowed.",
        });
      }

      const result = await cloudinaryUpload.uploadProfileImage(req.file.buffer, userId);

      // Update user's profile image URL
      await prisma.userProfile.upsert({
        where: { userId },
        update: { profileImageUrl: result.secure_url },
        create: { 
          userId,
          profileImageUrl: result.secure_url
        },
      });

      res.json({
        success: true,
        message: "Profile image uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload portfolio image
   */
  async uploadPortfolioImage(req, res, next) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await cloudinaryUpload.uploadPortfolioImage(req.file.buffer, userId);

      res.json({
        success: true,
        message: "Portfolio image uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload education image
   */
  async uploadEducationImage(req, res, next) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      const result = await cloudinaryUpload.uploadEducationImage(req.file.buffer, userId);

      res.json({
        success: true,
        message: "Education image uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Upload resume
   */
  async uploadResume(req, res, next) {
    try {
      const userId = req.user.id;
      
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: "No file uploaded",
        });
      }

      // Check if file is PDF
      if (req.file.mimetype !== 'application/pdf') {
        return res.status(400).json({
          success: false,
          message: "Only PDF files are allowed for resume",
        });
      }

      const result = await cloudinaryUpload.uploadResume(req.file.buffer, userId);

      // Update user's resume URL
      await prisma.userProfile.upsert({
        where: { userId },
        update: { resumeUrl: result.secure_url },
        create: { 
          userId,
          resumeUrl: result.secure_url
        },
      });

      res.json({
        success: true,
        message: "Resume uploaded successfully",
        data: {
          url: result.secure_url,
          publicId: result.public_id,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete uploaded file
   */
  async deleteFile(req, res, next) {
    try {
      const { publicId } = req.params;
      const userId = req.user.id;

      if (!publicId) {
        return res.status(400).json({
          success: false,
          message: "Public ID is required",
        });
      }

      // Verify the file belongs to the user (check if public_id contains user ID)
      if (!publicId.includes(userId)) {
        return res.status(403).json({
          success: false,
          message: "You don't have permission to delete this file",
        });
      }

      const result = await cloudinaryUpload.deleteFile(publicId);

      if (result.result === 'ok') {
        res.json({
          success: true,
          message: "File deleted successfully",
        });
      } else {
        res.status(400).json({
          success: false,
          message: "Failed to delete file",
        });
      }
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new UploadController();
