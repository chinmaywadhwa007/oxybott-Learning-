import * as Blockly from 'blockly';
import { BlockCompilerPlugin } from '../types';

export const displayPlugins: BlockCompilerPlugin[] = [
  {
    type: 'lcd_init',
    category: 'displays',
    buildAST: (block, ctx) => {
      ctx.ast.includes.add('#include <Wire.h>');
      ctx.ast.includes.add('#include <LiquidCrystal_I2C.h>');
      ctx.ast.globals.set('lcd_i2c', 'LiquidCrystal_I2C lcd(0x27, 16, 2);');
      ctx.ast.setupStatements.push({
        id: `node_setup_lcd1_${block.id}`,
        kind: 'statement',
        type: 'lcd_setup',
        blockId: block.id,
        codeSnippet: 'lcd.init();',
      });
      ctx.ast.setupStatements.push({
        id: `node_setup_lcd2_${block.id}`,
        kind: 'statement',
        type: 'lcd_setup',
        blockId: block.id,
        codeSnippet: 'lcd.backlight();',
      });
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: '// LiquidCrystal_I2C initialized',
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'lcd_print',
    category: 'displays',
    buildAST: (block, ctx) => {
      const col = block.getFieldValue('COL') || '0';
      const row = block.getFieldValue('ROW') || '0';
      const val = block.getFieldValue('TEXT') || '"Oxybott"';
      ctx.ast.includes.add('#include <Wire.h>');
      ctx.ast.includes.add('#include <LiquidCrystal_I2C.h>');
      ctx.ast.globals.set('lcd_i2c', 'LiquidCrystal_I2C lcd(0x27, 16, 2);');
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `lcd.setCursor(${col}, ${row});\n  lcd.print(${val});`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'lcd_clear',
    category: 'displays',
    buildAST: (block) => ({
      id: `node_${block.id}`,
      kind: 'statement',
      type: block.type,
      blockId: block.id,
      codeSnippet: 'lcd.clear();',
    }),
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'oled_init',
    category: 'displays',
    buildAST: (block, ctx) => {
      ctx.ast.includes.add('#include <Wire.h>');
      ctx.ast.includes.add('#include <Adafruit_GFX.h>');
      ctx.ast.includes.add('#include <Adafruit_SSD1306.h>');
      ctx.ast.globals.set('oled_dim1', '#define SCREEN_WIDTH 128');
      ctx.ast.globals.set('oled_dim2', '#define SCREEN_HEIGHT 64');
      ctx.ast.globals.set('oled_disp', 'Adafruit_SSD1306 display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, -1);');
      ctx.ast.setupStatements.push({
        id: `node_setup_oled1_${block.id}`,
        kind: 'statement',
        type: 'oled_setup',
        blockId: block.id,
        codeSnippet: 'display.begin(SSD1306_SWITCHCAPVCC, 0x3C);',
      });
      ctx.ast.setupStatements.push({
        id: `node_setup_oled2_${block.id}`,
        kind: 'statement',
        type: 'oled_setup',
        blockId: block.id,
        codeSnippet: 'display.clearDisplay();',
      });
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: '// SSD1306 OLED initialized',
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
  {
    type: 'oled_print',
    category: 'displays',
    buildAST: (block, ctx) => {
      ctx.ast.includes.add('#include <Wire.h>');
      ctx.ast.includes.add('#include <Adafruit_GFX.h>');
      ctx.ast.includes.add('#include <Adafruit_SSD1306.h>');
      return {
        id: `node_${block.id}`,
        kind: 'statement',
        type: block.type,
        blockId: block.id,
        codeSnippet: `display.setTextSize(1);\n  display.setTextColor(SSD1306_WHITE);\n  display.setCursor(0, 0);\n  display.println("Oxybott Visual");\n  display.display();`,
      };
    },
    generateStatement: (node) => node.codeSnippet || null,
  },
];
