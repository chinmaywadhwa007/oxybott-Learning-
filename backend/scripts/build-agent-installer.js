import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../../');
const agentAppDir = path.resolve(projectRoot, 'agent-app');
const installerDistDir = path.resolve(projectRoot, 'installer-dist');
const agentDistDir = path.resolve(agentAppDir, 'dist');

console.log('\n=============================================================');
console.log('🚀 [OXYBOTT INSTALLER BUILDER] Clean Packaging Pipeline...');
console.log('=============================================================\n');

// 1. Clean old build artifacts
console.log('Step 1/4: Cleaning old installer build artifacts...');
if (fs.existsSync(installerDistDir)) {
  fs.rmSync(installerDistDir, { recursive: true, force: true });
}
if (fs.existsSync(agentDistDir)) {
  fs.rmSync(agentDistDir, { recursive: true, force: true });
}

// 2. Install dependencies if needed
console.log('\nStep 2/4: Verifying agent application dependencies...');
execSync('npm install', { cwd: agentAppDir, stdio: 'inherit' });

// 3. Bundle agent server & copy arduino-cli.exe
console.log('\nStep 3/4: Bundling Oxybott Local Agent & Arduino CLI...');
execSync('npm run bundle', { cwd: agentAppDir, stdio: 'inherit' });

// 4. Build NSIS Windows Installer
console.log('\nStep 4/4: Building Windows NSIS Installer (Oxybott Agent Setup)...');
execSync('npx electron-builder --win nsis', { cwd: agentAppDir, stdio: 'inherit' });

// Create copy as Oxybott-Agent-Setup.exe if named with version
const generatedInstaller = path.join(installerDistDir, 'Oxybott Agent Setup 1.0.0.exe');
const targetInstaller = path.join(installerDistDir, 'Oxybott-Agent-Setup.exe');

if (fs.existsSync(generatedInstaller)) {
  fs.copyFileSync(generatedInstaller, targetInstaller);
}

console.log('\n=============================================================');
console.log('🎉 [OXYBOTT INSTALLER BUILDER] Installer created successfully!');
console.log(`📁 Primary Installer Output: ${targetInstaller}`);
console.log('=============================================================\n');
