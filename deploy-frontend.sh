#!/bin/bash

# Ensure script exits on error
set -e

echo "Starting frontend deployment to Vercel..."

# Install Vercel CLI if not installed
if ! command -v vercel &> /dev/null; then
    echo "Installing Vercel CLI..."
    npm install -g vercel
fi

# Check if user is logged in to Vercel
echo "Checking Vercel login status..."
if ! vercel whoami &> /dev/null; then
    echo "Please login to Vercel:"
    vercel login
fi

# Build frontend
echo "Building frontend..."
cd frontend
npm install

# Ensure environment variable is set correctly
echo "Configuring environment variables..."
echo "REACT_APP_API_URL=https://beatbotdeployment-production.up.railway.app/" > .env.production.local

CI=false npm run build
cd ..

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod --env REACT_APP_API_URL=https://beatbotdeployment-production.up.railway.app/

echo "Deployment complete!"
echo "Note: Your backend should be deployed separately due to Vercel's 250MB size limit."
echo "The frontend is configured to use: https://beatbotdeployment-production.up.railway.app/ as the API URL." 