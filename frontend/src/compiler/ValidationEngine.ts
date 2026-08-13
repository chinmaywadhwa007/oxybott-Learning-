import * as Blockly from 'blockly';
import { ProgramAST, ValidationProblem } from './types';
import { compilerRegistry } from './registry';

export class ValidationEngine {
  public static validate(
    workspace: Blockly.Workspace,
    ast: ProgramAST,
    existingProblems: ValidationProblem[]
  ): ValidationProblem[] {
    const problems: ValidationProblem[] = [...existingProblems];
    const allBlocks = workspace.getAllBlocks(false);

    // 0. Empty Program / Structural Hint Check
    const executableBlocks = allBlocks.filter(
      (b) => b.type !== 'arduino_setup_loop' && b.type !== 'arduino_setup' && b.type !== 'arduino_loop'
    );

    if (allBlocks.length === 0 || executableBlocks.length === 0) {
      problems.push({
        id: 'val_incomplete_code',
        severity: 'warning',
        message: 'Workspace structure ready: Add action blocks inside Setup or Loop to control hardware.',
        suggestion: 'Drag and connect blocks (e.g., GPIO Pin, Timing, Motors, or Sensors) inside the Setup or Loop block.',
      });
    }

    // 1. Missing Setup / Loop Structure Validation
    if (!ast.hasSetupBlock && !ast.hasLoopBlock && ast.rawBlocksCount > 0) {
      problems.push({
        id: 'val_missing_structure',
        severity: 'error',
        message: 'No main Arduino Setup & Loop container block found on workspace.',
        suggestion: 'Drag an "Arduino Setup & Loop" block from the Setup category.',
      });
    }

    // 2. Validate Every Block on the Canvas
    for (const block of allBlocks) {
      const type = block.type;

      // Check 2a: Supported block check
      const isContainer = type === 'arduino_setup_loop' || type === 'arduino_setup' || type === 'arduino_loop';
      const isRegistered = compilerRegistry.has(type);

      if (!isContainer && !isRegistered) {
        const alreadyAdded = problems.some((p) => p.blockId === block.id && p.message.includes('Unsupported block'));
        if (!alreadyAdded) {
          problems.push({
            id: `unsupported_${block.id}`,
            severity: 'error',
            blockId: block.id,
            blockType: type,
            message: `Unsupported block type "${type}".`,
            suggestion: 'Remove or replace this block with a supported Arduino hardware block.',
          });
        }
      }

      // Check 2b: Connected / Program Flow check
      if (!isContainer) {
        const root = block.getRootBlock();
        if (
          root.type !== 'arduino_setup_loop' &&
          root.type !== 'arduino_setup' &&
          root.type !== 'arduino_loop'
        ) {
          const alreadyAdded = problems.some((p) => p.blockId === block.id && p.message.includes('Disconnected block'));
          if (!alreadyAdded) {
            problems.push({
              id: `disconnected_${block.id}`,
              severity: 'error',
              blockId: block.id,
              blockType: type,
              message: `Disconnected block "${type}" is outside the main setup() / loop() program flow.`,
              suggestion: 'Attach this block inside the Setup or Loop container block.',
            });
          }
        }
      }

      // Check 2c: Missing Required Value Inputs
      for (const input of block.inputList) {
        const isValueInput =
          input.type === 1 ||
          (input.type as any) === 'VALUE' ||
          (input.connection && input.connection.type === 1);

        if (isValueInput) {
          const target = input.connection?.targetBlock();
          if (!target) {
            const alreadyAdded = problems.some((p) => p.blockId === block.id && p.message.includes(`missing required input "${input.name}"`));
            if (!alreadyAdded) {
              problems.push({
                id: `missing_input_${block.id}_${input.name}`,
                severity: 'error',
                blockId: block.id,
                blockType: type,
                message: `Block "${type}" is missing required input "${input.name}".`,
                suggestion: `Connect a value block into the "${input.name}" socket.`,
              });
            }
          }
        }
      }
    }

    // 3. Pin Mode Conflicts & Scope Check
    const declaredPins = new Map<string, string>();
    for (const [pin, mode] of ast.pinModes.entries()) {
      if (declaredPins.has(pin) && declaredPins.get(pin) !== mode) {
        problems.push({
          id: `val_pin_conflict_${pin}`,
          severity: 'warning',
          message: `Conflicting pinMode assignment for GPIO pin ${pin}: ${declaredPins.get(pin)} vs ${mode}`,
          suggestion: `Ensure pin ${pin} is assigned a consistent mode across your program.`,
        });
      } else {
        declaredPins.set(pin, mode);
      }
    }

    // Check for setup-only blocks placed inside loop()
    for (const node of ast.loopStatements) {
      if (node.type === 'pin_mode') {
        const pin = node.metadata?.pin || '13';
        problems.push({
          id: `pinmode_in_loop_${node.blockId}`,
          severity: 'error',
          blockId: node.blockId,
          blockType: 'pin_mode',
          message: `Block "Set Pin ${pin} Mode" is inside loop(). Pin mode configuration must be placed inside the Setup block.`,
          suggestion: 'Move the "Set Pin Mode" block into the Setup block.',
        });
      }
    }

    // Deduplicate problem list
    const uniqueProblems: ValidationProblem[] = [];
    const seenKeys = new Set<string>();

    for (const prob of problems) {
      const key = `${prob.blockId || ''}_${prob.message}`;
      if (!seenKeys.has(key)) {
        seenKeys.add(key);
        uniqueProblems.push(prob);
      }
    }

    // 4. Highlight Invalid Blocks on Blockly Canvas
    this.applyCanvasBlockHighlights(workspace, uniqueProblems);

    return uniqueProblems;
  }

  private static applyCanvasBlockHighlights(
    workspace: Blockly.Workspace,
    problems: ValidationProblem[]
  ): void {
    const errorMap = new Map<string, string[]>();

    for (const prob of problems) {
      if (prob.severity === 'error' && prob.blockId) {
        if (!errorMap.has(prob.blockId)) {
          errorMap.set(prob.blockId, []);
        }
        errorMap.get(prob.blockId)!.push(prob.message);
      }
    }

    // Defer DOM/SVG updates slightly so Blockly finishes post-drag SVG DOM re-rendering
    requestAnimationFrame(() => {
      const allBlocks = workspace.getAllBlocks(false);
      for (const block of allBlocks) {
        const msgs = errorMap.get(block.id);
        const svgRoot = (block as any).getSvgRoot ? (block as any).getSvgRoot() : null;

        if (msgs && msgs.length > 0) {
          try {
            block.setWarningText(`❌ ${msgs.join('\n❌ ')}`);
          } catch (_) {}
          if (svgRoot && svgRoot.classList) {
            svgRoot.classList.add('blockly-invalid-block');
          }
        } else {
          try {
            block.setWarningText(null);
          } catch (_) {}
          if (svgRoot && svgRoot.classList) {
            svgRoot.classList.remove('blockly-invalid-block');
          }
        }
      }
    });
  }
}
