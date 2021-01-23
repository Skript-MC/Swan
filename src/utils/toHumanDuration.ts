import moment from 'moment';
import messages from '@/conf/messages';

/**
 * Get back the humanized duration format from miliseconds, or a string (config/messages.moderation.permanent)
 * if it is -1.
 *
 * @param {number} ms - The number of miliseconds to parse.
 * @returns string
 */
export default function toHumanDuration(ms: number): string {
  return ms === -1
    ? messages.moderation.permanent
    : moment.duration(ms).humanize();
}
