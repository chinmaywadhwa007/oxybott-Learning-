import { Request, Response } from 'express';
import { detectConnectedBoards, detectSerialPorts } from '../services/boardDetector.js';
import { compileArduinoCode } from '../services/arduinoCompiler.js';
import { uploadArduinoCode } from '../services/uploader.js';
import { LibraryManagerService } from '../services/libraryManagerService.js';

export async function getBoardsController(_req: Request, res: Response): Promise<void> {
  try {
    const result = await detectConnectedBoards();
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to detect board profiles' });
  }
}

export async function getPortsController(_req: Request, res: Response): Promise<void> {
  try {
    const ports = await detectSerialPorts();
    res.json({ ports });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to detect serial ports' });
  }
}

export async function compileController(req: Request, res: Response): Promise<void> {
  try {
    const { code, fqbn } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Valid Arduino code string is required' });
      return;
    }
    const targetFqbn = fqbn || 'arduino:avr:uno';
    console.log('\n======================================================');
    console.log('[BACKEND COMPILER] 5. Code received by Arduino CLI:');
    console.log(`Target FQBN: ${targetFqbn}`);
    console.log('--- CODE START ---');
    console.log(code);
    console.log('--- CODE END ---');
    console.log('======================================================\n');

    const result = await compileArduinoCode(code, targetFqbn);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Compilation failed' });
  }
}

export async function uploadController(req: Request, res: Response): Promise<void> {
  try {
    const { code, fqbn, port } = req.body;
    if (!code || typeof code !== 'string') {
      res.status(400).json({ error: 'Valid Arduino code string is required' });
      return;
    }
    const targetFqbn = fqbn || 'arduino:avr:uno';
    const targetPort = port || 'COM3';
    console.log('\n======================================================');
    console.log('[BACKEND UPLOADER] 5. Code received for Upload:');
    console.log(`Target FQBN: ${targetFqbn} | Port: ${targetPort}`);
    console.log('--- CODE START ---');
    console.log(code);
    console.log('--- CODE END ---');
    console.log('======================================================\n');

    const result = await uploadArduinoCode(code, targetFqbn, targetPort);
    res.json(result);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Upload failed' });
  }
}

export async function searchLibrariesController(req: Request, res: Response): Promise<void> {
  try {
    const q = (req.query.q as string) || '';
    const libraries = await LibraryManagerService.searchLibraries(q);
    res.json({ libraries });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to search libraries' });
  }
}

export async function installLibraryController(req: Request, res: Response): Promise<void> {
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
}

export async function removeLibraryController(req: Request, res: Response): Promise<void> {
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
}

export async function updateLibraryController(req: Request, res: Response): Promise<void> {
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
}
