import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, User } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ConvictedUser from '@/app/models/convictedUser';
import ModerationData from '@/app/moderation/ModerationData';
import UnmuteAction from '@/app/moderation/actions/UnmuteAction';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { unmute as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

@ApplySwanOptions(config)
export default class UnmuteCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: 'Membre à qui supprimer la restriction de parole en cours',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'raison',
      description: 'Raison de la suppression du mute (sera affiché au membre)',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(
      interaction,
      interaction.options.getUser('membre', true),
      interaction.options.getString('raison', true),
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
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
