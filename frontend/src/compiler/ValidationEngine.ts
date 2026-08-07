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

    // 1. Missing Setup / Loop Structure Validation
    if (!ast.hasSetupBlock && !ast.hasLoopBlock && ast.rawBlocksCount > 0) {
      problems.push({
        id: 'val_missing_structure',
        severity: 'warning',
        message: 'No main Arduino Setup / Loop container block found.',
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
        // Prevent duplicate problem entries if ASTBuilder already recorded it
        const alreadyAdded = problems.some((p) => p.blockId === block.id && p.message.includes('Unsupported block'));
        if (!alreadyAdded) {
          problems.push({
            id: `unsupported_${block.id}`,
            severity: 'error',
            blockId: block.id,
            blockType: type,
            message: `Unsupported block: ${type}`,
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
          // Floating block disconnected from program flow
          problems.push({
            id: `disconnected_${block.id}`,
            severity: 'error',
            blockId: block.id,
            blockType: type,
            message: `Disconnected block "${type}" is outside the main setup/loop program flow.`,
            suggestion: 'Attach block inside setup() or loop() containers.',
          });
        }
      }

      // Check 2c: Missing Required Value Inputs
      for (const input of block.inputList) {
        // Value input connection check (type === 1 or value connection)
        const isValueInput =
          input.type === 1 ||
          (input.type as any) === 'VALUE' ||
          (input.connection && input.connection.type === 1);

        if (isValueInput) {
          const target = input.connection?.targetBlock();
          if (!target) {
            problems.push({
              id: `missing_input_${block.id}_${input.name}`,
              severity: 'error',
              blockId: block.id,
              blockType: type,
              message: `Block "${type}" is missing required input "${input.name}".`,
              suggestion: `Connect a value block to the "${input.name}" socket.`,
            });
          }
        }
      }
    }

    // 3. Pin Mode Conflicts Check
    const declaredPins = new Map<string, string>();
    for (const [pin, mode] of ast.pinModes.entries()) {
      if (declaredPins.has(pin) && declaredPins.get(pin) !== mode) {
        problems.push({
          id: `val_pin_conflict_${pin}`,
          severity: 'warning',
          message: `Conflicting pinMode assignment for GPIO pin ${pin}: ${declaredPins.get(pin)} vs ${mode}`,
          suggestion: `Ensure pin ${pin} is assigned a consistent mode.`,
        });
      } else {
        declaredPins.set(pin, mode);
      }
    }

    // 4. Highlight Invalid Blocks on Blockly Canvas
    this.applyCanvasBlockHighlights(workspace, problems);

    return problems;
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
