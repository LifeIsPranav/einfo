# Use the official Node.js 18 runtime as a parent image
FROM node:18-alpine

# Install OpenSSL and other dependencies needed for Prisma
RUN apk add --no-cache openssl

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy the prisma directory
COPY prisma ./prisma/

# Generate Prisma client
RUN npm run generate

# Create the migrations directory
RUN mkdir -p prisma/migrations

# Copy the rest of the application code
COPY . .

# Create uploads directory if it doesn't exist
RUN mkdir -p uploads

# Make start script executable
RUN chmod +x start.sh

# Expose the port the app runs on
EXPOSE 8000
EXPOSE 587

# Define environment variable
ENV NODE_ENV=production
ENV OPENSSL_CONF=/dev/null

# Start the application
CMD ["./start.sh"]
