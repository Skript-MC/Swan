import type { Result } from '@sapphire/framework';
import { err, ok } from '@sapphire/framework';
import { getDuration } from '@/app/utils';
import { miscellaneous } from '@/conf/settings';

export function resolveDuration(parameter: string, allowPermanent = false): Result<number, 'durationError'> {
  if (allowPermanent && miscellaneous.permanentKeywords.includes(parameter))
    return ok(-1);

  try {
    return ok(getDuration(parameter) * 1000);
  } catch {
    return err('durationError');
  }
}
