import type { Result } from '@sapphire/framework';
import { err, ok } from '@sapphire/framework';
import { getDuration } from '../utils';

export default function resolveDuration(parameter: string): Result<number, 'durationError'> {
  try {
    return ok(getDuration(parameter) * 1000);
  } catch {
    return err('durationError');
  }
}
