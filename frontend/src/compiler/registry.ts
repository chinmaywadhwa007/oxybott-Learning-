import { BlockCompilerPlugin } from './types';

class BlockCompilerRegistry {
  private plugins: Map<string, BlockCompilerPlugin> = new Map();

  public register(plugin: BlockCompilerPlugin): void {
    this.plugins.set(plugin.type, plugin);
  }

  public registerAll(plugins: BlockCompilerPlugin[]): void {
    for (const plugin of plugins) {
      this.register(plugin);
    }
  }

  public get(type: string): BlockCompilerPlugin | undefined {
    return this.plugins.get(type);
  }

  public getAll(): BlockCompilerPlugin[] {
    return Array.from(this.plugins.values());
  }

  public has(type: string): boolean {
    return this.plugins.has(type);
  }
}

export const compilerRegistry = new BlockCompilerRegistry();
