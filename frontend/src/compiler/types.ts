import * as Blockly from 'blockly';

export type ProblemSeverity = 'error' | 'warning' | 'info';

export interface ValidationProblem {
  id: string;
  severity: ProblemSeverity;
  blockId?: string;
  blockType?: string;
  message: string;
  suggestion?: string;
}

export interface ASTNode {
  id: string;
  type: string;
  blockId: string;
}

export interface StatementNode extends ASTNode {
  kind: 'statement';
  codeSnippet?: string;
  next?: StatementNode;
  children?: StatementNode[];
  metadata?: Record<string, any>;
}

export interface ExpressionNode extends ASTNode {
  kind: 'expression';
  value: string;
  dataType?: 'int' | 'float' | 'string' | 'bool' | 'void';
}

export interface ProgramAST {
  includes: Set<string>;
  globals: Map<string, string>;
  pinModes: Map<string, 'INPUT' | 'OUTPUT' | 'INPUT_PULLUP'>;
  setupStatements: StatementNode[];
  loopStatements: StatementNode[];
  helperFunctions: string[];
  hasSetupBlock: boolean;
  hasLoopBlock: boolean;
  rawBlocksCount: number;
}

export interface BlockCompilerContext {
  ast: ProgramAST;
  problems: ValidationProblem[];
  processStatements: (block: Blockly.Block | null) => StatementNode[];
  processExpression: (block: Blockly.Block | null, defaultValue?: string) => string;
}

export interface BlockCompilerPlugin {
  type: string;
  category?: string;
  validate?: (block: Blockly.Block, ctx: BlockCompilerContext) => ValidationProblem[];
  buildAST?: (block: Blockly.Block, ctx: BlockCompilerContext) => StatementNode | null;
  generateStatement?: (node: StatementNode, ctx: BlockCompilerContext) => string | null;
}

export interface CompilerResult {
  code: string;
  problems: ValidationProblem[];
  ast: ProgramAST;
  compileTimeMs: number;
}
