import moment from 'moment';
import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { db } from '../../main';
import pkg from '../../../package.json';

class Statistics extends Command {
  constructor() {
    super('Statistics');
    this.aliases = ['statistique', 'statistiques', 'statistic', 'statistics', 'stats', 'stat'];
    this.usage = 'statistique';
    this.examples = ['statistique'];
    this.enabledInHelpChannels = false;
  }

  async execute(client, message, _args) {
    const uptime = moment.duration(client.uptime).humanize();

    await message.guild.members.fetch().catch(console.error);
    const onlineUsers = message.guild.members.cache.filter(m => (m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd') && !m.user.bot).size;
    const totalUsers = message.guild.members.cache.filter(m => !m.user.bot).size;
    const offlineUsers = totalUsers - onlineUsers;
    const totalBots = message.guild.members.cache.filter(m => m.user.bot).size;
    const total = totalBots + totalUsers;

    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .attachFiles([client.config.bot.avatar])
      .setAuthor('Statistiques de Swan', 'attachment://logo.png')
      .addField('Version', pkg.version, true)
      .addField('Temps de fonctionnement', uptime, true)
      .addField('Mémoire', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
      .addField('Commandes', `${client.commands.length} [(documentation)](${client.config.miscellaneous.documentation})`, true)
      .addField('Répartition des membres', `${onlineUsers} en ligne / ${offlineUsers} hors ligne / ${totalBots} bot${totalBots > 1 ? 's' : ''}`, true)
      .addField('Total', `${total} membres`, true)
      .addField('Développeurs', '<@188341077902753794>\n<@191495299884122112>\n<@218505052015296512>', true)
      .addField('Contributeurs', '<@173542833364533249>\n<@294134773901688833>', true)
      .addField('Signalement des bugs/problèmes, et suggestions', `Vous pouvez les signaler sur le [GitHub](<${pkg.bugs.url}>) ou sur le [Discord](<https://discord.gg/njSgX3w>) de Swan.`, true)
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();
    message.channel.send(embed);

    // Send commands stats :
    if (!client.config.sendCommandStats.includes(message.author.id)) return;

    const docs = await db.commandsStats.find({}).catch(console.error);
    const commandsStats = docs.sort((a, b) => b.used - a.used);
    let content = 'Utilisation des commandes :\n```';
    for (const cmd of commandsStats) content += `${cmd.command} : ${cmd.used}\n`;
    content += '```';

    message.author.send(content);
  }
}

export default Statistics;
