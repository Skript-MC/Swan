import { MessageEmbed } from 'discord.js';
import Command from '../../components/Command';
import { commands, client, config } from '../../main';
import pkg from '../../../package.json';
import { secondToDuration } from '../../utils';

class Statistics extends Command {
  constructor() {
    super('Statistics');
    this.aliases = ['statistique', 'statistiques', 'statistic', 'statistics', 'stats', 'stat'];
    this.usage = 'statistique';
    this.examples = ['statistique'];
    this.activeInHelpChannels = false;
  }

  async execute(message, _args) {
    const uptime = secondToDuration(client.uptime / 1000);

    const onlineUsers = message.guild.members.filter(m => (m.presence.status === 'online' || m.presence.status === 'idle' || m.presence.status === 'dnd') && !m.user.bot).size;
    const totalUsers = message.guild.members.filter(m => !m.user.bot).size;
    const offlineUsers = totalUsers - onlineUsers;
    const totalBots = message.guild.members.filter(m => m.user.bot).size;
    const total = totalBots + totalUsers;

    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setAuthor('Statistiques sur le bot', config.bot.avatar)
      .addField('Préfix', config.bot.prefix, true)
      .addField('Version', pkg.version, true)
      .addField('Temps de fonctionnement', uptime, true)
      .addField('Mémoire', `${(process.memoryUsage().rss / 1024 / 1024).toFixed(2)} MB`, true)
      .addField('Commandes', commands.length, true)
      .addField('Répartition des membres', `${onlineUsers} en ligne / ${offlineUsers} hors ligne / ${totalBots} bot${totalBots > 1 ? 's' : ''}`, true)
      .addField('Total', `${total} membres`, true)
      .addField('Développeurs', `${pkg.authors.join(', ')}. Merci aussi aux contributeurs !`, true)
      .addField('Signalement des bugs/problèmes, et suggestions', `${pkg.bugs.url}`, true)
      .setFooter(`Éxécuté par ${message.author.username}`)
      .setTimestamp();
    message.channel.send(embed);
  }
}

export default Statistics;
