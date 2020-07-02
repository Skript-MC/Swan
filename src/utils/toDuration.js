import moment from 'moment';

export default function toDuration(ms) {
  return ms === -1 ? 'Définitif' : moment.duration(ms).humanize();
}
