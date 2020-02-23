import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { commands, client, config, db } from '../../main';
import pkg from '../../../package.json';
import { secondToDuration } from '../../utils';

class Statistics extends Command {
  constructor() {
    super('Statistics');
    this.aliases = ['statistique', 'statistiques', 'statistic', 'statistics', 'stats', 'stat'];
    this.usage = 'statistique';
    this.examples = ['statistique'];
    this.enabledInHelpChannels = false;
  }

  async execute(message, _args) {
    const uptime = secondToDuration(client.uptime / 1000);

    const onlineUsers = message.guild.members.cache.filter(m => (m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd') && !m.user.bot).size;
    const totalUsers = message.guild.members.cache.filter(m => !m.user.bot).size;
    const offlineUsers = totalUsers - onlineUsers;
    const totalBots = message.guild.members.cache.filter(m => m.user.bot).size;
    const total = totalBots + totalUsers;

    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor('Statistiques sur le bot', 'attachment://logo.png')
      .addField('Préfix', config.bot.prefix, true)
      .addField('Version', pkg.version, true)
      .addField('Temps de fonctionnement', uptime, true)
      .addField('Mémoire', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
      .addField('Commandes', commands.length, true)
      .addField('Répartition des membres', `${onlineUsers} en ligne / ${offlineUsers} hors ligne / ${totalBots} bot${totalBots > 1 ? 's' : ''}`, true)
      .addField('Total', `${total} membres`, true)
      .addField('Développeurs', `${pkg.authors.join(', ')}. Merci aussi aux contributeurs (Romitou, iTrooz_) !`, true)
      .addField('Signalement des bugs/problèmes, et suggestions', `${pkg.bugs.url}`, true)
      .setFooter(`Exécuté par ${message.author.username}`)
      .setTimestamp();
    message.channel.send(embed);

    // Send commands stats :
    if (message.member.roles.highest.position < message.guild.roles.cache.get(config.roles.ma).position) return;

    const docs = await db.commandsStats.find({}).catch(console.error);
    const commandsStats = docs.sort((a, b) => b.used - a.used);
    let content = 'Utilisation des commandes :\n```';
    for (const cmd of commandsStats) content += `${cmd.command} : ${cmd.used}\n`;
    content += '```';

    message.author.send(content);
  }
}

export default Statistics;
