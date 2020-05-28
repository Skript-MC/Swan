/* eslint-disable no-else-return, nonblock-statement-body-position, curly */
import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { SkriptHubSyntaxes } from '../../main';

const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
const regexAddon = new RegExp(/-a(?:dd?on)?:/, 'gimu');
const regexType = new RegExp(/-t(?:ype)?:/, 'gimu');
const regexID = new RegExp(/-i(?:d)?:/, 'gimu');
const invisibleChar = '	‌'; // eslint-disable-line no-tabs

function capitalize(string) {
  return string[0].toUpperCase() + string.slice(1);
}

function computeScore(score) {
  if (score < -5) return 'Très mauvais';
  if (score < 0) return 'Mauvais';
  if (score === 0) return 'Neutre';
  if (score > 5) return 'Très bon';
  if (score > 0) return 'Bon';
  return 'inconnu';
}

function getInfos(data) {
  const infos = [];
  if (data.syntax_type)
    infos.push(`Type de la syntaxe : ${data.syntax_type}`);
  if (data.return_type)
    infos.push(`Type de la valeur retournée : \`${data.return_type}\``);
  if (data.syntax_type === 'event' && data.event_cancellable)
    infos.push(`Évènement annulable : ${data.event_cancellable ? 'Oui' : 'Non'}`);
  if (data.syntax_type === 'event' && data.event_values)
    infos.push(`Valeurs utilisables dans l'évènement : \`${data.event_values}\``);
  if (data.syntax_type === 'type' && data.type_usage)
    infos.push(`Utilisation du type : \`${data.type_usage}\``);
  if (data.addon && data.compatible_addon_version)
    infos.push(`Requiert : ${data.addon} (v${data.compatible_addon_version.replace(/unknown\s*/gimu, '').replace(/\(/gimu, '').replace(/\)/gimu, '')})`);
  else if (data.addon)
    infos.push(`Requiert : ${data.addon}`);
  if (data.compatible_minecraft_version)
    infos.push(`Version minecraft : ${data.compatible_minecraft_version}`);
  if (data.required_plugins.length === 1)
    infos.push(`Plugin requis : ${data.required_plugins.name}`);
  else if (data.required_plugins.length > 1) {
    const pl = [];
    for (const p of data.required_plugins)
      pl.push(p.name);
    infos.push(`Plugins requis : ${pl.join(', ')}`);
  }
  if (data.id)
    infos.push(`ID SkriptHub : ${data.id}`);
  if (data.link)
    infos.push(`Lien : ${data.link}`);
  return infos;
}

class SyntaxInfo extends Command {
  constructor() {
    super('Syntax Info');
    this.aliases = ['syntaxinfo', 'syntax-info', 'syntax_info', 'doc', 'documentation'];
    this.usage = 'doc [-a:<addon>] [-t:<type>] [-id:<ID skripthub>]';
    this.examples.push('syntax-info join', 'doc tablist', 'doc tablist -type:effect -addon:skrayfall', 'doc -id:2000', 'doc join -t:event');
  }

