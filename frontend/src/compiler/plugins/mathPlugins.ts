import * as Blockly from 'blockly';
import { BlockCompilerPlugin } from '../types';

export const mathPlugins: BlockCompilerPlugin[] = [
  {
    type: 'math_number',
    category: 'math',
    buildAST: (block) => {
      const num = block.getFieldValue('NUM') ?? '0';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: String(num),
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'text',
    category: 'text',
    buildAST: (block) => {
      const text = block.getFieldValue('TEXT') ?? '';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: JSON.stringify(String(text)),
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'math_arithmetic',
    category: 'math',
    buildAST: (block, ctx) => {
      const opField = block.getFieldValue('OP') || 'ADD';
      const opMap: Record<string, string> = {
        ADD: '+',
        MINUS: '-',
        MULTIPLY: '*',
        DIVIDE: '/',
        POWER: '^',
      };
      const op = opMap[opField] || '+';

      const aBlock = block.getInputTargetBlock('A');
      const bBlock = block.getInputTargetBlock('B');

      const aCode = aBlock ? ctx.processExpression(aBlock, '0') : '0';
      const bCode = bBlock ? ctx.processExpression(bBlock, '0') : '0';

      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `(${aCode} ${op} ${bCode})`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'variables_get',
    category: 'variables',
    buildAST: (block) => {
      const varId = block.getFieldValue('VAR') || 'item';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: String(varId),
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'variables_set',
    category: 'variables',
    buildAST: (block, ctx) => {
      const varId = block.getFieldValue('VAR') || 'item';
      const valBlock = block.getInputTargetBlock('VALUE');
      const valCode = valBlock ? ctx.processExpression(valBlock, '0') : '0';
      ctx.ast.globals.set(`var_${varId}`, `int ${varId} = 0;`);
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `${varId} = ${valCode};`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
];
