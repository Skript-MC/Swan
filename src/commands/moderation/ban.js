import { GuildMember } from 'discord.js';
import Command from '../../structures/Command';
import { toTimestamp } from '../../utils';
import { config } from '../../main';
import ModerationData from '../../structures/ModerationData';
import BanAction from '../../structures/actions/BanAction';
import ACTION_TYPE from '../../structures/actions/actionType';

class Ban extends Command {
  constructor() {
    super('Ban');
    this.aliases = ['ban', 'sdb'];
    this.usage = 'ban <@mention | ID> <durée> <raison>';
    this.examples = ['ban @Uneo7 5j Mouahaha', 'ban @Vengelis_ def Tu ne reviendras jamais !'];
    this.permissions = ['Staff'];
  }

  async execute(message, args) {
    const victim = message.mentions.members.first() || message.guild.members.resolve(args[0]);
    if (!(victim instanceof GuildMember)) return message.channel.sendError(this.config.missingUserArgument, message.member);
    if (!args[1]) return message.channel.sendError(this.config.missingTimeArgument, message.member);
    if (!args[2]) return message.channel.sendError(this.config.missingReasonArgument, message.member);
    if (victim.id === message.author.id) return message.channel.sendError(this.config.unableToSelfBan, message.member);
    if (victim.roles.highest.position >= message.member.roles.highest.position) return message.channel.sendError(this.config.userTooPowerful, message.member);

    const reason = args.splice(2).join(' ');
    let duration;
    if (args[1] === 'def' || args[1] === 'definitif') {
      duration = -1;
    } else {
      duration = toTimestamp(args[1]);
      if (!duration) return message.channel.sendError(this.config.invalidDuration, message.member);
      duration *= 1000;
    }

    const type = duration === -1 ? ACTION_TYPE.HARDBAN : ACTION_TYPE.BAN;

    // Durée max des modérateurs forum : 2j
    if (message.member.roles.cache.has(config.roles.forumMod) && (type === ACTION_TYPE.HARDBAN || duration > config.moderation.maxForumModDuration)) {
      return message.channel.sendError(this.config.durationTooLong, message.member);
    }

    const data = new ModerationData()
      .setType(type)
      .setColor(type === ACTION_TYPE.BAN ? config.colors.ban : config.colors.hardban)
      .setReason(reason)
      .setDuration(duration)
      .setMember(victim)
      .setModerator(message.member)
      .setMessageChannel(message.channel)
      .setFinishTimestamp();
    new BanAction(data).commit();
  }
}

export default Ban;
