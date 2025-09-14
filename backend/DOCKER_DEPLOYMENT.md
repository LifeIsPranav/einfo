# Docker Deployment Guide for E-Info Backend

This guide will help you deploy your E-Info backend using Docker containers.

## Prerequisites

1. **Docker & Docker Compose**: Make sure you have Docker and Docker Compose installed on your system.
   - [Install Docker](https://docs.docker.com/get-docker/)
   - Docker Compose usually comes with Docker Desktop

2. **Environment Variables**: You need a `.env` file with your configuration.

## Quick Start

### 1. Create your .env file

Copy your existing `.env` file to the backend directory, or create one using the template:

```bash
cp .env.example .env
```

Then edit the `.env` file with your actual values (especially your Neon DB connection string).

### 2. Deploy using the script

Run the deployment script:

```bash
./deploy-docker.sh
```

This script will:
- Build the Docker image
- Start the container
- Show you the status

### 3. Manual Deployment (Alternative)

If you prefer to run commands manually:

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

## Important Environment Variables

Make sure these are set in your `.env` file:

- `DATABASE_URL`: Your Neon PostgreSQL connection string
- `JWT_SECRET`: A secure secret for JWT tokens
- `GOOGLE_CLIENT_ID` & `GOOGLE_CLIENT_SECRET`: For Google OAuth
- `CLOUDINARY_*`: For image uploads
- `SMTP_*`: For email functionality
- `CORS_ORIGINS`: Allowed origins for CORS

## Container Details

- **Port**: The backend runs on port 8000
- **Health Check**: The container includes health checks
- **Volumes**: Upload directory is mounted as a volume
- **Restart Policy**: Container restarts automatically unless stopped

## Useful Commands

```bash
# View container status
docker-compose ps

# View logs
docker-compose logs -f backend

# Restart the backend
docker-compose restart backend

# Stop everything
docker-compose down

# Rebuild and restart
docker-compose up -d --build

# Access container shell (for debugging)
docker-compose exec backend sh
```

## Database Setup

The container automatically runs:
1. `npm install` - Install dependencies
2. `npm run generate` - Generate Prisma client
3. `mkdir -p prisma/migrations` - Create migrations directory
4. `npx prisma db push --accept-data-loss` - Push schema to database
5. `npm start` - Start the application

## Troubleshooting

### Container won't start
- Check your `.env` file for correct values
- Verify your DATABASE_URL is correct
- Check logs: `docker-compose logs backend`

### Database connection issues
- Ensure your Neon DB is accessible
- Verify the DATABASE_URL format
- Check if your IP is whitelisted in Neon

### Port conflicts
- If port 8000 is in use, change it in `docker-compose.yml`
- Update the port mapping: `"8001:8000"` (host:container)

## Production Deployment

For production deployment on platforms like:

### Railway
1. Connect your GitHub repository
2. Set environment variables in Railway dashboard
3. Railway will automatically detect and use your Dockerfile

### Render
1. Connect your GitHub repository
2. Choose "Docker" as build method
3. Set environment variables in Render dashboard

### DigitalOcean App Platform
1. Connect your GitHub repository
2. Configure as a Docker service
3. Set environment variables

### Heroku
1. Install Heroku CLI
2. Create a new Heroku app
3. Set environment variables
4. Deploy using Git or GitHub integration

## Security Notes

- Never commit your `.env` file
- Use strong JWT secrets in production
- Ensure your database connection is secure
- Configure CORS_ORIGINS properly for production domains
