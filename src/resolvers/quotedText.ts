import type { Result } from '@sapphire/framework';
import { ok } from '@sapphire/framework';
import { extractQuotedText } from '../utils';

export default function resolveQuotedText(parameter: string): Result<string[], 'quotedTextError'> {
  const parsed = extractQuotedText(parameter);
  const result = parsed.length === 0 ? [parameter] : parsed;
  return ok(result.map(str => str.trim()));
}
