#!/bin/bash

# Create build directory if it doesn't exist
mkdir -p build

# Copy index.html to build directory
cp index.html build/

# Build the frontend
cd frontend
npm install
npm run build
cd ..

# Copy frontend build to root build directory
cp -r frontend/build/* build/

# Make sure API files are properly accessible
mkdir -p build/api
cp -r api/* build/api/

echo "Build completed successfully!" 