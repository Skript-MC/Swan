import { container } from '@sapphire/pieces';
import type { SwanModuleDocument } from '@/app/types';

export default async function toggleModule(module: SwanModuleDocument, shouldEnabled: boolean): Promise<void> {
  const store = container.stores.get(module.store);
  const isEnabled = store.resolve(module.name).enabled;

  if (store && shouldEnabled !== isEnabled) {
    if (shouldEnabled) {
      const { root, relative } = store.resolve(module.name).location;
      await store.load(root, relative);
    } else {
      await store.unload(module.name);
    }
  }
}
