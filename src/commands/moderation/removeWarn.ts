import { Command } from 'discord-akairo';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationData from '@/app/moderation/ModerationData';
import RemoveWarnAction from '@/app/moderation/actions/RemoveWarnAction';
import Logger from '@/app/structures/Logger';
import { SanctionTypes } from '@/app/types';
import type { GuildMessage } from '@/app/types';
import type { RemoveWarnCommandArgument } from '@/app/types/CommandArguments';
import { noop, nullop } from '@/app/utils';
import { removeWarn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

class RemoveWarnCommand extends Command {
  constructor() {
    super('removeWarn', {
      aliases: config.settings.aliases,
      details: config.details,

      args: [{
        id: 'warnId',
        type: 'string',
        prompt: {
          start: config.messages.promptStartWarnId,
          retry: config.messages.promptRetryWarnId,
        },
      }, {
        id: 'reason',
        type: 'string',
        match: 'rest',
        default: messages.global.noReason,
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: RemoveWarnCommandArgument): Promise<void> {
    const warn = await Sanction.findOne({ sanctionId: args.warnId, revoked: false }).catch(nullop);
    if (!warn) {
      await message.channel.send(config.messages.invalidWarnId).catch(noop);
      return;
    }

    const member = message.guild.member(warn.memberId);

    if (this.client.currentlyModerating.includes(member.id)) {
      await message.channel.send(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.client.currentlyModerating.push(member.id);
    setTimeout(() => {
      this.client.currentlyModerating.splice(this.client.currentlyModerating.indexOf(member.id), 1);
    }, 10_000);

    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: member.id });
      if (!convictedUser || convictedUser.currentWarnCount === 0) {
        await message.channel.send(config.messages.notWarned);
        return;
      }

      const data = new ModerationData(message)
        .setVictim(member)
        .setReason(args.reason)
        .setType(SanctionTypes.RemoveWarn)
        .setOriginalWarnId(warn.sanctionId);

      const success = await new RemoveWarnAction(data).commit();
      if (success)
        await message.channel.send(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      Logger.error('An unexpected error occurred while removing a warn from member!');
      Logger.detail(`Parsed member: ${member}`);
      Logger.detail(`Message: ${message.url}`);
      Logger.detail((unknownError as Error).stack, true);
      await message.channel.send(messages.global.oops).catch(noop);
    }
  }
}

export default RemoveWarnCommand;
