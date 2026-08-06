import * as Blockly from 'blockly';
import { BlockCompilerPlugin } from '../types';

export const peripheralPlugins: BlockCompilerPlugin[] = [
  {
    type: 'servo_attach',
    category: 'peripherals',
    buildAST: (block, ctx) => {
      const pin = block.getFieldValue('PIN') || '9';
      ctx.ast.includes.add('#include <Servo.h>');
      ctx.ast.globals.set(`servo_${pin}`, `Servo servo_${pin};`);
      ctx.ast.setupStatements.push({
        id: `node_setup_servo_${block.id}`,
        kind: 'statement',
        type: 'servo_setup',
        blockId: block.id,
        codeSnippet: `servo_${pin}.attach(${pin});`,
      });
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `// Servo attached to pin ${pin}`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'servo_write',
    category: 'peripherals',
    validate: (block) => {
      const angle = block.getFieldValue('ANGLE');
      const problems = [];
      if (angle !== undefined && (isNaN(Number(angle)) || Number(angle) < 0 || Number(angle) > 180)) {
        problems.push({
          id: `servo_angle_${block.id}`,
          severity: 'warning' as const,
          blockId: block.id,
          blockType: 'servo_write',
          message: `Servo angle "${angle}" is outside standard 0-180° range.`,
          suggestion: 'Set servo angle between 0° and 180°.',
        });
      }
      return problems;
    },
    buildAST: (block, ctx) => {
      const pin = block.getFieldValue('PIN') || '9';
      const angle = block.getFieldValue('ANGLE') || '90';
      ctx.ast.includes.add('#include <Servo.h>');
      ctx.ast.globals.set(`servo_${pin}`, `Servo servo_${pin};`);
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `servo_${pin}.write(${angle});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'buzzer_tone',
    category: 'peripherals',
    buildAST: (block) => {
      const pin = block.getFieldValue('PIN') || '8';
      const freq = block.getFieldValue('FREQ') || '1000';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `tone(${pin}, ${freq});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'buzzer_notone',
    category: 'peripherals',
    buildAST: (block) => {
      const pin = block.getFieldValue('PIN') || '8';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `noTone(${pin});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'wifi_connect',
    category: 'iot',
    buildAST: (block, ctx) => {
      const ssid = block.getFieldValue('SSID') || 'MyWiFi';
      const pass = block.getFieldValue('PASS') || '12345678';
      ctx.ast.includes.add('#include <WiFi.h>');
      ctx.ast.setupStatements.push({
        id: `node_setup_wifi1_${block.id}`,
        kind: 'statement',
        type: 'wifi_setup',
        blockId: block.id,
        codeSnippet: `WiFi.begin("${ssid}", "${pass}");`,
      });
      ctx.ast.setupStatements.push({
        id: `node_setup_wifi2_${block.id}`,
        kind: 'statement',
        type: 'wifi_setup',
        blockId: block.id,
        codeSnippet: 'while (WiFi.status() != WL_CONNECTED) { delay(500); }',
      });
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: '// WiFi.begin initialized in setup()',
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'custom_cpp_code',
    category: 'custom',
    buildAST: (block) => {
      const code = block.getFieldValue('CODE') || '// Custom C++';
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: code,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
];
