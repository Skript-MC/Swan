function extractQuotedText(text: string): string[] {
  const result: string[] = [];
  const regex = /(?:"(?<quotedContent>[^"]*)")/gimu;
  let match = regex.exec(text);
  while (match) {
    result.push(match[1]);
    match = regex.exec(text);
  }
  return result;
}

export default extractQuotedText;
