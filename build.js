const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

// Create build directory if it doesn't exist
if (!fs.existsSync('build')) {
  fs.mkdirSync('build');
}

// Copy index.html to build directory
fs.copyFileSync('index.html', 'build/index.html');

// Build the frontend
console.log('Installing frontend dependencies...');
execSync('cd frontend && npm install', { stdio: 'inherit' });

console.log('Building frontend...');
execSync('cd frontend && npm run build', { stdio: 'inherit' });

// Copy frontend build to root build directory
console.log('Copying frontend build files...');
const frontendBuildDir = path.join(__dirname, 'frontend', 'build');
const buildDir = path.join(__dirname, 'build');

const copyDir = (src, dest) => {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true });
      }
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
};

copyDir(frontendBuildDir, buildDir);

// Make sure API files are properly accessible
console.log('Setting up API files...');
if (!fs.existsSync('build/api')) {
  fs.mkdirSync('build/api', { recursive: true });
}

const apiDir = path.join(__dirname, 'api');
if (fs.existsSync(apiDir)) {
  copyDir(apiDir, path.join(buildDir, 'api'));
}

console.log('Build completed successfully!'); 