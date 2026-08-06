import * as Blockly from 'blockly';

export interface RawBlockNode {
  id: string;
  type: string;
  fields: Record<string, any>;
  setupBlockTarget: Blockly.Block | null;
  loopBlockTarget: Blockly.Block | null;
  nextBlock: Blockly.Block | null;
  rawBlock: Blockly.Block;
}

export class BlocklyParser {
  public static parseWorkspace(workspace: Blockly.Workspace): RawBlockNode[] {
    const topBlocks = workspace.getTopBlocks(true);
    const nodes: RawBlockNode[] = [];

    for (const block of topBlocks) {
      nodes.push(this.parseSingleBlock(block));
    }

    return nodes;
  }

  public static parseSingleBlock(block: Blockly.Block): RawBlockNode {
    const fields: Record<string, any> = {};
    for (const input of block.inputList) {
      for (const field of input.fieldRow) {
        if (field.name) {
          fields[field.name] = field.getValue();
        }
      }
    }

    return {
      id: block.id,
      type: block.type,
      fields,
      setupBlockTarget: block.getInputTargetBlock('SETUP'),
      loopBlockTarget: block.getInputTargetBlock('LOOP'),
      nextBlock: block.getNextBlock(),
      rawBlock: block,
    };
  }
}
