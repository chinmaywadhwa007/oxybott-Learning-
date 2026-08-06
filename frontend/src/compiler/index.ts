import * as Blockly from 'blockly';
import { compilerRegistry } from './registry';
import { gpioPlugins } from './plugins/gpioPlugins';
import { timingPlugins } from './plugins/timingPlugins';
import { serialPlugins } from './plugins/serialPlugins';
import { displayPlugins } from './plugins/displayPlugins';
import { peripheralPlugins } from './plugins/peripheralPlugins';
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
]);

export class OxybottCompilerPipeline {
  public static compile(workspace: Blockly.Workspace): CompilerResult {
    const startTime = performance.now();

    // 1. Build AST & run block-level validations
    const { ast, problems: astProblems } = ASTBuilder.buildAST(workspace);

    // PIPELINE LOG STAGE 2: Generated AST
    console.log('[COMPILER PIPELINE] 2. Generated AST:', {
      rawBlocksCount: ast.rawBlocksCount,
      hasSetupBlock: ast.hasSetupBlock,
      hasLoopBlock: ast.hasLoopBlock,
      includes: Array.from(ast.includes),
      globals: Array.from(ast.globals.entries()),
      pinModes: Array.from(ast.pinModes.entries()),
      setupStatementsCount: ast.setupStatements.length,
      loopStatementsCount: ast.loopStatements.length,
    });

    // 2. Perform static analysis validations
    const problems = ValidationEngine.validate(workspace, ast, astProblems);

    // 3. Generate raw code from AST
    const rawCode = ArduinoCodeGenerator.generate(ast);

    // 4. Format code
    const formattedCode = Formatter.format(rawCode);

    // PIPELINE LOG STAGE 3: Generated Arduino Code
    console.log('[COMPILER PIPELINE] 3. Generated Arduino Code:\n', formattedCode || '(Empty Code)');

    const endTime = performance.now();

    return {
      code: formattedCode,
      problems,
      ast,
      compileTimeMs: Math.round(endTime - startTime),
    };
  }
}

export * from './types';
export * from './registry';
