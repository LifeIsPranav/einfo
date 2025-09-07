# Render Deployment Guide

## Package.json Scripts Added

The following scripts have been added to support Render deployment:

- **`build`**: Runs after npm install during deployment. Generates Prisma client and deploys migrations.
- **`postinstall`**: Automatically generates Prisma client after dependencies are installed.
- **`deploy`**: Alternative deployment command that runs migrations and starts the server.
- **`start`**: Production start command (already existed).

## Render Configuration

When setting up your service on Render:

### 1. Service Configuration
- **Environment**: Node
- **Build Command**: `npm install`
- **Start Command**: `npm start`
- **Auto Deploy**: Yes (recommended)

### 2. Environment Variables
Make sure to set these environment variables in your Render dashboard:

```
DATABASE_URL=your_postgresql_connection_string
NODE_ENV=production
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email_user
EMAIL_PASS=your_email_password
CORS_ORIGIN=your_frontend_url
SESSION_SECRET=your_session_secret
```

### 3. Database Setup
- Create a PostgreSQL database on Render or use an external provider
- Copy the database URL to your environment variables
- The `build` script will automatically run migrations during deployment

### 4. Deployment Process
1. Push your code to GitHub
2. Connect your GitHub repository to Render
3. Set the environment variables
4. Deploy!

## Build Process
The build process will:
1. Install dependencies (`npm install`)
2. Generate Prisma client (`npx prisma generate`)
3. Deploy database migrations (`npx prisma migrate deploy`)
4. Start the application (`npm start`)

## Health Check
Your server should be accessible at the Render-provided URL. The health check endpoint (if you have one) should return a 200 status.

## Troubleshooting
- Check Render logs for any deployment issues
- Ensure all environment variables are properly set
- Verify database connection string is correct
- Make sure your database allows connections from Render's IP ranges
