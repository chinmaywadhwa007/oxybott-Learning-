import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

import fsSync from 'fs';

const getDefaultArduinoCli = (): string => {
  if (process.env.ARDUINO_CLI_PATH) {
    return process.env.ARDUINO_CLI_PATH;
  }

  if (process.platform === 'win32') {
    // 1. Check relative app process directory & Electron resources path
    const appDir = process.cwd();
    const electronResources = (typeof process !== 'undefined' && (process as any).resourcesPath)
      ? (process as any).resourcesPath
      : '';

    const candidatePaths = [
      electronResources ? path.join(electronResources, 'bin', 'arduino-cli.exe') : '',
      path.join(appDir, 'resources', 'bin', 'arduino-cli.exe'),
      path.join(appDir, 'bin', 'arduino-cli.exe'),
      path.join(path.dirname(process.execPath), 'resources', 'bin', 'arduino-cli.exe'),
      path.join(path.dirname(process.execPath), 'bin', 'arduino-cli.exe'),
      'E:\\arduino\\arduino-cli.exe',
    ].filter(Boolean);

    for (const p of candidatePaths) {
      if (fsSync.existsSync(p)) {
        return p;
      }
    }
    return 'arduino-cli';
  }
  return 'arduino-cli';
};

export const ARDUINO_CLI = getDefaultArduinoCli();

export interface MemoryUsage {
  flashBytes: number;
  flashPercent: number;
  maxFlashBytes: number;
  sramBytes: number;
  sramPercent: number;
  maxSramBytes: number;
}

export interface ArduinoCompileResponse {
  success: boolean;
  simulated?: boolean;
  logs?: string[];
  warnings?: string[];
  errors?: string[];
  memoryUsage?: MemoryUsage;
  compileTimeMs?: number;
  sketchSize?: string;
  dynamicMem?: string;
  error?: string;
  details?: string;
  platform?: string;
  expectedPath?: string;
  path?: string;
  exitCode?: number;
  code?: number;
  stderr?: string;
  stdout?: string;
  commandExecuted?: string;
  command?: string;
}

export class ArduinoCompilerService {
  /**
   * Detects if Arduino CLI is installed and available in PATH / specified location
   */
  public static async detectArduinoCli(): Promise<{ isAvailable: boolean; version?: string; errorDetails?: string }> {
    try {
      if (process.platform !== 'win32') {
        try {
          await execAsync(`which "${ARDUINO_CLI}"`, { timeout: 5000 });
        } catch (_whichErr) {
          return {
            isAvailable: false,
            errorDetails: 'Arduino CLI is not installed on this server.\nCompilation cannot run on Render until Arduino CLI is installed.',
          };
        }
      }

      const { stdout } = await execAsync(`"${ARDUINO_CLI}" version`, { timeout: 5000 });
      const versionStr = stdout.trim();
      return { isAvailable: true, version: versionStr };
    } catch (_err: any) {
      const details = process.platform !== 'win32'
        ? 'Arduino CLI is not installed on this server.\nCompilation cannot run on Render until Arduino CLI is installed.'
        : `Arduino CLI executable not found at specified path or in system PATH (${ARDUINO_CLI}).`;
      return { isAvailable: false, errorDetails: details };
    }
  }

