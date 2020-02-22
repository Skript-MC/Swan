import { MessageEmbed } from 'discord.js';
import Command from '../../helpers/Command';
import { discordError } from '../../helpers/messages';
import { config, db } from '../../main';
import { formatDate, secondToDuration } from '../../utils';

const sanctionsName = {
  ban: ':hammer: Bannissement',
  unban: ':white_check_mark: Débannissement',
  mute: ':mute: Mute',
  kick: ':door: Expulsion',
  unmute: ':loud_sound: Unmute',
  music_restriction: ':musical_note: Restriction des commandes de musique',
  warn: ':warning: Avertissement',
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
    if (!target) return message.channel.send(discordError(this.config.missingUserArgument, message));

    const result = await db.sanctionsHistory.findOne({ memberId: target.id }).catch(console.error);
    if (!result) return message.channel.send(this.config.noHistory);

    const sanctions = result.sanctions;
    const stats = {
      bans: sanctions.some(s => s.type === 'ban') ? sanctions.filter(s => s.type === 'ban').length : 0,
      mutes: sanctions.some(s => s.type === 'mute') ? sanctions.filter(s => s.type === 'mute').length : 0,
      kicks: sanctions.some(s => s.type === 'kick') ? sanctions.filter(s => s.type === 'kick').length : 0,
      restr: sanctions.some(s => s.type === 'music_restriction') ? sanctions.filter(s => s.type === 'music_restriction').length : 0,
      warns: sanctions.some(s => s.type === 'warn') ? sanctions.filter(s => s.type === 'warn').length : 0,
      currentWarns: result.currentWarnCount || 0,
    };
    const description = `
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

    for (const sanction of result.sanctions) {
      let infos = `Modérateur : <@${sanction.mod}>\nDate : ${formatDate(sanction.date)}`;
      if (sanction.reason) infos += `\nRaison : ${sanction.reason}`;
      if (sanction.duration) infos += `\nDurée : ${secondToDuration(sanction.duration)}`;

      embed.addField(sanctionsName[sanction.type], infos, false);
    }

    message.channel.send(embed);
  }
}

export default History;
