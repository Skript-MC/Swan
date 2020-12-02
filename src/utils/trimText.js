export default function trimText(text, size) {
  return text.length > (size + 3) ? `${text.slice(0, size)}...` : text;
}
