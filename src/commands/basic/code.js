import Command from '../../helpers/Command';

class Code extends Command {
  constructor() {
    super('Code');
    this.aliases = ['code', 'balise'];
    this.usage = 'code <votre code>';
    this.examples = ['code broadcast "Yeah!"'];
    this.cooldown = 5000;
  }

  async execute(message, args) {
    message.delete();
    if (args.join('').length === 0) {
      message.channel.send(this.config.noCode);
    } else if (args.join(' ').length > 2000) {
      // En théorie on n'a pas besoin de tester, vu qu'il ne peut pas l'envoyer s'il fait plus de 2000 chars... Mais on ne sait jamais ^^ (vu que ca fait crash le bot)
      message.channel.send(this.config.tooLong);
    } else {
      const msg1 = await message.channel.send(`**Code de ${message.author.username} :**`);
      const msg2 = await message.channel.send(args.join(' '), { code: 'applescript' });
      await msg2.react('❌');

      const collector = msg2
        .createReactionCollector((reaction, user) => user.id === message.author.id
          && !user.bot
          && reaction.emoji.name === '❌')
        .once('collect', () => {
          msg1.delete();
          msg2.delete();
          collector.stop();
        });
    }
  }
}

export default Code;
