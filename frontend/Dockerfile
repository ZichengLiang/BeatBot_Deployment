# Use Node.js LTS version with alpine for smaller image size
FROM node:20-alpine

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including dev dependencies needed for building
RUN npm ci && \
    npm cache clean --force

# Copy all necessary files
COPY . .

# Build the application
RUN npm run build

# Verify build output exists
RUN ls -la build/

# Install serve globally
RUN npm install -g serve

# Expose port 3000
EXPOSE 3000

# Start the application
CMD ["serve", "-s", "build", "-l", "3000"]