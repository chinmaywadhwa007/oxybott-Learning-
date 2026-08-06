import * as Blockly from 'blockly';
import { ProgramAST, ValidationProblem } from './types';

export class ValidationEngine {
  public static validate(workspace: Blockly.Workspace, ast: ProgramAST, existingProblems: ValidationProblem[]): ValidationProblem[] {
    const problems: ValidationProblem[] = [...existingProblems];

    // 1. Missing Setup / Loop Structure Validation
    if (!ast.hasSetupBlock && !ast.hasLoopBlock && ast.rawBlocksCount > 0) {
      problems.push({
        id: 'val_missing_structure',
        severity: 'warning',
        message: 'No main Arduino Setup / Loop container block found.',
        suggestion: 'Drag an "Arduino Setup & Loop" block from the Setup category.',
      });
    }

    // 2. Unconnected / Floating Top Blocks Warning
    const topBlocks = workspace.getTopBlocks(true);
    for (const block of topBlocks) {
      if (
        block.type !== 'arduino_setup_loop' &&
        block.type !== 'arduino_setup' &&
        block.type !== 'arduino_loop'
      ) {
        problems.push({
          id: `val_unconnected_${block.id}`,
          severity: 'info',
          blockId: block.id,
          blockType: block.type,
          message: `Floating block "${block.type}" is outside the main setup/loop container.`,
          suggestion: 'Attach block inside setup() or loop() containers.',
        });
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

    return problems;
  }
}
