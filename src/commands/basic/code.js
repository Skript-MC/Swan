import Command from '../../structures/Command';

class Code extends Command {
  constructor() {
    super('Code');
    this.aliases = ['code', 'balise'];
    this.usage = 'code [-l] <votre code>';
    this.examples = ['code broadcast "Yeah!"', 'code -l on join: message "salut !"'];
  }

  async execute(message, args) {
    const printLines = args[0] === '-l';
    if (printLines) args.shift();

    let code = args.join(' ');
    if (code.length === 0) return message.channel.send(this.config.noCode);

    message.delete();

    if (printLines) {
      const lines = code.split('\n');
      code = '';
      for (const [i, line] of lines.entries()) {
        const space = lines.length.toString().length - (i + 1).toString().length;
        code += `\n${i + 1}${' '.repeat(space)} | ${line}`;
      }
    }

    const msgTitle = await message.channel.send(`**Code de ${message.author.username} :**`);
    const splittedCode = this.splitCode(code);
    const codeBlocks = [];

    codeBlocks[0] = await message.channel.send(splittedCode[0], { code: 'applescript' });
    for (let i = 1; i < splittedCode.length; i++) codeBlocks.push(await message.channel.send(splittedCode[i], { code: 'applescript' }));

    const lastMessage = codeBlocks[codeBlocks.length - 1];
    lastMessage.react('🗑️');

    const collector = lastMessage
      .createReactionCollector((reaction, user) => user.id === message.author.id
        && !user.bot
        && reaction.emoji.name === '🗑️')
      .once('collect', () => {
        msgTitle.delete();
        for (const block of codeBlocks) block.delete();
        collector.stop();
      });
  }

  /**
   * Split a long string into an array strings of 2000 chars max. each,
   * and between each line
   * @param {String} code - The string to split
   */
  splitCode(code) {
    const blocks = [];
    const lines = code.split(/\n/g);
    let index = 0;

    for (const line of lines) {
      if ((blocks[index] || '').length + line.length >= 2000) index++;
      if (!blocks[index]) blocks[index] = '';

      blocks[index] += `${line}\n`;
    }

    return blocks;
  }
}

export default Code;
