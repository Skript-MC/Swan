export default function extractQuotedText(text) {
  const result = [];
  const regex = /"([^"]*)"/gimu;
  let match = regex.exec(text);
  while (match) {
    result.push(match[1]);
    match = regex.exec(text);
  }
  return result;
}
