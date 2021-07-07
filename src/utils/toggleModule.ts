import type { AkairoClient } from 'discord-akairo';
import type { SwanModuleDocument } from '@/app/types';

export default function toggleModule(client: AkairoClient, module: SwanModuleDocument, isEnabled: boolean): void {
  const handler = client[module.handler];
  const cachedModule = client.cache.modules.find(mod => mod.id === module.name);
  if (!cachedModule)
    return;
  // See if the module is present in handler.modules (= if it is loaded).
  const currentState = Boolean(handler.modules.findKey((_, key) => key === cachedModule.id));

  if (handler && isEnabled !== currentState) {
    if (isEnabled)
      handler.load(cachedModule.filepath);
    else
      handler.remove(module.name);
  }
}
