import * as Blockly from 'blockly';
import { BlockCompilerPlugin } from '../types';

export const timingPlugins: BlockCompilerPlugin[] = [
  {
    type: 'delay_ms',
    category: 'timing',
    validate: (block) => {
      const time = block.getFieldValue('DELAY_TIME');
      const problems = [];
      if (!time || isNaN(Number(time)) || Number(time) < 0) {
        problems.push({
          id: `delay_invalid_${block.id}`,
          severity: 'warning' as const,
          blockId: block.id,
          blockType: 'delay_ms',
          message: `Invalid delay duration "${time || 'EMPTY'}".`,
          suggestion: 'Provide a positive millisecond number.',
        });
      }
      return problems;
    },
    buildAST: (block) => {
      const time = block.getFieldValue('DELAY_TIME') || '1000';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `delay(${time});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'delay_us',
    category: 'timing',
    buildAST: (block) => {
      const time = block.getFieldValue('DELAY_TIME') || '500';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `delayMicroseconds(${time});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
];
