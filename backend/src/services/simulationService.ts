export interface CompileResult {
  success: boolean;
  simulated: boolean;
  logs: string[];
  sketchSize?: string;
  maxSize?: string;
  dynamicMem?: string;
  maxDynamicMem?: string;
  compileTimeMs: number;
  errors?: string[];
  warnings?: string[];
}

export function simulateCompilation(code: string, fqbn: string): CompileResult {
  const startTime = Date.now();
  const logs: string[] = [];
  const warnings: string[] = [];
  const errors: string[] = [];

  logs.push(`[Oxybott Engine] Initializing compilation for board target [${fqbn}]...`);
  logs.push(`[Oxybott Engine] Running pre-compilation AST sanity checks...`);

  // Basic sanity check for setup and loop
  if (!code.includes('void setup()')) {
    errors.push('Compilation Error: Missing "void setup()" function definition.');
  }
  if (!code.includes('void loop()')) {
    warnings.push('Warning: "void loop()" function is empty or missing.');
  }

  if (errors.length > 0) {
    logs.push(`❌ [Compilation Failed] ${errors.join(', ')}`);
    return {
      success: false,
      simulated: true,
      logs,
      errors,
      warnings,
      compileTimeMs: Date.now() - startTime,
    };
  }

  logs.push(`[Compiler] Generating cross-platform target object files...`);
  logs.push(`[Compiler] Linking C++ libraries & core functions...`);
  logs.push(`[Compiler] Sketch uses 4440 bytes (13%) of program storage space. Maximum is 32256 bytes.`);
  logs.push(`[Compiler] Global variables use 280 bytes (13%) of dynamic memory, leaving 1768 bytes for local variables.`);
  logs.push(`✅ [Compilation Successful] Target image ready for deployment!`);

  return {
    success: true,
    simulated: true,
    logs,
    sketchSize: '4440 bytes (13%)',
    maxSize: '32256 bytes',
    dynamicMem: '280 bytes (13%)',
    maxDynamicMem: '2048 bytes',
    compileTimeMs: Date.now() - startTime,
    warnings,
  };
}

export function simulateUpload(port: string, fqbn: string): { success: boolean; simulated: boolean; logs: string[] } {
  const logs: string[] = [];
  logs.push(`[Oxybott Uploader] Opening serial channel to ${port}...`);
  logs.push(`[Oxybott Uploader] Resetting board on ${port}...`);
  logs.push(`[Oxybott Uploader] Flashing sketch binary via target protocol (${fqbn})...`);
  logs.push(`[Oxybott Uploader] Progress: [===============================>] 100%`);
  logs.push(`[Oxybott Uploader] Flash verification successful! Microcontroller rebooted.`);
  logs.push(`🚀 [Upload Completed] Program is running on ${port}!`);

  return {
    success: true,
    simulated: true,
    logs,
  };
}
