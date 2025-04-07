#!/bin/bash

# Ensure script exits on error
set -e

echo "Starting local build process..."

# Build frontend
echo "Building frontend..."
cd frontend
npm install
CI=false npm run build
cd ..

# Set up Python virtual environment for API
echo "Setting up Python virtual environment for API..."
cd api
python3 -m venv venv
source venv/bin/activate
pip install --upgrade pip
pip install -r requirements.txt
cd ..

echo "Local build complete. You can now run 'vercel' to deploy." 