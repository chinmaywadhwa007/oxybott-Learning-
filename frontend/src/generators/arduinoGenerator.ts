import * as Blockly from 'blockly';
import { OxybottCompilerPipeline, CompilerResult } from '../compiler';

export function generateArduinoCode(workspace: Blockly.Workspace): string {
  const result = OxybottCompilerPipeline.compile(workspace);
  return result.code;
}

export function compileWorkspaceWithValidation(workspace: Blockly.Workspace): CompilerResult {
  return OxybottCompilerPipeline.compile(workspace);
}
