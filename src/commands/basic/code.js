import Command from '../../structures/Command';
import { splitText } from '../../utils';

class Code extends Command {
  constructor() {
    super('Code');
    this.aliases = ['code', 'balise'];
    this.usage = 'code [-l [-s <entier>]] <votre code>';
    this.examples = ['code broadcast "Yeah!"', 'code -l on join: message "salut !"'];
  }

  async execute(_client, message, args) {
    const printLines = args[0] === '-l';
    let startAtLine = 0;
    if (printLines) {
      args.shift();
      if (args[0] === '-s') {
        args.shift();
        const value = parseInt(args.shift(), 10);
        if (!isNaN(value)) {
          // On enlève 1 car il est rajouté plus tard
          startAtLine = value - 1;
          // Pour éviter des p'tits malins
          if (startAtLine < 0) startAtLine = 0;
        } else {
          // Si c'est pas un nombre après l'argument s on le réinjecte
          // dans le tableau d'argument, au début
          args.unshift(value);
        }
      }
    }

    let code = args.join(' ');
    if (code.length === 0) return message.channel.send(this.config.noCode);

    message.delete();

    if (printLines) {
      const lines = code.split('\n');
      code = '';
      for (const [i, line] of lines.entries()) {
        const space = (startAtLine + lines.length).toString().length - (startAtLine + i + 1).toString().length;
        code += `\n${startAtLine + i + 1}${' '.repeat(space)} | ${line}`;
      }
    }

    const msgTitle = await message.channel.send(`**Code de ${message.author.username} :**`);
    const splittedCode = splitText(code);
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
}

export default Code;
