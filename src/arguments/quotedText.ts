import type { ArgumentContext, ArgumentResult } from '@sapphire/framework';
import { Argument } from '@sapphire/framework';
import { extractQuotedText } from '../utils';

export default class QuotedTextArgument extends Argument<string[]> {
  public override run(parameter: string, _context: ArgumentContext<string[]>): ArgumentResult<string[]> {
    const parsed = extractQuotedText(parameter);
    return parsed.length === 0
      ? this.ok([parameter])
      : this.ok(parsed);
  }
}
