import he from 'he';

export function stripTags(str: string): string {
  return he.unescape(str.replaceAll(/<[^>]*>/g, ''));
}
