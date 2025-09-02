# E-Info.me - Digital Profile Platform

A comprehensive digital profile platform that enables users to create professional digital cards with portfolio galleries, work experience, education, and social links. Built with modern web technologies for seamless user experience and robust performance.

How It's Build:
<img width="1356" height="821" alt="Screenshot 2025-09-02 at 10 26 41 PM" src="https://github.com/user-attachments/assets/60bf2317-b6e9-46f7-906c-c828bed75137" />


## Table of Contents

- [About](#about)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Project Structure](#project-structure)
- [Deployment](#deployment)
- [Contributing](#contributing)

## About

E-Info.me is a modern digital profile platform designed to help professionals create comprehensive online profiles. The platform offers a complete solution for showcasing work experience, education, portfolios, and social connections in a clean, professional format. Users can create shareable digital cards and manage their professional presence through an intuitive interface.

The application features secure Google OAuth authentication, real-time profile management, image uploads via Cloudinary, and email messaging capabilities. Built with a focus on performance, security, and user experience.

## Features

**Authentication & Security**
- Google OAuth integration for secure user authentication
- JWT-based session management with automatic token refresh
- Username availability checking with real-time validation
- Secure password-less authentication flow

**Profile Management**
- Comprehensive profile builder with multiple sections
- Real-time profile editing with instant preview
- Public profile pages with shareable URLs
- Profile analytics and view tracking

**Portfolio & Work Experience**
- Portfolio gallery with Cloudinary image management
- Detailed work experience with project descriptions
- Education and certification tracking
- Social links and contact information management

**Communication**
- Direct email messaging through contact forms
- Instant message templates for quick communication
- Email notifications and confirmations
- Contact form with anti-spam protection

**User Interface**
- Responsive design optimized for all devices
- Modern, clean interface with smooth animations
- Dark and light theme support
- Intuitive navigation and user flows

## Tech Stack

**Backend Technologies**
- Node.js with Express.js framework
- PostgreSQL database with Prisma ORM
- Google OAuth 2.0 for authentication
- JWT for session management
- Cloudinary for image storage and optimization
- Nodemailer for email services
- Bcrypt for password hashing

**Frontend Technologies**
- React 18 with TypeScript
- Vite for fast build tooling and development
- Tailwind CSS for modern styling
- Zustand for lightweight state management
- React Router for client-side routing
- Axios for API communication
- React Hook Form for form management

**Development Tools**
- ESLint and Prettier for code quality
- Husky for Git hooks
- GitHub Actions for CI/CD
- Docker for containerization
- Prisma Studio for database management

## Installation

**Prerequisites**
- Node.js version 18.0.0 or higher
- PostgreSQL database (NeonDB recommended)
- Google OAuth credentials
- Cloudinary account for image management
- SMTP email service (Gmail recommended)

**Backend Setup**

1. Clone the repository and navigate to the backend directory:
```bash
git clone <repository-url>
cd einfo/backend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in the .env file

5. Set up the database:
```bash
npx prisma migrate dev
npx prisma generate
```

6. Start the development server:
```bash
npm run dev
```

The backend server will be running on `http://localhost:8000`

**Frontend Setup**

1. Navigate to the frontend directory:
```bash
cd ../frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env
```

4. Configure your environment variables in the .env file

5. Start the development server:
```bash
npm run dev
```

The frontend application will be running on `http://localhost:5173`

## Configuration

**Backend Environment Variables**
```env
# Database Configuration
DATABASE_URL="postgresql://username:password@host:5432/database_name"

# JWT Configuration
JWT_SECRET="your-secure-jwt-secret-key"
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=10080

# Google OAuth Configuration
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME="your-cloudinary-cloud-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# Email Configuration
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USERNAME="your-email@gmail.com"
SMTP_PASSWORD="your-app-password"
FROM_EMAIL="noreply@yourdomain.com"
FROM_NAME="E-Info.me"

# Server Configuration
NODE_ENV="development"
PORT=8000
CORS_ORIGINS="http://localhost:5173"
```

**Frontend Environment Variables**
```env
# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID="your-google-client-id"

# API Configuration
VITE_API_BASE_URL="http://localhost:8000/api"
VITE_APP_URL="http://localhost:5173"
```

## Usage

**Getting Started**
1. Navigate to the application in your browser
2. Click "Sign in with Google" to authenticate
3. Complete your profile setup with basic information
4. Add your work experience, education, and portfolio items
5. Customize your social links and contact information
6. Share your public profile URL with others

**Profile Management**
- Edit your profile information in real-time
- Upload images for your portfolio and profile picture
- Add detailed work experience with project descriptions
- Include education and certifications
- Set up instant message templates for quick communication

**Privacy and Sharing**
- Control the visibility of your profile sections
- Generate shareable URLs for your profile
- Track profile views and engagement
- Manage contact preferences and notifications

## API Documentation

**Authentication Endpoints**
- `POST /api/auth/google` - Authenticate with Google OAuth
- `GET /api/auth/check-username/:username` - Check username availability
- `POST /api/auth/logout` - Logout current user
- `GET /api/auth/verify` - Verify JWT token

**Profile Management Endpoints**
- `GET /api/profile` - Get current user profile
- `PUT /api/profile` - Update profile information
- `GET /api/public/:username` - Get public profile by username

**Portfolio and Experience Endpoints**
- `GET /api/portfolio` - Get portfolio items
- `POST /api/portfolio` - Create new portfolio item
- `PUT /api/portfolio/:id` - Update portfolio item
- `DELETE /api/portfolio/:id` - Delete portfolio item

**Communication Endpoints**
- `POST /api/contact` - Send contact message
- `POST /api/message` - Send direct message
- `GET /api/analytics` - Get profile analytics

## Project Structure

```
einfo/
├── backend/
│   ├── src/
│   │   ├── controllers/          # Request handlers and business logic
│   │   ├── middleware/           # Authentication and validation middleware
│   │   ├── routes/              # API route definitions
│   │   ├── services/            # External service integrations
│   │   ├── config/              # Database and application configuration
│   │   ├── utils/               # Utility functions and helpers
│   │   └── server.js            # Express server setup
│   ├── prisma/
│   │   ├── schema.prisma        # Database schema definition
│   │   └── migrations/          # Database migration files
│   ├── .env.example             # Environment variable template
│   └── package.json             # Backend dependencies
├── frontend/
│   ├── src/
│   │   ├── components/          # Reusable React components
│   │   ├── pages/              # Page components and routes
│   │   ├── services/           # API service functions
│   │   ├── stores/             # Zustand state management
│   │   ├── utils/              # Utility functions
│   │   ├── types/              # TypeScript type definitions
│   │   └── main.tsx            # Application entry point
│   ├── public/                 # Static assets
│   ├── .env.example            # Environment variable template
│   └── package.json            # Frontend dependencies
└── README.md                   # Project documentation
```

## Deployment

**Backend Deployment**
1. Set up a PostgreSQL database (NeonDB, Railway, or similar)
2. Configure environment variables in your hosting platform
3. Deploy the backend to your preferred platform (Railway, Render, Vercel)
4. Run database migrations: `npx prisma migrate deploy`
5. Verify all environment variables are properly set

**Frontend Deployment**
1. Build the production version: `npm run build`
2. Deploy to your preferred platform (Netlify, Vercel, GitHub Pages)
3. Configure environment variables in your hosting platform
4. Ensure API base URL points to your deployed backend
5. Test authentication flow and all functionality

**Recommended Hosting Platforms**
- Backend: Railway, Render, or Vercel
- Frontend: Netlify, Vercel, or GitHub Pages
- Database: NeonDB, Railway PostgreSQL, or Supabase

## Contributing

We welcome contributions to improve E-Info.me. Please follow these steps:

1. Fork the repository
2. Create a feature branch from main
3. Make your changes with clear commit messages
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request with detailed description

**Development Guidelines**
- Follow the existing code style and conventions
- Write clear, descriptive commit messages
- Add appropriate documentation for new features
- Test your changes thoroughly before submitting
- Keep pull requests focused and atomic

**Reporting Issues**
- Use the GitHub issue tracker for bugs and feature requests
- Provide detailed reproduction steps for bugs
- Include relevant error logs and environment information
- Search existing issues before creating new ones

---

Built with modern web technologies for the developer community.
