export function inlineCodeList(list: readonly string[], separator = ', '): string {
  return `\`${list.join(`\`${separator}\``)}\``;
}