  async execute(client, message, args) {
    if (args.length === 0) return message.channel.sendError(this.config.invalidCmd, message.member);

    const msg = await message.channel.send('Je vais chercher ça...');
    const syntaxes = await SkriptHubSyntaxes;

    let arg = args.join(' ').toUpperCase();
    const search = [];
    let addon;
    let type;
    let id;
    for (const a of args) {
      if (a.match(regexAddon)) {
        addon = a.replace(regexAddon, '');
        if (addon === 's') addon = 'skript';
        arg = arg.replace(/\s?-a(?:dd?on)?:\w+\s?/gimu, '');
        search.push(`addon : ${addon}`);
      } else if (a.match(regexType)) {
        type = a.replace(regexType, '');
        if (type === 'expr') type = 'expression';
        else if (type === 'ev') type = 'event';
        else if (type === 'cond' || type === 'c') type = 'condition';
        else if (type === 'eff') type = 'effect';
        arg = arg.replace(/\s?-t(?:ype)?:\w+\s?/gimu, '');
        search.push(`type : ${type}`);
      } else if (a.match(regexID)) {
        id = Number.parseInt(a.replace(regexID, ''), 10);
        arg = arg.replace(/\s?-i(?:d)?:\w+\s?/gimu, '');
        if (!Number.isNaN(id)) search.push(`id : ${id}`);
      }
    }

    if (arg === '')
      return message.channel.sendError(this.config.invalidCmd, message.member);

    let matchingSyntaxes = syntaxes.filter(elt => elt.title.toUpperCase().includes(arg)) || syntaxes.filter(elt => elt.description.toUpperCase().includes(arg));
    if (addon)
      matchingSyntaxes = matchingSyntaxes.filter(elt => elt.addon.toUpperCase().includes(addon.toUpperCase()));
    if (type)
      matchingSyntaxes = matchingSyntaxes.filter(elt => elt.syntax_type.toUpperCase().includes(type.toUpperCase()));
    if (id)
      matchingSyntaxes = matchingSyntaxes.filter(elt => elt.id === id);

    const results = matchingSyntaxes.length;
    // On limite a 10 élements. Plus simple a gérer pour le moment, on pourra voir + tard si on peut faire sans. (donc multipages et tout)
    matchingSyntaxes = matchingSyntaxes.slice(0, 10);

    if (matchingSyntaxes.length === 0) {
      await msg.delete();
      return message.channel.sendError(this.config.syntaxDoesntExist, message.member);
    } else if (matchingSyntaxes.length === 1) {
      msg.delete();
      return this.sendDetails(client, message, matchingSyntaxes[0]);
    } else {
      await msg.edit(`${results} élements trouvés pour la recherche \`${arg.toLowerCase()}\`${search.length > 0 ? ` avec comme paramètres \`${search.join(', ')}\`` : ''}. Quelle syntaxe vous interesse ?\n:warning: **Attendez que la réaction :x: soit posée avant de commencer.**`);

      let { content } = msg;
      for (let i = 0; i < matchingSyntaxes.length; i++)
        content += `\n${reactionsNumbers[i]} "${capitalize(matchingSyntaxes[i].title)}" *(${matchingSyntaxes[i].syntax_type}, ${matchingSyntaxes[i].addon})*`;

      if (results - 10 > 0) content += `\n...et ${results - 10} de plus...`;
      await msg.edit(content);

      for (let i = 0; i < matchingSyntaxes.length; i++) await msg.react(reactionsNumbers[i]);
      await msg.react('❌');

      const collectorNumbers = msg
        .createReactionCollector((reaction, user) => !user.bot
          && user.id === message.author.id
          && reactionsNumbers.includes(reaction.emoji.name))
        .once('collect', (reaction) => {
          msg.delete();
          this.sendDetails(client, message, args, matchingSyntaxes[reactionsNumbers.indexOf(reaction.emoji.name)]);
          collectorNumbers.stop();
        });

      const collectorStop = msg
        .createReactionCollector((reaction, user) => !user.bot
          && user.id === message.author.id
          && reaction.emoji.name === '❌')
        .once('collect', () => {
          message.delete();
          msg.delete();
          collectorNumbers.stop();
          collectorStop.stop();
        });
    }
  }

  async sendDetails(client, message, args, data) {
    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .attachFiles([client.config.bot.avatar])
      .setAuthor(`Informations sur "${data.title}"`, 'attachment://logo.png')
      .setFooter(`Executé par ${message.author.username} | Données fournies par https://skripthub.net`)
      .setTimestamp()
      .setDescription(invisibleChar)
      .addField(this.config.embed.patternTitle, `${this.config.embed.patternDesc.replace('%s', `${data.syntax_pattern}`) || this.config.embed.noPattern}\n${invisibleChar}`, false)
      .addField(this.config.embed.descriptionTitle, `${data.description || this.config.embed.noDescription}\n‌${invisibleChar}`, false);

    if (data.example) {
      let ex = `${this.config.embed.exampleDesc.replace('%s', data.example.example_code)}\n`;
      if (data.example.example_author) ex += `Auteur : ${data.example.example_author}\n`;
      if (data.example.score) ex += `Appréciation : ${computeScore(data.example.score)}\n`;
      if (data.example.offical_example === true) ex += 'Exemple officiel.';
      embed.addField(this.config.embed.exampleTitle, `${ex}\n‌${invisibleChar}`, false);
    }
    const infos = getInfos(data);
    if (infos.length !== 0)
      embed.addField(this.config.embed.infos, infos, false);

    const msg = await message.channel.send(embed);
    await msg.react('⏮️');

    const collectorStop = msg
      .createReactionCollector((reaction, user) => !user.bot
        && user.id === message.author.id
        && reaction.emoji.name === '⏮️')
      .once('collect', () => {
        msg.delete();
        this.execute(client, message, args);
        collectorStop.stop();
      });
  }
}

export default SyntaxInfo;
