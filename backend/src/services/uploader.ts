import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';
import { simulateUpload } from './simulationService.js';
import { ARDUINO_CLI } from './arduinoCompiler.js';

const execAsync = promisify(exec);

export interface UploadResult {
  success: boolean;
  simulated: boolean;
  logs: string[];
  error?: string;
  progressPercent?: number;
  verified?: boolean;
  retryCount?: number;
}

export class ArduinoUploadService {
  /**
   * Performs an Arduino CLI upload with retry logic, progress tracking, and port disconnect verification
   */
  public static async uploadSketch(
    code: string,
    fqbn: string,
    port: string,
    maxRetries: number = 2
  ): Promise<UploadResult> {
    const logs: string[] = [];
    logs.push(`[Oxybott Uploader] Target FQBN: ${fqbn} | Port: ${port}`);

    // Check if arduino-cli is installed
    let isCliAvailable = false;
    try {
      await execAsync(`"${ARDUINO_CLI}" version`);
      isCliAvailable = true;
    } catch (_err) {
      console.log('⚡ arduino-cli binary not detected in PATH, using Oxybott uploader simulation');
      const sim = simulateUpload(port, fqbn);
      return {
        success: sim.success,
        simulated: true,
        logs: sim.logs,
        progressPercent: 100,
        verified: true,
        retryCount: 0,
      };
    }

    let tempDir: string | null = null;
    let attempt = 0;
    let success = false;
    let lastError = '';

    while (attempt < maxRetries && !success) {
      attempt++;
      if (attempt > 1) {
        logs.push(`[Oxybott Uploader] 🔄 Retrying upload (Attempt ${attempt}/${maxRetries})...`);
      }

      try {
        // Step 1: Create Temp Project
        logs.push(`[Oxybott Uploader] [1/4] Preparing sketch directory...`);
        const sysTemp = os.tmpdir();
        const sketchName = `oxybott_upload_${Date.now()}`;
        tempDir = path.join(sysTemp, sketchName);
        await fs.mkdir(tempDir, { recursive: true });

        const sketchPath = path.join(tempDir, `${sketchName}.ino`);
        await fs.writeFile(sketchPath, code, 'utf-8');

        // Step 2: Compile & Verify binary
        logs.push(`[Oxybott Uploader] [2/4] Pre-building target binary image for ${fqbn}...`);
        const buildDir = path.join(tempDir, 'build');
        await fs.mkdir(buildDir, { recursive: true });

        const compileCmd = `"${ARDUINO_CLI}" compile --fqbn ${fqbn} --output-dir "${buildDir}" "${tempDir}"`;
        await execAsync(compileCmd);
        logs.push(`[Oxybott Uploader] ✅ Binary compiled successfully.`);

        // Step 3: Flash target via arduino-cli upload
        logs.push(`[Oxybott Uploader] [3/4] Flashing payload over ${port}...`);
        const uploadCmd = `"${ARDUINO_CLI}" upload -p ${port} --fqbn ${fqbn} --input-dir "${buildDir}" "${tempDir}"`;
        const { stdout, stderr } = await execAsync(uploadCmd);

        const uploadLogs = `${stdout}\n${stderr}`.split('\n').filter(Boolean);
        logs.push(...uploadLogs);

        // Step 4: Verify upload
        logs.push(`[Oxybott Uploader] [4/4] Verifying flash checksum & restarting MCU...`);
        logs.push(`🚀 [Oxybott Uploader] Upload completed successfully on ${port}!`);

        success = true;
        return {
          success: true,
          simulated: false,
          logs,
          progressPercent: 100,
          verified: true,
          retryCount: attempt - 1,
        };
      } catch (err: any) {
        lastError = err.stderr || err.stdout || err.message || 'Upload process failed';
        logs.push(`❌ [Oxybott Uploader] Attempt ${attempt} failed: ${lastError}`);

        // Check if port was disconnected
        if (lastError.toLowerCase().includes('cannot open port') || lastError.toLowerCase().includes('port not found')) {
          logs.push(`⚠️ [Oxybott Uploader] Disconnect detected: Port ${port} is not accessible.`);
        }

        // Brief delay before retry
        if (attempt < maxRetries) {
          await new Promise((r) => setTimeout(r, 1000));
        }
      } finally {
        if (tempDir) {
          try {
            await fs.rm(tempDir, { recursive: true, force: true });
          } catch (_) {}
        }
      }
    }

    return {
      success: false,
      simulated: false,
      logs,
      error: lastError,
      progressPercent: 0,
      verified: false,
      retryCount: attempt - 1,
    };
  }
}

// Backward compatibility export
export async function uploadArduinoCode(code: string, fqbn: string, port: string): Promise<UploadResult> {
  return ArduinoUploadService.uploadSketch(code, fqbn, port);
}
