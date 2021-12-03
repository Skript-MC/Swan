import type {
  Args,
  ArgType,
  Result,
  UserError,
} from '@sapphire/framework';
import { err, ok } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import type { GuildMessage } from '@/app/types';

type MatchType = 'flag' | 'option' | 'peek' | 'pick' | 'repeat' | 'rest';

interface BaseArgumentOption {
  name: string;
  match: MatchType;
  type?: Array<keyof ArgType> | keyof ArgType;
  flags?: string[];
  validate?: (message: GuildMessage, resolved: unknown) => Awaitable<boolean>;
  default?: unknown | ((message: GuildMessage) => unknown);
  required?: boolean;
  message?: string;
}

interface TextArgumentOption extends BaseArgumentOption {
  match: Exclude<MatchType, 'flag' | 'option'>;
  flags?: never;
}

interface RequiredArgumentOption extends BaseArgumentOption {
  required: true;
  message: string;
}

interface FacultativeArgumentOption extends BaseArgumentOption {
  required?: false;
  message?: never;
}

interface FlagArgumentOption extends BaseArgumentOption {
  match: 'flag';
  flags: string[];
  type?: never;
  required?: never;
  message?: never;
  default?: boolean | ((message: GuildMessage) => boolean);
}

interface OptionArgumentOption extends BaseArgumentOption {
  match: 'option';
  flags: string[];
}

/* eslint-disable @typescript-eslint/sort-type-union-intersection-members */
type ArgumentOption =
  | (TextArgumentOption & FacultativeArgumentOption)
  | (TextArgumentOption & RequiredArgumentOption)
  | FlagArgumentOption
  | (OptionArgumentOption & FacultativeArgumentOption)
  | (OptionArgumentOption & RequiredArgumentOption);
/* eslint-enable @typescript-eslint/sort-type-union-intersection-members */

type ResolverCallback<T = unknown> = (input: keyof ArgType) => Promise<Result<T, UserError>>;

async function resolveArgument<T = unknown>(
  option: ArgumentOption,
  message: GuildMessage,
  resolver: ResolverCallback<T>,
): Promise<Result<T, Error>> {
  const types = [option.type].flat();
  let arg: Result<T, UserError>;
  let i = 0;
  do
    arg = await resolver(types[i++]);
  while (typeof arg.error !== 'undefined' && i < types.length);

  const isValid = arg.success && (await option.validate?.(message, arg.value) ?? true);
  if (isValid)
    return ok<T>(arg.value);

  if (option.required) {
    await message.channel.send(option.message);
    return err(new Error('Required parameter'));
  }

  const value = typeof option.default === 'function'
    ? await option.default(message)
    : option.default;
  return ok(value ?? null);
}

// eslint-disable-next-line @typescript-eslint/naming-convention
export default function Arguments(...options: ArgumentOption[]): MethodDecorator {
  return (_target, _key, descriptor: PropertyDescriptor): PropertyDescriptor => {
    const originalMethod = descriptor.value;

    descriptor.value = async function (message: GuildMessage, args: Args): Promise<void> {
      const resolvedArguments: Record<string, unknown> = {};

      for (const option of options) {
        if (option.match === 'flag') {
          resolvedArguments[option.name] = args.getFlags(...option.flags);
          continue;
        }
        if (option.match === 'option') {
          const value = args.getOption(...option.flags);
          const resolver: ResolverCallback = async (input = 'string') => {
            const argument = container.stores.get('arguments').get(input);
            return argument.run(value, {
              args,
              argument,
              message,
              command: args.command,
              commandContext: args.commandContext,
            });
          };
          const result = await resolveArgument(option, message, resolver);
          if (result.success)
            resolvedArguments[option.name] = result.value;
          else if (result.error)
            return;
          continue;
        }

        const method = `${option.match}Result` as const;
        const resolver = args[method].bind(args) as ResolverCallback;

        const result = await resolveArgument(option, message, resolver);
        if (result.success)
          resolvedArguments[option.name] = result.value;
        else if (result.error)
          return;
      }

      args.start();

      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      Reflect.apply(originalMethod, this, [message, resolvedArguments, args]);
    };

    return descriptor;
  };
}
