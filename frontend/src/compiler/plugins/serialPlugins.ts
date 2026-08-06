import * as Blockly from 'blockly';
import { BlockCompilerPlugin } from '../types';

export const serialPlugins: BlockCompilerPlugin[] = [
  {
    type: 'serial_begin',
    category: 'communication',
    buildAST: (block, ctx) => {
      const baud = block.getFieldValue('BAUD') || '9600';
      ctx.ast.setupStatements.push({
        id: `node_setup_${block.id}`,
        kind: 'statement',
        type: 'serial_begin_setup',
        blockId: block.id,
        codeSnippet: `Serial.begin(${baud});`,
      });
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `// Serial.begin(${baud}) added to setup()`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'serial_print',
    category: 'communication',
    buildAST: (block) => {
      const val = block.getFieldValue('TEXT') || '"Hello Oxybott"';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `Serial.print(${val});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'serial_println',
    category: 'communication',
    buildAST: (block) => {
      const val = block.getFieldValue('TEXT') || '"Hello Oxybott"';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `Serial.println(${val});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
];
