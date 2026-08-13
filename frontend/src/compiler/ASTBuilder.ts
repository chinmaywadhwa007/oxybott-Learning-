import * as Blockly from 'blockly';
import { ProgramAST, StatementNode, ValidationProblem, BlockCompilerContext } from './types';
import { compilerRegistry } from './registry';

export class ASTBuilder {
  public static buildAST(workspace: Blockly.Workspace): { ast: ProgramAST; problems: ValidationProblem[] } {
    const ast: ProgramAST = {
      includes: new Set<string>(),
      globals: new Map<string, string>(),
      pinModes: new Map<string, 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'>(),
      setupStatements: [],
      loopStatements: [],
      helperFunctions: [],
      hasSetupBlock: false,
      hasLoopBlock: false,
      rawBlocksCount: workspace.getAllBlocks(false).length,
    };

    const problems: ValidationProblem[] = [];

    const ctx: BlockCompilerContext = {
      ast,
      problems,
      processStatements: (startBlock: Blockly.Block | null) => this.processStatementChain(startBlock, ctx),
      processExpression: (block: Blockly.Block | null, defaultValue = '') =>
        this.processExpressionValue(block, ctx, defaultValue),
    };

    const topBlocks = workspace.getTopBlocks(true);

    for (const block of topBlocks) {
      this.processTopBlock(block, ctx);
    }

    return { ast, problems };
  }

  private static processTopBlock(block: Blockly.Block, ctx: BlockCompilerContext): void {
    if (!block) return;

    const type = block.type;

    if (type === 'arduino_setup_loop') {
      ctx.ast.hasSetupBlock = true;
      ctx.ast.hasLoopBlock = true;

      const setupTarget = block.getInputTargetBlock('SETUP');
      if (setupTarget) {
        ctx.ast.setupStatements.push(...this.processStatementChain(setupTarget, ctx));
      }

      const loopTarget = block.getInputTargetBlock('LOOP');
      if (loopTarget) {
        ctx.ast.loopStatements.push(...this.processStatementChain(loopTarget, ctx));
      }
    } else if (type === 'arduino_setup') {
      ctx.ast.hasSetupBlock = true;
      const setupTarget = block.getInputTargetBlock('SETUP');
      if (setupTarget) {
        ctx.ast.setupStatements.push(...this.processStatementChain(setupTarget, ctx));
      }
    } else if (type === 'arduino_loop') {
      ctx.ast.hasLoopBlock = true;
      const loopTarget = block.getInputTargetBlock('LOOP');
      if (loopTarget) {
        ctx.ast.loopStatements.push(...this.processStatementChain(loopTarget, ctx));
      }
    } else {
      // Floating statement block outside setup/loop — record validation error
      ctx.problems.push({
        id: `disconnected_${block.id}`,
        severity: 'error',
        blockId: block.id,
        blockType: type,
        message: `Disconnected block "${type}" is floating outside setup() / loop() containers.`,
        suggestion: 'Drag and attach this block inside the Setup or Loop block container.',
      });
      return;
    }

    const next = block.getNextBlock();
    if (next) {
      this.processTopBlock(next, ctx);
    }
  }

  private static processStatementChain(startBlock: Blockly.Block | null, ctx: BlockCompilerContext): StatementNode[] {
    const statements: StatementNode[] = [];
    let curr = startBlock;

    while (curr) {
      // Plugin lookup
      const plugin = compilerRegistry.get(curr.type);

      // Run plugin validations if defined
      if (plugin?.validate) {
        const valProblems = plugin.validate(curr, ctx);
        ctx.problems.push(...valProblems);
      }

      if (plugin?.buildAST) {
        const node = plugin.buildAST(curr, ctx);
        if (node) {
          statements.push(node);
        }
      } else {
        // Record error for unhandled block instead of generating comment snippets
        ctx.problems.push({
          id: `unsupported_${curr.id}`,
          severity: 'error',
          blockId: curr.id,
          blockType: curr.type,
          message: `Unsupported block: ${curr.type}`,
          suggestion: 'Remove or replace this block with a supported Arduino hardware block.',
        });
      }

      curr = curr.getNextBlock();
    }

    return statements;
  }

  private static processExpressionValue(
    block: Blockly.Block | null,
    ctx: BlockCompilerContext,
    defaultValue: string
  ): string {
    if (!block) return defaultValue;

    const plugin = compilerRegistry.get(block.type);
    if (plugin?.validate) {
      ctx.problems.push(...plugin.validate(block, ctx));
    }

    // Default field check for standard value input
    const valField = block.getFieldValue('VALUE') || block.getFieldValue('TEXT') || defaultValue;
    return String(valField);
  }
}
