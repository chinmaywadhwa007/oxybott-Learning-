const esbuild = require('esbuild');
const fs = require('fs');
const path = require('path');

const projectRoot = path.resolve(__dirname, '../../');
const backendSrc = path.resolve(projectRoot, 'backend/src/agent/agentServer.ts');
const agentAppDir = path.resolve(projectRoot, 'agent-app');
const distDir = path.resolve(agentAppDir, 'dist');
const binDir = path.resolve(agentAppDir, 'resources/bin');

console.log('📦 [AGENT BUNDLER] Starting build process...');

// Ensure output directories exist
fs.mkdirSync(distDir, { recursive: true });
fs.mkdirSync(binDir, { recursive: true });

// 1. Bundle TypeScript agentServer into single CommonJS bundle
try {
  esbuild.buildSync({
    entryPoints: [backendSrc],
    bundle: true,
    platform: 'node',
    target: 'node18',
    format: 'cjs',
    outfile: path.join(distDir, 'agentServer.cjs'),
    logLevel: 'info',
  });
  console.log('✅ [AGENT BUNDLER] Compiled backend agent to agent-app/dist/agentServer.cjs');
} catch (err) {
  console.error('❌ [AGENT BUNDLER] Compilation failed:', err);
  process.exit(1);
}

// 2. Copy Arduino CLI executable into agent-app/resources/bin/
const arduinoCliSource = process.env.ARDUINO_CLI_PATH || 'E:\\arduino\\arduino-cli.exe';
const targetCliPath = path.join(binDir, 'arduino-cli.exe');

if (fs.existsSync(arduinoCliSource)) {
  fs.copyFileSync(arduinoCliSource, targetCliPath);
  console.log(`✅ [AGENT BUNDLER] Bundled Arduino CLI binary from ${arduinoCliSource} to ${targetCliPath}`);
} else {
  console.warn(`⚠️ [AGENT BUNDLER] Warning: ${arduinoCliSource} not found. Please ensure arduino-cli.exe is present.`);
}

console.log('🎉 [AGENT BUNDLER] Pre-packaging bundle complete!');
