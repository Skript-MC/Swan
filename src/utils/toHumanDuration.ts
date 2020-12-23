import moment from 'moment';
import messages from '../../config/messages';

export default function toHumanDuration(ms: number): string {
  return ms === -1
    ? messages.moderation.permanent
    : moment.duration(ms).humanize();
}
