declare module 'jaro-winkler' {
  export default function distance(s1: string, s2: string, options?: { caseSensitive: boolean }): number;
}
