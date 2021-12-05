import { container } from '@sapphire/pieces';
import type { SwanModuleDocument } from '@/app/types';

export default async function toggleModule(module: SwanModuleDocument, shouldEnabled: boolean): Promise<void> {
  const store = container.stores.get(module.store);
  const isEnabled = Boolean(store.get(module.name)?.enabled);

  if (store && shouldEnabled !== isEnabled)
    await (shouldEnabled ? store.load(module.location.root, module.location.relative) : store.unload(module.name));
}
