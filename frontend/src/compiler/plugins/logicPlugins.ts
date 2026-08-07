import * as Blockly from 'blockly';
import { BlockCompilerPlugin, StatementNode } from '../types';

export const logicPlugins: BlockCompilerPlugin[] = [
  {
    type: 'controls_if',
    category: 'logic',
    validate: (block) => {
      const problems = [];
      const condBlock = block.getInputTargetBlock('IF0');
      if (!condBlock) {
        problems.push({
          id: `if_missing_cond_${block.id}`,
          severity: 'error' as const,
          blockId: block.id,
          blockType: 'controls_if',
          message: 'If block is missing a condition input (IF0).',
          suggestion: 'Connect a boolean condition block (e.g. Logic comparison) to the IF socket.',
        });
      }
      return problems;
    },
    buildAST: (block, ctx) => {
      const condBlock = block.getInputTargetBlock('IF0');
      const condCode = condBlock ? ctx.processExpression(condBlock, 'true') : 'true';

      const thenTarget = block.getInputTargetBlock('DO0');
      const thenStatements = ctx.processStatements(thenTarget);

      const elseTarget = block.getInputTargetBlock('ELSE');
      const elseStatements = elseTarget ? ctx.processStatements(elseTarget) : [];

      let innerCode = thenStatements.map((s) => s.codeSnippet || '').filter(Boolean).join('\n  ');
      if (!innerCode) innerCode = '// Empty if block';

      let fullSnippet = `if (${condCode}) {\n  ${innerCode}\n}`;

      if (elseStatements.length > 0) {
        let elseCode = elseStatements.map((s) => s.codeSnippet || '').filter(Boolean).join('\n  ');
        fullSnippet += ` else {\n  ${elseCode}\n}`;
      }

      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: fullSnippet,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'logic_compare',
    category: 'logic',
    validate: (block) => {
      const problems = [];
      const a = block.getInputTargetBlock('A');
      const b = block.getInputTargetBlock('B');
      if (!a) {
        problems.push({
          id: `compare_missing_a_${block.id}`,
          severity: 'error' as const,
          blockId: block.id,
          blockType: 'logic_compare',
          message: 'Logic comparison block is missing left input (A).',
          suggestion: 'Connect a value block to socket A.',
        });
      }
      if (!b) {
        problems.push({
          id: `compare_missing_b_${block.id}`,
          severity: 'error' as const,
          blockId: block.id,
          blockType: 'logic_compare',
          message: 'Logic comparison block is missing right input (B).',
          suggestion: 'Connect a value block to socket B.',
        });
      }
      return problems;
    },
    buildAST: (block, ctx) => {
      const opField = block.getFieldValue('OP') || 'EQ';
      const opMap: Record<string, string> = {
        EQ: '==',
        NEQ: '!=',
        LT: '<',
        LTE: '<=',
        GT: '>',
        GTE: '>=',
      };
      const op = opMap[opField] || '==';

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
    type: 'logic_operation',
    category: 'logic',
    buildAST: (block, ctx) => {
      const opField = block.getFieldValue('OP') || 'AND';
      const op = opField === 'OR' ? '||' : '&&';
      const aBlock = block.getInputTargetBlock('A');
      const bBlock = block.getInputTargetBlock('B');
      const aCode = aBlock ? ctx.processExpression(aBlock, 'true') : 'true';
      const bCode = bBlock ? ctx.processExpression(bBlock, 'true') : 'true';
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
    type: 'logic_boolean',
    category: 'logic',
    buildAST: (block) => {
      const boolVal = block.getFieldValue('BOOL') || 'TRUE';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: boolVal.toLowerCase(),
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'logic_negate',
    category: 'logic',
    buildAST: (block, ctx) => {
      const boolBlock = block.getInputTargetBlock('BOOL');
      const code = boolBlock ? ctx.processExpression(boolBlock, 'false') : 'false';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `(!${code})`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
];
