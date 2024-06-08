import moment from 'moment';
import * as messages from '#config/messages';

/**
 * Get back the humanized duration format from milliseconds, or a string (config/messages.moderation.permanent)
 * if it is -1.
 * @param {number} ms - The number of milliseconds to parse.
 * @returns string
 */
export function toHumanDuration(ms: number): string {
  return ms === -1 ? messages.moderation.permanent : moment.duration(ms).humanize();
}
