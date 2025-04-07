#!/bin/bash

# Ensure script exits on error
set -e

echo "Starting deployment to Vercel..."

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

# Verify the API directory structure
echo "Verifying API structure..."
if [ ! -d "api" ]; then
    echo "Error: 'api' directory not found in the root of the project."
    exit 1
fi

if [ ! -f "api/index.py" ]; then
    echo "Error: 'api/index.py' file not found."
    exit 1
fi

# Run the local build script
echo "Running local build process..."
chmod +x build-local.sh
./build-local.sh

# Deploy to Vercel
echo "Deploying to Vercel..."
vercel --prod

echo "Deployment complete!" 