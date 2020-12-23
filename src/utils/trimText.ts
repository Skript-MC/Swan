export default function trimText(text: string, size: number): string {
  return text.length > (size + 3) ? `${text.slice(0, size)}...` : text;
}
