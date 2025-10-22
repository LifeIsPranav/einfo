const nodemailer = require("nodemailer");
const logger = require("../utils/logger");

class EmailService {
  constructor() {
    const username = process.env.SMTP_USERNAME;
    const password = process.env.SMTP_PASSWORD;
    const host = process.env.SMTP_HOST;
    const port = parseInt(process.env.SMTP_PORT || "0", 10);
    const secureEnv = process.env.SMTP_SECURE;
    const secure = secureEnv
      ? secureEnv.toLowerCase() === "true"
      : port === 465;

    this.isConfigured = Boolean(username && password);

    if (!this.isConfigured) {
      logger.error("Email service is not configured. Missing SMTP credentials.", {
        hasUsername: Boolean(username),
        hasPassword: Boolean(password),
        hasHost: Boolean(host),
        hasPort: Boolean(port),
      });
      return;
    }

    logger.info("Email service initializing", {
      host: host || 'default (gmail)',
      port: port || 587,
      username: username,
      service: host ? 'custom' : (process.env.SMTP_SERVICE || 'gmail'),
    });

    const transportConfig = host
      ? {
          host,
          port: port || 587,
          secure: port ? secure : false,
          auth: {
            user: username,
            pass: password,
          },
          // Add timeouts to prevent hanging in Docker
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 10000, // 10 seconds
          socketTimeout: 15000, // 15 seconds
          // Connection pooling for better performance
          pool: true,
          maxConnections: 5,
          maxMessages: 10,
          rateDelta: 1000,
          rateLimit: 5,
          // Add TLS options for better compatibility
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
            minVersion: 'TLSv1.2'
          },
          // Enable debug logs in non-production
          debug: process.env.NODE_ENV !== 'production',
          logger: process.env.NODE_ENV !== 'production'
        }
      : {
          service: process.env.SMTP_SERVICE || "gmail",
          auth: {
            user: username,
            pass: password,
          },
          // Add timeouts to prevent hanging in Docker
          connectionTimeout: 10000, // 10 seconds
          greetingTimeout: 10000, // 10 seconds
          socketTimeout: 15000, // 15 seconds
          // Connection pooling for better performance
          pool: true,
          maxConnections: 5,
          maxMessages: 10,
          rateDelta: 1000,
          rateLimit: 5,
          // Add TLS options for better compatibility
          tls: {
            rejectUnauthorized: process.env.NODE_ENV === 'production',
            minVersion: 'TLSv1.2'
          },
          // Enable debug logs in non-production
          debug: process.env.NODE_ENV !== 'production',
          logger: process.env.NODE_ENV !== 'production'
        };

    this.transporter = nodemailer.createTransport(transportConfig);

    // For SendGrid, use verified sender email
    const isSendGrid = host && host.includes('sendgrid');
    this.from = {
      email: process.env.FROM_EMAIL || username,
      name: process.env.FROM_NAME || "E-Info.me",
    };
    
    // Log the from address being used
    logger.info("Email FROM address configured", {
      email: this.from.email,
      name: this.from.name,
      isSendGrid: isSendGrid
    });

