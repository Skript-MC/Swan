import moment from 'moment';
import { MessageEmbed } from 'discord.js';
import Command from '../../structures/Command';
import { config, db, client } from '../../main';
import { toDuration } from '../../utils';
import ACTION_TYPE from '../../structures/actions/actionType';

const sanctionsName = {
  hardban: ':bomb: Bannissement définitif',
  ban: ':hammer: Bannissement',
  unban: ':white_check_mark: Débannissement',
  mute: ':mute: Mute',
  unmute: ':loud_sound: Unmute',
  kick: ':door: Expulsion',
  warn: ':warning: Avertissement',
  unwarn: ":repeat: Suppression d'Avertissement",
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
    args[0] = args[0].replace(/<@!(\d*)>/gimu, '$1'); // eslint-disable-line no-param-reassign
    const target = message.mentions.members.first()
      || message.guild.members.resolve(args[0])
      || await client.users.fetch(args[0]);
    if (!target) return message.channel.sendError(this.config.missingUserArgument, message.member);
    // If the target is a GuildMember then take its id, otherwise it's an ID that could not have been resolved
    // as a GuildMember because the member is not in the guild anymore, so it's just an ID.
    const targetId = target.id;

    const result = await db.sanctionsHistory.findOne({ memberId: targetId }).catch(console.error);
    if (!result) return message.channel.send(this.config.noHistory);

    const { sanctions } = result;
    const stats = {
      hardbans: sanctions.filter(s => s.type === 'hardban').length,
      bans: sanctions.filter(s => s.type === 'ban').length,
      mutes: sanctions.filter(s => s.type === 'mute').length,
      kicks: sanctions.filter(s => s.type === 'kick').length,
      warns: sanctions.filter(s => s.type === 'warn').length,
      currentWarns: result.currentWarnCount,
    };
    const description = `
      :bomb: Bannissements définitifs : ${stats.hardbans}
      :hammer: Bannissements : ${stats.bans}
      :mute: Mutes : ${stats.mutes}
      :door: Kicks : ${stats.kicks}
      :stop_sign: Avertissements totaux : ${stats.warns}
      :warning: Avertissements en cours : ${stats.currentWarns}/${config.moderation.warnLimitBeforeBan}`;

    const username = target?.user?.username || target?.username;

    const publicHistory = new MessageEmbed()
      .setColor(config.colors.default)
      .setTitle(`Dernières sanctions du membre ${username} (${result.count > 3 ? 3 : result.count})`)
      .setDescription(description)
      .setTimestamp();

    let privateHistory = `Sanctions du membre ${username} (${result.count})\n\n`;
    privateHistory += `${description}\n\n`;

    const lastSanctions = sanctions.slice(Math.max(sanctions.length - 25, 0));
    for (const sanction of lastSanctions) {
      let infos = `Modérateur : <@${sanction.modId}>\nDate : ${moment(sanction.date).format('[le] DD/MM/YYYY [à] HH:mm:ss')}`;
      if (sanction.duration && sanction.type !== ACTION_TYPE.WARN) infos += `\nDurée : ${toDuration(sanction.duration)}`;
      if (sanction.reason) infos += `\nRaison : ${sanction.reason}`;

      if (sanction.updates && sanction.updates.length > 0) {
        infos += `\nModification${sanction.updates.length > 1 ? 's' : ''} :`;
        for (const update of sanction.updates) {
          let action;
          if (update.changes.duration) action = `a changé la durée en ${toDuration(update.changes.duration)}`;
          else if (update.changes.revoked) action = 'a révoqué la sanction';
          infos += `\n- ${moment(update.date).format('[le] DD/MM/YYYY [à] HH:mm:ss')}, <@${update.modId}> ${action} (raison: "${update.changes.reason}")`;
        }
      }

      if (lastSanctions.indexOf(sanction) >= lastSanctions.length - 3) {
        publicHistory.addField(`${sanctionsName[sanction.type]} (${sanction.id})`, infos, false);
      }
      privateHistory += `**${sanctionsName[sanction.type]}** (\`${sanction.id}\`)\n${infos}\n\n`;
    }

    message.channel.send(publicHistory);

    const splittedText = this.splitText(privateHistory);
    for (let i = 0; i < splittedText.length; i++) await message.member.send(splittedText[i]);
  }

  /**
   * Split a long string into an array strings of 2000 chars max. each,
   * and between each line
   * @param {String} text - The string to split
   */
  splitText(text) {
    const blocks = [];
    const lines = text.split(/\n/g);
    let index = 0;

    for (const line of lines) {
      if ((blocks[index] || '').length + line.length >= 2000) index++;
      if (!blocks[index]) blocks[index] = '';

      blocks[index] += `${line}\n`;
    }

    return blocks;
  }
}

export default History;
