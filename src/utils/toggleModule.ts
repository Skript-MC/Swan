import { Store } from '@sapphire/pieces';
import type { SwanModuleDocument } from '@/app/types';

export default async function toggleModule(module: SwanModuleDocument, shouldEnabled: boolean): Promise<void> {
  const store = Store.injectedContext.stores.get(module.store);
  // See if the module is present in handler.modules (= if it is loaded).
  const isEnabled = store.resolve(module.name).enabled;

  if (store && shouldEnabled !== isEnabled) {
    // eslint-disable-next-line unicorn/prefer-ternary
    if (shouldEnabled)
      await store.load(store.resolve(module.name).path);
    else
      await store.unload(module.name);
  }
}
