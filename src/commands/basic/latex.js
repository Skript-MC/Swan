import Command from '../../structures/Command';
const request = require('request');
const fs = require('fs');

class Latex extends Command {
  constructor() {
    super('Latex');
    this.aliases = ['latex'];
    this.usage = 'latex <votre équation>';
    this.examples = ['latex x = \\frac{4}{5}+\\pi\\Omega\\int_{2\\pi}^{\\infty}{5\\left\\(\\frac{\\tau+3}{2}\\right\\)d\\omega}'];
  }

  async execute(_client, message, args) {
    const equation = args.join(' ');
    if (equation.length === 0) return message.channel.send(this.config.noEquation);

    const conversion = await message.channel.send(`_Conversion de l'équation de ${message.author.username}..._`);
    const filePath = './assets/tmp/';
    const fileName = `${message.author.username}${message.id}.png`;
    let messageWithReaction = null;

    try {
      await this.download(this.config.link + equation.replaceAll(' ', '&space;'), filePath, fileName);
      conversion.delete();
      messageWithReaction = await message.channel.send(`**Équation de ${message.author.username}**`, { files: [filePath + fileName] });
      fs.unlinkSync(filePath + fileName);
    } catch (Exception) {
      conversion.edit(`_Conversion de l'équation de ${message.author.username} échouée..._`);
      messageWithReaction = conversion;
    }

    await messageWithReaction.react('🗑️');

    const collector = messageWithReaction
      .createReactionCollector((reaction, user) => user.id === message.author.id
        && !user.bot
        && reaction.emoji.name === '🗑️')
      .once('collect', () => {
        messageWithReaction.delete();
        collector.stop();
      });
  }

  async download(url, path, name) {
    if (!fs.existsSync(path)) { fs.mkdirSync(path); }
    const file = fs.createWriteStream(path + name);

    await new Promise((resolve, reject) => {
      request({
        uri: url,
        gzip: true,
      })
        .pipe(file)
        .on('finish', async () => {
          resolve();
        })
        .on('error', (error) => {
          reject(error);
        });
    })
      .catch((error) => {
        throw error;
      });
  }
}

export default Latex;
