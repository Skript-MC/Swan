import { createClassDecorator, createProxy } from '@sapphire/decorators';
import type { Ctor } from '@sapphire/utilities';
import type { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { globalCommandsOptions } from '@/conf/settings';

type SwanParams = ConstructorParameters<typeof SwanCommand>;

// eslint-disable-next-line @typescript-eslint/naming-convention
export function ApplySwanOptions(config: { settings: object }): ClassDecorator {
  return createClassDecorator((target: Ctor<SwanParams, SwanCommand>) =>
    createProxy(target, {
      construct: (ctor, [context, baseOptions]: SwanParams) =>
        // eslint-disable-next-line new-cap
        new ctor(context, {
          ...globalCommandsOptions,
          ...baseOptions,
          ...config.settings,
        }),
    }));
}
