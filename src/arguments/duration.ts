import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import { getDuration } from '@/app/utils';

export default class DurationArgument extends Argument<number> {
  public run(arg: string, _context: ArgumentContext<number>): ArgumentResult<number> {
    try {
      const duration = getDuration(arg);
      return this.ok(duration < 0 ? duration : duration * 1000);
    } catch {
      return this.error({ parameter: arg });
    }
  }
}
