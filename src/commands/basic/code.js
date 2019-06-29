import Command from '../../components/Command';

class Code extends Command {
  constructor() {
    super('Code');
    this.regex = /(code|balise)/gmui;
    this.usage = 'code <votre code>';
    this.examples.push('code broadcast "Yeah!"');
  }

  async execute(message, args) {
    message.delete();
    if ((23 + message.author.username.length + args.join(' ').length) > 2000) {
      message.channel.send(this.config.tooLong);
    } else {
      const msg = await message.channel.send(`**Code de ${message.author.username}:**\`\`\`vb\n${args.join(' ')}\`\`\``);

      const collector = msg
        .createReactionCollector((reaction, user) => user.id === message.author.id
          && !user.bot)
        .once('collect', () => {
          msg.delete();
          collector.stop();
        });
      await msg.react('❌');
    }
  }
}

export default Code;
