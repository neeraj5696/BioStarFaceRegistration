const { execSync } = require('child_process');
const fs = require('fs');

console.log('🔨 Building KRMU Face Enrollment System...');

if (!fs.existsSync('dist')) fs.mkdirSync('dist');

console.log('🚀 Creating executable...');
try {
  try { if (fs.existsSync('dist/krmu-magnum.exe')) fs.rmSync('dist/krmu-magnum.exe', { force: true }); } catch (e) {}
  execSync('npx pkg -t node18-win-x64 server.js -o dist/krmu-magnum.exe --compress GZip', { stdio: 'inherit' });
} catch {
  try { if (fs.existsSync('dist/krmu-magnum.exe')) fs.rmSync('dist/krmu-magnum.exe', { force: true }); } catch (e) {}
  execSync('npx pkg -t node16-win-x64 server.js -o dist/krmu-magnum.exe --compress GZip', { stdio: 'inherit' });
}

console.log('📄 Copying configuration files...');

// Copy .env file - CRITICAL for executable to run
if (fs.existsSync('.env')) { fs.copyFileSync('.env', 'dist/.env');
  console.log('✓ Copied .env');
} else { console.warn('⚠ WARNING: .env file not found! The executable may fail.');
}


fs.copyFileSync('installer.bat', 'dist/installer.bat');
if (fs.existsSync('ecosystem.config.js')) { fs.copyFileSync('ecosystem.config.js', 'dist/ecosystem.config.js');
}

// copy the dist_folder (handled below)

// Copy frontend dist folder (directory) recursively
const path = require('path');
const frontendSrc = 'dist_frontend';
const frontendDest = 'dist/dist_frontend';
if (fs.existsSync(frontendSrc)) {
  try {
    if (typeof fs.cpSync === 'function') {
      fs.cpSync(frontendSrc, frontendDest, { recursive: true, force: true });
    } else {
      // Fallback for older Node.js: simple recursive copy
      const copyDirSync = (src, dest) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) copyDirSync(srcPath, destPath);
          else fs.copyFileSync(srcPath, destPath);
        }
      };
      copyDirSync(frontendSrc, frontendDest);
    }
    console.log('✓ Copied frontend dist folder');
  } catch (err) {
    console.error('Error copying frontend files:', err);
  }
} else {
  console.warn('⚠ WARNING: frontend dist folder not found:', frontendSrc);
}

// Create logs folder if it doesn't exist
if (!fs.existsSync('dist/logs')) {
  fs.mkdirSync('dist/logs', { recursive: true });
  console.log('✓ Created logs folder');
}

//making data folder and copying contents
if(!fs.existsSync('dist/data')){
  fs.mkdirSync('dist/data', { recursive: true });
}

// Copy data folder contents if it exists
const dataSrc = 'data';
const dataDest = 'dist/data';
if (fs.existsSync(dataSrc)) {
  try {
    if (typeof fs.cpSync === 'function') {
      fs.cpSync(dataSrc, dataDest, { recursive: true, force: true });
    } else {
      // Fallback for older Node.js: simple recursive copy
      const copyDirSync = (src, dest) => {
        if (!fs.existsSync(dest)) fs.mkdirSync(dest, { recursive: true });
        const entries = fs.readdirSync(src, { withFileTypes: true });
        for (const entry of entries) {
          const srcPath = path.join(src, entry.name);
          const destPath = path.join(dest, entry.name);
          if (entry.isDirectory()) copyDirSync(srcPath, destPath);
          else fs.copyFileSync(srcPath, destPath);
        }
      };
      copyDirSync(dataSrc, dataDest);
    }
    console.log('✓ Copied data folder contents');
  } catch (err) {
    console.error('Error copying data files:', err);
  }
} else {
  console.log('ℹ Data folder not found, creating empty data folder');
}

console.log('✅ Build complete!');
console.log('📁 Contents in dist folder:');
fs.readdirSync('dist').forEach(file => {
  const stats = fs.statSync(path.join('dist', file));
  console.log(`  ${stats.isDirectory() ? '📁' : '📄'} ${file}`);
});
