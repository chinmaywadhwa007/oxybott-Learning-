import { registerCoreBlocks } from './coreBlocks';
import { registerPeripheralBlocks } from './peripheralBlocks';

let registered = false;

export function registerAllBlocks() {
  if (registered) return;
  registerCoreBlocks();
  registerPeripheralBlocks();
  registered = true;
  console.log('⚡ [Oxybott Blockly Engine] Registered custom block plugins.');
}
