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

    // En théorie on n'a pas besoin de tester, vu qu'il ne peut pas l'envoyer s'il fait plus de 2000 chars... Mais on ne sait jamais ^^ (vu que ca fait crash le bot)
    if (code.length > 2000) return message.channel.send(this.config.tooLong);

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
    const codeSplit = code.match(/(.|[\r\n]){1,1900}/g);
    const codeBlocks = [];

    codeBlocks[0] = await message.channel.send(codeSplit[0], { code: 'applescript' });
    for (let i = 1; i < codeSplit.length; i++) codeBlocks.push(await message.channel.send(codeSplit[i], { code: 'applescript' }));

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
