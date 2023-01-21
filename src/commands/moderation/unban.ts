import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, User } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { unban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

@ApplySwanOptions(config)
export default class UnbanCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.User,
      name: 'membre',
      description: 'Membre à qui supprimer un bannissement en cours',
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'raison',
      description: 'Raison de la suppression du bannissement (sera affiché au membre)',
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
      const isBanned = await ModerationHelper.isBanned(member.id, true);
      if (!isBanned) {
        await interaction.reply(config.messages.notBanned);
        return;
      }

      const data = new ModerationData(interaction)
        .setVictim(member, false)
        .setReason(reason)
        .setType(SanctionTypes.Unban);

      const success = await new UnbanAction(data).commit();
      if (success)
        await interaction.reply(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while unbanning a member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
