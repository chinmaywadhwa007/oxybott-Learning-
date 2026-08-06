import { exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

const execAsync = promisify(exec);

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
  simulated: boolean;
  logs: string[];
  warnings: string[];
  errors: string[];
  memoryUsage?: MemoryUsage;
  compileTimeMs: number;
  sketchSize?: string;
  dynamicMem?: string;
}

export class ArduinoCompilerService {
  /**
   * Detects if Arduino CLI is installed and available in PATH
   */
  public static async detectArduinoCli(): Promise<{ isAvailable: boolean; version?: string }> {
    try {
      const { stdout } = await execAsync('arduino-cli version');
      const versionStr = stdout.trim();
      return { isAvailable: true, version: versionStr };
    } catch (_err) {
      return { isAvailable: false };
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
    console.log('\n======================================================');
    console.log('[ARDUINO CLI ENGINE] Starting Real Compilation Pipeline');
    console.log(`[ARDUINO CLI ENGINE] Board FQBN: ${fqbn}`);
    console.log(`[ARDUINO CLI ENGINE] Code Length: ${code.length} characters`);
    console.log('======================================================\n');

    const cliStatus = await this.detectArduinoCli();

    if (!cliStatus.isAvailable) {
      console.error('❌ [ARDUINO CLI ENGINE] Error: arduino-cli is not installed or not found in system PATH!');
      return {
        success: false,
        simulated: false,
        logs: [
          '❌ [Compilation Failed] "arduino-cli" command not found in system PATH.',
          'Please install arduino-cli (https://arduino.github.io/arduino-cli) and ensure it is available in system PATH.',
        ],
        warnings: [],
        errors: ['"arduino-cli" command not found in system PATH.'],
        compileTimeMs: Date.now() - startTime,
      };
    }

    let tempDir: string | null = null;
    let buildDir: string | null = null;

    try {
      // 1. Generate Temp Project
      const generated = await this.generateTempProject(code);
      tempDir = generated.tempDir;
      buildDir = path.join(tempDir, 'build');
      await fs.mkdir(buildDir, { recursive: true });

      console.log(`[ARDUINO CLI ENGINE] Temporary sketch created at: ${generated.sketchPath}`);

      // 2. Execute arduino-cli compile command
      const cmd = `arduino-cli compile --fqbn ${fqbn} --output-dir "${buildDir}" "${tempDir}"`;
      console.log(`[ARDUINO CLI ENGINE] Executing command: ${cmd}`);

      const { stdout, stderr } = await execAsync(cmd);

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
