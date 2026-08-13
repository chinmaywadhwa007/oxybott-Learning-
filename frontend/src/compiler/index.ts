import * as Blockly from 'blockly';
import { compilerRegistry } from './registry';
import { gpioPlugins } from './plugins/gpioPlugins';
import { timingPlugins } from './plugins/timingPlugins';
import { serialPlugins } from './plugins/serialPlugins';
import { displayPlugins } from './plugins/displayPlugins';
import { peripheralPlugins } from './plugins/peripheralPlugins';
import { logicPlugins } from './plugins/logicPlugins';
import { mathPlugins } from './plugins/mathPlugins';
import { ASTBuilder } from './ASTBuilder';
import { ValidationEngine } from './ValidationEngine';
import { ArduinoCodeGenerator } from './ArduinoCodeGenerator';
import { Formatter } from './Formatter';
import { CompilerResult } from './types';

// Register all block compiler plugins automatically
compilerRegistry.registerAll([
  ...gpioPlugins,
  ...timingPlugins,
  ...serialPlugins,
  ...displayPlugins,
  ...peripheralPlugins,
  ...logicPlugins,
  ...mathPlugins,
]);

export class OxybottCompilerPipeline {
  public static compile(workspace: Blockly.Workspace): CompilerResult {
    const startTime = performance.now();

    // 1. Build AST & run block-level validations
    const { ast, problems: astProblems } = ASTBuilder.buildAST(workspace);

    // 2. Perform static analysis validations & canvas block highlights
    const problems = ValidationEngine.validate(workspace, ast, astProblems);

    // Filter errors vs warnings
    const errors = Array.from(
      new Set(
        problems
          .filter((p) => p.severity === 'error')
          .map((p) => p.message)
      )
    );

    const warnings = Array.from(
      new Set(
        problems
          .filter((p) => p.severity === 'warning')
          .map((p) => p.message)
      )
    );

    const invalidBlockIds = Array.from(
      new Set(
        problems
          .filter((p) => p.severity === 'error' && p.blockId)
          .map((p) => p.blockId!)
      )
    );

    const isValid = errors.length === 0;

    // 3. Generate raw code from AST
    const rawCode = ArduinoCodeGenerator.generate(ast);

    // 4. Format code
    const formattedCode = Formatter.format(rawCode);

    // PIPELINE LOG STAGE 3: Generated Arduino Code
    console.log('[COMPILER PIPELINE] 3. Generated Arduino Code:\n', formattedCode || '(Empty Code)');

    if (!isValid) {
      console.warn('[COMPILER PIPELINE] Validation identified issues:', errors);
    }

    const endTime = performance.now();

    return {
      code: formattedCode,
      valid: isValid,
      errors,
      warnings,
      problems,
      invalidBlockIds,
      ast,
      compileTimeMs: Math.round(endTime - startTime),
    };
  }
}

export * from './types';
export * from './registry';
