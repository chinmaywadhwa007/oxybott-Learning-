import * as Blockly from 'blockly';
import { BlockCompilerPlugin, StatementNode } from '../types';

export const gpioPlugins: BlockCompilerPlugin[] = [
  {
    type: 'pin_mode',
    category: 'gpio',
    validate: (block) => {
      const pin = block.getFieldValue('PIN');
      const problems = [];
      if (!pin || isNaN(Number(pin)) || Number(pin) < 0 || Number(pin) > 53) {
        problems.push({
          id: `pinmode_invalid_${block.id}`,
          severity: 'warning' as const,
          blockId: block.id,
          blockType: 'pin_mode',
          message: `Invalid or unassigned GPIO pin "${pin || 'EMPTY'}" in pinMode block.`,
          suggestion: 'Select a valid digital pin number (0 to 53).',
        });
      }
      return problems;
    },
    buildAST: (block, ctx) => {
      const pin = block.getFieldValue('PIN') || '13';
      const mode = block.getFieldValue('MODE') || 'OUTPUT';

      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `pinMode(${pin}, ${mode});`,
        metadata: { pin, mode },
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'digital_write_high',
    category: 'gpio',
    buildAST: (block, ctx) => {
      const pin = block.getFieldValue('PIN') || '13';
      ctx.ast.pinModes.set(pin, 'OUTPUT');
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `digitalWrite(${pin}, HIGH);`,
        metadata: { pin, state: 'HIGH' },
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'digital_write_low',
    category: 'gpio',
    buildAST: (block, ctx) => {
      const pin = block.getFieldValue('PIN') || '13';
      ctx.ast.pinModes.set(pin, 'OUTPUT');
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `digitalWrite(${pin}, LOW);`,
        metadata: { pin, state: 'LOW' },
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'digital_write',
    category: 'gpio',
    buildAST: (block, ctx) => {
      const pin = block.getFieldValue('PIN') || '13';
      const state = block.getFieldValue('STATE') || 'HIGH';
      ctx.ast.pinModes.set(pin, 'OUTPUT');
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `digitalWrite(${pin}, ${state});`,
        metadata: { pin, state },
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'analog_write',
    category: 'gpio',
    validate: (block) => {
      const val = block.getFieldValue('VALUE');
      const problems = [];
      if (val !== undefined && (isNaN(Number(val)) || Number(val) < 0 || Number(val) > 255)) {
        problems.push({
          id: `pwm_range_${block.id}`,
          severity: 'warning' as const,
          blockId: block.id,
          blockType: 'analog_write',
          message: `PWM Value "${val}" is out of 0-255 range.`,
          suggestion: 'Keep PWM analogWrite values between 0 and 255.',
        });
      }
      return problems;
    },
    buildAST: (block, ctx) => {
      const pin = block.getFieldValue('PIN') || '3';
      const val = block.getFieldValue('VALUE') || '128';
      ctx.ast.pinModes.set(pin, 'OUTPUT');
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `analogWrite(${pin}, ${val});`,
        metadata: { pin, val },
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
];
