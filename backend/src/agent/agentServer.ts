import express from 'express';
import cors from 'cors';
import { detectConnectedBoards, detectSerialPorts } from '../services/boardDetector.js';
import { compileArduinoCode, ArduinoCompilerService } from '../services/arduinoCompiler.js';
import { uploadArduinoCode } from '../services/uploader.js';
import { LibraryManagerService } from '../services/libraryManagerService.js';

const app = express();
const AGENT_PORT = process.env.AGENT_PORT || 8765;

// CORS allowing all origins so web applications deployed on Vercel or localhost can connect to http://127.0.0.1:8765
app.use(
  cors({
    origin: (_origin, callback) => {
      // Allow all origins (Vercel, localhost, etc.)
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(express.json());

// 1. Healthcheck Endpoint
app.get('/health', async (_req, res) => {
  const cliStatus = await ArduinoCompilerService.detectArduinoCli();
  res.json({
    status: 'ok',
    agent: 'Oxybott Local Arduino Agent v1.0',
    platform: process.platform,
    cliInstalled: cliStatus.isAvailable,
    cliVersion: cliStatus.version,
    timestamp: new Date().toISOString(),
  });
});

// 2. Hardware Boards Endpoint
app.get('/boards', async (_req, res) => {
  try {
    const result = await detectConnectedBoards();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to detect board profiles' });
  }
});

// 3. Physical Serial Ports Endpoint (Scans COM ports on Windows laptop)
app.get('/ports', async (_req, res) => {
  try {
    const ports = await detectSerialPorts();
    res.json({ ports });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to detect local serial ports' });
  }
});

// 4. Local Sketch Compilation Endpoint (Runs local arduino-cli compile)
app.post('/compile', async (req, res) => {
  try {
    const { code, fqbn } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Valid Arduino code string is required' });
      return;
    }
    const targetFqbn = fqbn || 'arduino:avr:uno';
    console.log('\n======================================================');
    console.log(`[LOCAL AGENT COMPILER] Code received for compilation`);
    console.log(`Target FQBN: ${targetFqbn}`);
    console.log('======================================================\n');

    const result = await compileArduinoCode(code, targetFqbn);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Local compilation failed' });
  }
});

// 5. Local Sketch Flashing/Upload Endpoint (Uploads over physical COM port)
app.post('/upload', async (req, res) => {
  try {
    const { code, fqbn, port } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Valid Arduino code string is required' });
      return;
    }
    if (!port) {
      res.status(400).json({ error: 'Target COM port is required for hardware upload' });
      return;
    }
    const targetFqbn = fqbn || 'arduino:avr:uno';
    console.log('\n======================================================');
    console.log(`[LOCAL AGENT UPLOADER] Code received for hardware upload`);
    console.log(`Target FQBN: ${targetFqbn} | COM Port: ${port}`);
    console.log('======================================================\n');

    const result = await uploadArduinoCode(code, targetFqbn, port);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Local hardware upload failed' });
  }
});

// 6. Library Management Endpoints
app.get('/libraries', async (req, res) => {
  try {
    const q = (req.query.q as string) || '';
    const libraries = await LibraryManagerService.searchLibraries(q);
    res.json({ libraries });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to search libraries' });
  }
});

app.post('/libraries/install', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Library name is required' });
      return;
    }
    const result = await LibraryManagerService.installLibrary(name);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to install library' });
  }
});

app.post('/libraries/remove', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Library name is required' });
      return;
    }
    const result = await LibraryManagerService.removeLibrary(name);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to remove library' });
  }
});

app.post('/libraries/update', async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      res.status(400).json({ error: 'Library name is required' });
      return;
    }
    const result = await LibraryManagerService.updateLibrary(name);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to update library' });
  }
});

// Process resilience
process.on('unhandledRejection', (reason) => {
  console.error('⚠️ [AGENT UNHANDLED REJECTION]:', reason);
});

process.on('uncaughtException', (err) => {
  console.error('❌ [AGENT UNCAUGHT EXCEPTION]:', err);
});

// Start Local Express Agent Server
const server = app.listen(AGENT_PORT, () => {
  console.log(`\n=============================================================`);
  console.log(`⚡ [OXYBOTT LOCAL ARDUINO AGENT] Running on http://127.0.0.1:${AGENT_PORT}`);
  console.log(`👉 Agent Healthcheck: http://127.0.0.1:${AGENT_PORT}/health`);
  console.log(`👉 Hardware Ports: http://127.0.0.1:${AGENT_PORT}/ports`);
  console.log(`=============================================================\n`);
});

server.on('error', (err: any) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`⚠️ [OXYBOTT LOCAL AGENT]: Port ${AGENT_PORT} is already bound by an active agent process.`);
  } else {
    console.error('❌ [OXYBOTT LOCAL AGENT SERVER ERROR]:', err);
  }
});