  /**
   * Generates a temporary Arduino sketch directory structure
   */
  public static async generateTempProject(code: string): Promise<{ tempDir: string; sketchPath: string }> {
    const sysTemp = os.tmpdir();
    const sketchName = `oxybott_sketch_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const tempDir = path.join(sysTemp, sketchName);

    await fs.mkdir(tempDir, { recursive: true });
    const sketchPath = path.join(tempDir, `${sketchName}.ino`);
    await fs.writeFile(sketchPath, code, 'utf-8');

    return { tempDir, sketchPath };
  }

  /**
   * Compiles an Arduino sketch using real Arduino CLI
   */
  public static async compileSketch(code: string, fqbn: string): Promise<ArduinoCompileResponse> {
    const startTime = Date.now();
    console.log("Platform:", process.platform);
    console.log("Node PATH:", process.env.PATH);
    console.log("Arduino CLI:", ARDUINO_CLI);

    const cliStatus = await this.detectArduinoCli();

    if (!cliStatus.isAvailable) {
      const isWin = process.platform === 'win32';
      const details = cliStatus.errorDetails || (isWin
        ? `Arduino CLI executable not found at specified path or in system PATH: ${ARDUINO_CLI}`
        : 'Arduino CLI is not installed on this server.\nCompilation cannot run on Render until Arduino CLI is installed.');

      console.error(`❌ [ARDUINO CLI ENGINE] Error: ${details}`);
      return {
        success: false,
        error: "Arduino CLI not found",
        details: details,
        platform: process.platform,
        expectedPath: ARDUINO_CLI,
        path: ARDUINO_CLI,
        simulated: false,
        logs: [
          `❌ [Compilation Failed] ${details}`,
        ],
        warnings: [],
        errors: [details],
        compileTimeMs: Date.now() - startTime,
      };
    }

    let tempDir: string | null = null;
    let buildDir: string | null = null;
    let cmd = '';

    try {
      // 1. Generate Temp Project
      const generated = await this.generateTempProject(code);
      tempDir = generated.tempDir;
      buildDir = path.join(tempDir, 'build');
      await fs.mkdir(buildDir, { recursive: true });

      console.log(`[ARDUINO CLI ENGINE] Temporary sketch created at: ${generated.sketchPath}`);

      // 2. Execute arduino-cli compile command with 30s timeout and 10MB max buffer
      cmd = `"${ARDUINO_CLI}" compile --fqbn ${fqbn} --output-dir "${buildDir}" "${tempDir}"`;
      console.log("Command:");
      console.log(cmd);

      const { stdout, stderr } = await execAsync(cmd, { timeout: 30000, maxBuffer: 10 * 1024 * 1024 });

      const rawStdout = stdout || '';
      const rawStderr = stderr || '';
      const combinedOutput = `${rawStdout}\n${rawStderr}`.trim();
      const logs = combinedOutput.split('\n').filter(Boolean);

      console.log('[ARDUINO CLI ENGINE] STDOUT & STDERR Output:');
      console.log(combinedOutput);

      // 3. Extract Errors & Warnings
      const warnings: string[] = [];
      const errors: string[] = [];

      for (const line of logs) {
        if (/warning:/i.test(line)) {
          warnings.push(line.trim());
        }
        if (/error:|fatal error:/i.test(line)) {
          errors.push(line.trim());
        }
      }

      // 4. Parse Memory Usage
      const memoryUsage = this.parseMemoryUsage(combinedOutput);

      let sketchSize = 'Unknown';
      let dynamicMem = 'Unknown';
      if (memoryUsage) {
        sketchSize = `${memoryUsage.flashBytes} bytes (${memoryUsage.flashPercent}% of max ${memoryUsage.maxFlashBytes} bytes)`;
        dynamicMem = `${memoryUsage.sramBytes} bytes (${memoryUsage.sramPercent}% of max ${memoryUsage.maxSramBytes} bytes)`;
      }

      const compileTimeMs = Date.now() - startTime;
      console.log(`[ARDUINO CLI ENGINE] ✅ Compilation completed successfully in ${compileTimeMs}ms`);

      return {
        success: true,
        simulated: false,
        logs: logs.length > 0 ? logs : ['✅ Sketch compiled successfully by Arduino CLI.'],
        warnings,
        errors,
        memoryUsage,
        sketchSize,
        dynamicMem,
        compileTimeMs,
      };
    } catch (err: any) {
      console.error('❌ [ARDUINO CLI ENGINE] Compilation failed with error exit code:');
      const rawStdout = err.stdout || '';
      const rawStderr = err.stderr || err.message || '';
      const combinedOutput = `${rawStdout}\n${rawStderr}`.trim();
      console.error(combinedOutput);

      const logs = combinedOutput.split('\n').filter(Boolean);
      const errors = logs.filter((l: string) => /error:|fatal error:/i.test(l));

      return {
        success: false,
        simulated: false,
        error: "Compilation failed",
        exitCode: err.code !== undefined ? err.code : 1,
        code: err.code !== undefined ? err.code : 1,
        stderr: rawStderr,
        stdout: rawStdout,
        commandExecuted: cmd,
        command: cmd,
        logs: logs.length > 0 ? logs : [`❌ Compilation error: ${err.message}`],
        warnings: [],
        errors: errors.length > 0 ? errors : [err.message || 'Compiler returned non-zero exit code.'],
        compileTimeMs: Date.now() - startTime,
      };
    } finally {
      // 5. Cleanup Temp Directory
      if (tempDir) {
        try {
          await fs.rm(tempDir, { recursive: true, force: true });
        } catch (_) {}
      }
    }
  }

  /**
   * Helper to parse Flash & SRAM memory usage from Arduino CLI output
   */
  private static parseMemoryUsage(output: string): MemoryUsage | undefined {
    let flashBytes = 0, flashPercent = 0, maxFlashBytes = 32256;
    let sramBytes = 0, sramPercent = 0, maxSramBytes = 2048;

    const flashMatch = output.match(/Sketch uses\s+(\d+)\s+bytes\s+\((\d+)%\)\s+of program storage space(?:\.\s+Maximum is\s+(\d+)\s+bytes)?/i);
    if (flashMatch) {
      flashBytes = parseInt(flashMatch[1], 10);
      flashPercent = parseInt(flashMatch[2], 10);
      if (flashMatch[3]) maxFlashBytes = parseInt(flashMatch[3], 10);
    }

    const sramMatch = output.match(/Global variables use\s+(\d+)\s+bytes\s+\((\d+)%\)\s+of dynamic memory(?:\.\s+Maximum is\s+(\d+)\s+bytes)?/i);
    if (sramMatch) {
      sramBytes = parseInt(sramMatch[1], 10);
      sramPercent = parseInt(sramMatch[2], 10);
      if (sramMatch[3]) maxSramBytes = parseInt(sramMatch[3], 10);
    }

    if (flashMatch || sramMatch) {
      return {
        flashBytes,
        flashPercent,
        maxFlashBytes,
        sramBytes,
        sramPercent,
        maxSramBytes,
      };
    }

    return undefined;
  }
}

export async function compileArduinoCode(code: string, fqbn: string): Promise<ArduinoCompileResponse> {
  return ArduinoCompilerService.compileSketch(code, fqbn);
}
