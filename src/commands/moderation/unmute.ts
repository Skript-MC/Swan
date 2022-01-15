import { ChatInputCommand } from '@sapphire/framework';
import type { User } from 'discord.js';
import { CommandInteraction } from 'discord.js';
import ConvictedUser from '@/app/models/convictedUser';
import ModerationData from '@/app/moderation/ModerationData';
import UnmuteAction from '@/app/moderation/actions/UnmuteAction';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { unmute as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';

@ApplySwanOptions(config)
export default class UnmuteCommand extends SwanCommand {
  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(
      interaction,
      interaction.options.getUser('membre'),
      interaction.options.getString('raison') ?? messages.global.noReason,
    );
  }

  private async _exec(
    interaction: CommandInteraction,
    member: User,
    reason: string,
  ): Promise<void> {
    if (this.container.client.currentlyModerating.has(member.id)) {
      await interaction.reply(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    this.container.client.currentlyModerating.add(member.id);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(member.id);
    }, 10_000);

    try {
      const convictedUser = await ConvictedUser.findOne({ memberId: member.id });
      if (!convictedUser?.currentMuteId) {
        await interaction.reply(config.messages.notMuted);
        return;
      }

      const data = new ModerationData(interaction)
        .setVictim(member)
        .setReason(reason)
        .setType(SanctionTypes.Unmute);

      const success = await new UnmuteAction(data).commit();
      if (success)
        await interaction.reply(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while unmuting a member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
