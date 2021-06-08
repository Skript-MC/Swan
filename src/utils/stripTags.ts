import he from 'he';

export default function stripTags(str: string): string {
  return he.unescape(str.replace(/<[^>]*>/g, ''));
}
