import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { config, db } from '../../main';
import { formatDate, secondToDuration } from '../../utils';

const sanctionsName = {
  hardban: ':bomb: Bannissement Discord',
  ban: ':hammer: Bannissement',
  unban: ':white_check_mark: Débannissement',
  mute: ':mute: Mute',
  unmute: ':loud_sound: Unmute',
  kick: ':door: Expulsion',
  warn: ':warning: Avertissement',
  unwarn: ":repeat: Suppression d'Avertissement",
  music_restriction: ':musical_note: Restriction des commandes de musique',
  remove_music_restriction: ':musical_note: Suppr. des restr. des com. de musique',
};

class History extends Command {
  constructor() {
    super('History');
    this.aliases = ['history', 'historique'];
    this.usage = 'history <@mention | ID>';
    this.examples = ['history @Arno'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const target = message.guild.member(message.mentions.users.first()) || message.guild.members.cache.get(args[0]);
    if (!target) return message.channel.sendError(this.config.missingUserArgument, message.member);

    const result = await db.sanctionsHistory.findOne({ memberId: target.id }).catch(console.error);
    if (!result) return message.channel.send(this.config.noHistory);

    const { sanctions } = result;
    const stats = {
      hardbans: sanctions.some(s => s.type === 'hardban') ? sanctions.filter(s => s.type === 'hardban').length : 0,
      bans: sanctions.some(s => s.type === 'ban') ? sanctions.filter(s => s.type === 'ban').length : 0,
      mutes: sanctions.some(s => s.type === 'mute') ? sanctions.filter(s => s.type === 'mute').length : 0,
      kicks: sanctions.some(s => s.type === 'kick') ? sanctions.filter(s => s.type === 'kick').length : 0,
      restr: sanctions.some(s => s.type === 'music_restriction') ? sanctions.filter(s => s.type === 'music_restriction').length : 0,
      warns: sanctions.some(s => s.type === 'warn') ? sanctions.filter(s => s.type === 'warn').length : 0,
      currentWarns: result.currentWarnCount || 0,
    };
    const description = `
      :bomb: Ban Discord : ${stats.hardbans}
      :hammer: Ban : ${stats.bans}
      :mute: Mute : ${stats.mutes}
      :door: Kick : ${stats.kicks}
      :musical_note: Restr. musique : ${stats.restr}
      :stop_sign: Avert. totaux : ${stats.warns}
      :warning: Avert. en cours : ${stats.currentWarns}/${config.moderation.warnLimitBeforeBan}`;

    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .setTitle(`Sanctions du membre ${target.user.username} (${result.count})`)
      .setDescription(description)
      .setTimestamp();

    const lastSanctions = sanctions.slice(Math.max(sanctions.length - 25, 0));
    for (const sanction of lastSanctions) {
      let infos = `Modérateur : <@${sanction.mod}>\nDate : ${formatDate(sanction.date)}`;
      if (sanction.reason) infos += `\nRaison : ${sanction.reason}`;
      if (sanction.duration) infos += `\nDurée : ${secondToDuration(sanction.duration)}`;
      if (sanction.type === 'warn' && sanction.date) infos += `\nID : ${sanction.date}`;

      embed.addField(sanctionsName[sanction.type], infos, false);
    }

    message.channel.send(embed);
  }
}

export default History;
