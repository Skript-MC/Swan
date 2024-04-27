import path from 'node:path';
import { container } from '@sapphire/pieces';
import type { SwanModuleDocument } from '#types/index';

export async function toggleModule(
  module: SwanModuleDocument,
  shouldEnabled: boolean,
): Promise<void> {
  const store = container.stores.get(module.store);
  const isEnabled = Boolean(store.get(module.name)?.enabled);

  if (store && shouldEnabled !== isEnabled) {
    await (shouldEnabled
      ? store.load(
          module.location.root,
          path.relative(module.location.root, module.location.full),
        )
      : store.unload(module.name));
  }
}