    this.verifyTransport();
  }

  async verifyTransport() {
    if (!this.transporter) {
      return;
    }

    try {
      await this.transporter.verify();
      logger.info("Email transporter verified successfully");
    } catch (error) {
      logger.error("Email transporter verification failed", {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Send email using the specified format
   * Shows: "senderEmail has sent you a mail: [message]"
   */
  async sendMessage(senderEmail, receiverEmail, message) {
    if (!this.isConfigured || !this.transporter) {
      logger.error("Attempted to send email without valid SMTP configuration", {
        senderEmail,
        receiverEmail,
      });
      throw new Error("Email service is not configured");
    }

    try {
      const mailOptions = {
        from: `${this.from.name} <${this.from.email}>`,
        to: receiverEmail,
        subject: `New mail from ${senderEmail}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
              <h2 style="color: #333; margin-top: 0;">New Mail from E-Info.me</h2>
              <p style="color: #666; font-size: 16px; margin-bottom: 0;">
                <strong>${senderEmail}</strong> has sent you a mail:
              </p>
            </div>
            <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 8px; margin-bottom: 20px;">
              <p style="color: #333; font-size: 16px; line-height: 1.6; margin: 0;">
                ${message.replace(/\n/g, '<br>')}
              </p>
            </div>
            <div style="background-color: #f8f9fa; padding: 15px; border-radius: 8px; text-align: center;">
              <p style="color: #666; font-size: 14px; margin: 0;">
                This mail was sent through E-Info.me. 
                <a href="https://e-info.me" style="color: #007bff; text-decoration: none;">Visit E-Info.me</a>
              </p>
            </div>
          </div>
        `,
        text: `${senderEmail} has sent you a mail:\n\n${message}\n\nThis mail was sent through E-Info.me.`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info("Mail sent successfully", {
        messageId: info.messageId,
        senderEmail: senderEmail,
        recipientEmail: receiverEmail
      });
      return info;
    } catch (error) {
      // Enhanced error logging for debugging SMTP issues
      logger.error("Email sending failed - DETAILED ERROR", {
        error: error.message,
        errorCode: error.code,
        errorCommand: error.command,
        errorResponse: error.response,
        errorResponseCode: error.responseCode,
        stack: error.stack,
        senderEmail: senderEmail,
        recipientEmail: receiverEmail,
        smtpConfig: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          secure: process.env.SMTP_SECURE,
          service: process.env.SMTP_SERVICE
        }
      });
      
      // Provide more specific error messages
      let errorMessage = error.message;
      if (error.code === 'ETIMEDOUT') {
        errorMessage = 'SMTP connection timeout - unable to reach mail server';
      } else if (error.code === 'ECONNREFUSED') {
        errorMessage = 'SMTP connection refused - mail server rejected connection';
      } else if (error.code === 'EAUTH' || error.responseCode === 535) {
        errorMessage = 'SMTP authentication failed - invalid credentials';
      } else if (error.responseCode === 550) {
        errorMessage = 'Email rejected by recipient server';
      } else if (error.code === 'ESOCKET') {
        errorMessage = 'SMTP socket error - network issue';
      }
      
      throw new Error(`Failed to send email: ${errorMessage}`);
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(email, name, token) {
    if (!this.isConfigured || !this.transporter) {
      logger.error("Attempted to send verification email without valid SMTP configuration", {
        email,
        name,
      });
      throw new Error("Email service is not configured");
    }

    try {
      const verificationUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email?token=${token}`;
      
      const mailOptions = {
        from: `${this.from.name} <${this.from.email}>`,
        to: email,
        subject: "Verify Your E-Info.me Account",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">E-Info.me</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Digital Profile Platform</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; text-align: center;">
              <h2 style="color: #333; margin-top: 0;">Verify Your Email Address</h2>
              <p style="color: #666; font-size: 16px; margin-bottom: 30px;">
                Hi ${name},<br><br>
                Thank you for joining E-Info.me! Please click the button below to verify your email address.
              </p>
              
              <a href="${verificationUrl}" 
                 style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                Verify Email Address
              </a>
              
              <p style="color: #666; font-size: 14px; margin-top: 30px;">
                If the button doesn't work, copy and paste this link into your browser:<br>
                <a href="${verificationUrl}" style="color: #007bff; word-break: break-all;">${verificationUrl}</a>
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                If you didn't create an account with E-Info.me, you can safely ignore this email.
              </p>
            </div>
          </div>
        `,
        text: `Hi ${name},\n\nThank you for joining E-Info.me! Please verify your email address by clicking the link below:\n\n${verificationUrl}\n\nIf you didn't create an account with E-Info.me, you can safely ignore this email.`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info("Verification email sent successfully", {
        messageId: info.messageId,
        email: email,
        name: name
      });
      return info;
    } catch (error) {
      logger.error("Verification email sending failed", {
        error: error.message,
        stack: error.stack,
        email: email,
        name: name
      });
      throw new Error("Failed to send verification email");
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email, name, username) {
    if (!this.isConfigured || !this.transporter) {
      logger.error("Attempted to send welcome email without valid SMTP configuration", {
        email,
        username,
      });
      throw new Error("Email service is not configured");
    }

    try {
      const profileUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/@${username}`;
      
      const mailOptions = {
        from: `${this.from.name} <${this.from.email}>`,
        to: email,
        subject: "Welcome to E-Info.me!",
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #333; margin: 0;">Welcome to E-Info.me!</h1>
              <p style="color: #666; margin: 10px 0 0 0;">Your Digital Profile Platform</p>
            </div>
            
            <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px;">
              <h2 style="color: #333; margin-top: 0;">Hi ${name}! 👋</h2>
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Welcome to E-Info.me! We're excited to have you join our community of professionals creating amazing digital profiles.
              </p>
              
              <p style="color: #666; font-size: 16px; line-height: 1.6;">
                Your profile is now live at: <a href="${profileUrl}" style="color: #007bff; text-decoration: none;">${profileUrl}</a>
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${profileUrl}" 
                   style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">
                  View Your Profile
                </a>
              </div>
              
              <h3 style="color: #333; margin-top: 30px;">What's next?</h3>
              <ul style="color: #666; line-height: 1.8;">
                <li>Complete your profile with your bio, skills, and experience</li>
                <li>Add your social media links and portfolio projects</li>
                <li>Share your profile with friends and colleagues</li>
                <li>Start building your professional network</li>
              </ul>
            </div>
            
            <div style="text-align: center; margin-top: 30px;">
              <p style="color: #666; font-size: 14px;">
                Need help? Reply to this email or visit our support page.
              </p>
            </div>
          </div>
        `,
        text: `Hi ${name}!\n\nWelcome to E-Info.me! We're excited to have you join our community.\n\nYour profile is now live at: ${profileUrl}\n\nWhat's next?\n- Complete your profile with your bio, skills, and experience\n- Add your social media links and portfolio projects\n- Share your profile with friends and colleagues\n- Start building your professional network\n\nNeed help? Reply to this email or visit our support page.`,
      };

      const info = await this.transporter.sendMail(mailOptions);
      logger.info("Welcome email sent successfully", {
        messageId: info.messageId,
        email: email,
        name: name,
        username: username
      });
      return info;
    } catch (error) {
      logger.error("Welcome email sending failed", {
        error: error.message,
        stack: error.stack,
        email: email,
        name: name
      });
      throw new Error("Failed to send welcome email");
    }
  }

  /**
   * Test email configuration
   */
  async testConnection() {
    if (!this.isConfigured || !this.transporter) {
      logger.error("Email service is not configured. Unable to verify transporter.");
      return false;
    }

    try {
      await this.transporter.verify();
      logger.info("Email service is ready");
      return true;
    } catch (error) {
      logger.error("Email service configuration error", {
        error: error.message,
        stack: error.stack
      });
      return false;
    }
  }
}

module.exports = new EmailService();
