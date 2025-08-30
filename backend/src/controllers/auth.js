const { prisma } = require("../config/database");
const authService = require("../services/auth");
const googleAuthService = require("../services/googleAuth");
const emailService = require("../services/email");
const { v4: uuidv4 } = require("uuid");
const logger = require("../utils/logger");

class AuthController {
  /**
   * Google OAuth login/register
   */
  async googleLogin(req, res, next) {
    try {
      const { google_token, username } = req.body;

      if (!google_token) {
        return res.status(400).json({
          success: false,
          message: "Google token is required",
        });
      }

      // Verify Google token
      const googleUser = await googleAuthService.verifyGoogleToken(google_token);
      
      if (!googleUser) {
        return res.status(401).json({
          success: false,
          message: "Invalid Google token",
        });
      }

      // Check if user exists
      let user = await prisma.user.findUnique({
        where: { googleId: googleUser.googleId },
        include: {
          profile: true,
        },
      });

      // If user doesn't exist, create new user
      if (!user) {
        // If no username provided for new user, generate one
        let finalUsername = username;
        if (!finalUsername) {
          const baseUsername = googleAuthService.generateUsernameFromEmail(googleUser.email);
          finalUsername = await googleAuthService.generateUniqueUsername(baseUsername, prisma);
        } else {
          // If username was provided, still ensure it's unique
          finalUsername = await googleAuthService.generateUniqueUsername(finalUsername.toLowerCase(), prisma);
        }

        // Validate username (basic check)
        const usernameValidation = authService.validateUsername(finalUsername);
        if (!usernameValidation.isValid) {
          return res.status(400).json({
            success: false,
            message: usernameValidation.error,
          });
        }

        // Create new user with empty profile
        user = await prisma.user.create({
          data: {
            email: googleUser.email,
            username: finalUsername,
            name: googleUser.name,
            googleId: googleUser.googleId,
            avatarUrl: googleUser.avatarUrl,
            emailVerified: googleUser.emailVerified,
            profile: {
              create: {
                // Initialize completely empty profile for new users
                jobTitle: "",
                bio: "",
                website: "",
                location: "",
                profileImageUrl: null,
                resumeUrl: null,
                skills: [],
                showLinks: true,
                showExperience: true,
                showPortfolio: true,
                showEducation: true,
                showTitles: true,
              },
            },
          },
          include: {
            profile: true,
          },
        });

        logger.info("New user registered", { 
          email: user.email, 
          username: user.username,
          googleId: user.googleId 
        });
      } else {
        // Update existing user data (don't overwrite custom name)
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            // Don't update name - preserve user's custom name
            avatarUrl: googleUser.avatarUrl,
            emailVerified: googleUser.emailVerified,
          },
          include: {
            profile: true,
          },
        });
      }

      // Generate JWT token
      const token = authService.generateToken(user);

      res.json({
        success: true,
        message: "Login successful",
        data: {
          token,
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
            instantMessageSubject: user.instantMessageSubject,
            instantMessageBody: user.instantMessageBody,
          },
        },
      });
    } catch (error) {
      logger.error("Google login error", { error: error.message, stack: error.stack });
      next(error);
    }
  }

  /**
   * Logout user
   */
  async logout(req, res, next) {
    try {
      // For JWT, we don't maintain server-side sessions
      // The client will remove the token
      res.json({
        success: true,
        message: "Logout successful",
      });
    } catch (error) {
      logger.error("Logout error", { error: error.message });
      next(error);
    }
  }

  /**
   * Verify token
   */
  async verifyToken(req, res, next) {
    try {
      const user = req.user; // Set by auth middleware

      res.json({
        success: true,
        data: {
          user: {
            id: user.id,
            email: user.email,
            username: user.username,
            name: user.name,
            avatarUrl: user.avatarUrl,
            emailVerified: user.emailVerified,
            instantMessageSubject: user.instantMessageSubject,
            instantMessageBody: user.instantMessageBody,
          },
        },
      });
    } catch (error) {
      logger.error("Token verification error", { error: error.message });
      next(error);
    }
  }

  /**
   * Check username availability
   */
  async checkUsername(req, res, next) {
    try {
      const { username } = req.params;

      // Validate username format
      const validation = authService.validateUsername(username);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          message: validation.error,
        });
      }

      // Check if username exists
      const existingUser = await prisma.user.findUnique({
        where: { username: username.toLowerCase() },
      });

      res.json({
        success: true,
        data: {
          available: !existingUser,
        },
      });
    } catch (error) {
      logger.error("Username check error", { error: error.message, username: req.params.username });
      next(error);
    }
  }

  /**
   * Verify email (for future use)
   */
  async verifyEmail(req, res, next) {
    try {
      const { token } = req.body;

      if (!token) {
        return res.status(400).json({
          success: false,
          message: "Verification token is required",
        });
      }

      // Find verification record
      const verification = await prisma.emailVerification.findUnique({
        where: { token },
        include: { user: true },
      });

      if (!verification) {
        return res.status(404).json({
          success: false,
          message: "Invalid verification token",
        });
      }

      // Check if token is expired
      if (verification.expiresAt < new Date()) {
        return res.status(400).json({
          success: false,
          message: "Verification token has expired",
        });
      }

      // Update user email verified status
      await prisma.user.update({
        where: { id: verification.userId },
        data: { emailVerified: true },
      });

      // Mark verification as used
      await prisma.emailVerification.update({
        where: { id: verification.id },
        data: { usedAt: new Date() },
      });

      res.json({
        success: true,
        message: "Email verified successfully",
      });
    } catch (error) {
      logger.error("Email verification error", { error: error.message });
      next(error);
    }
  }
}

module.exports = new AuthController();
