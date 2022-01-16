import type { Result } from '@sapphire/framework';
import { err, ok } from '@sapphire/framework';
import { getDuration } from '@/app/utils';
import settings from '@/conf/settings';

export default function resolveDuration(parameter: string, allowPermanent = false): Result<number, 'durationError'> {
  if (allowPermanent && settings.miscellaneous.permanentKeywords.includes(parameter))
    return ok(-1);

  try {
    return ok(getDuration(parameter));
  } catch {
    return err('durationError');
  }
}
