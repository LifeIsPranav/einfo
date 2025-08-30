# Database Connection & Deployment Guide

## Issues Fixed

### 1. SSL/TLS Connection Error
**Problem**: `Error opening a TLS connection: OpenSSL error`

**Solution**: 
- Removed `channel_binding=require` from DATABASE_URL
- Added proper SSL configuration for production
- Implemented connection retry logic with exponential backoff

### 2. Database Connection Management
**Improvements**:
- Centralized Prisma client configuration in `src/config/database.js`
- All controllers and scripts now use the same database instance
- Added connection timeout and retry mechanisms
- Proper error handling and logging

### 3. Server Startup Process
**New Process**:
1. Test database connection with retries
2. Check migration status (production only)
3. Start HTTP server
4. Comprehensive error reporting with troubleshooting guides

## Environment Configuration

### For Render Deployment

#### Environment Variables Required:
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require&connect_timeout=20
JWT_SECRET=your_jwt_secret
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
NODE_ENV=production
```

#### Build Command:
```bash
npm install && npm run generate && npm run pre-deploy
```

#### Start Command:
```bash
npm start
```

## Testing Commands

### Local Development:
```bash
# Test database connection
npm run test-connection

# Test SSL connection specifically
npm run test-ssl

# Run pre-deployment checks
npm run pre-deploy

# Start development server
npm run dev
```

### Troubleshooting

#### If you get SSL/TLS errors:
1. Check DATABASE_URL format
2. Ensure `sslmode=require` is present
3. Remove `channel_binding=require` if present
4. Add `connect_timeout=20` for cloud deployments

#### If database connection times out:
1. Check network connectivity
2. Verify database server is running
3. Check firewall settings
4. Increase connection timeout

#### Health Check Endpoints:
- `GET /` - Basic health check
- `GET /health` - Detailed server health
- `GET /health/db` - Database connection status

## Database Migration Strategy

### For Production:
1. Migrations are checked automatically on startup
2. Server will not start if migrations are pending
3. Run `npm run migrate-deploy` to apply pending migrations

### Migration Status:
```bash
npm run migrate-status
```

## Deployment Checklist

Before deploying:
- [ ] Run `npm run pre-deploy` locally
- [ ] Verify all environment variables are set
- [ ] Test database connection
- [ ] Check migration status
- [ ] Verify SSL configuration

## Production Monitoring

The server now provides detailed logging and error reporting:
- Database connection status
- Migration status
- Environment configuration
- Performance metrics
- Error diagnostics with troubleshooting guides

## Common Issues and Solutions

### 1. `channel_binding=require` Error
**Solution**: Remove this parameter from DATABASE_URL

### 2. Connection Timeout in Production
**Solution**: Add `connect_timeout=20` to DATABASE_URL

### 3. SSL Certificate Issues
**Solution**: Use `sslmode=require` instead of `sslmode=verify-full`

### 4. Migration Errors
**Solution**: Check migration status and run `migrate-deploy` if needed

## Support

If you encounter issues:
1. Check the detailed error messages in logs
2. Use the troubleshooting guides provided by the server
3. Run the appropriate test commands
4. Verify environment configuration
