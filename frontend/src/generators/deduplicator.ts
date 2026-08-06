export interface ExtractedCodeParts {
  includes: Set<string>;
  globals: Set<string>;
  setupLines: string[];
  loopLines: string[];
  functions: string[];
}

export function createEmptyCodeParts(): ExtractedCodeParts {
  return {
    includes: new Set<string>(),
    globals: new Set<string>(),
    setupLines: [],
    loopLines: [],
    functions: [],
  };
}

export function formatArduinoCode(parts: ExtractedCodeParts): string {
  const lines: string[] = [];

  // 1. Includes
  if (parts.includes.size > 0) {
    parts.includes.forEach((inc) => lines.push(inc));
    lines.push('');
  }

  // 2. Globals & Pin Declarations
  if (parts.globals.size > 0) {
    parts.globals.forEach((glob) => lines.push(glob));
    lines.push('');
  }

  // 3. Setup Function
  lines.push('void setup() {');
  if (parts.setupLines.length > 0) {
    // Deduplicate setup lines (e.g. repeated pinMode calls)
    const uniqueSetup = Array.from(new Set(parts.setupLines));
    uniqueSetup.forEach((line) => {
      lines.push(`  ${line}`);
    });
  } else {
    lines.push('  // Initialize pins and serial');
  }
  lines.push('}');
  lines.push('');

  // 4. Loop Function
  lines.push('void loop() {');
  if (parts.loopLines.length > 0) {
    parts.loopLines.forEach((line) => {
      lines.push(`  ${line}`);
    });
  } else {
    lines.push('  // Main loop logic');
  }
  lines.push('}');

  // 5. Helper / Custom Functions
  if (parts.functions.length > 0) {
    lines.push('');
    parts.functions.forEach((fn) => {
      lines.push(fn);
      lines.push('');
    });
  }

  return lines.join('\n');
}
