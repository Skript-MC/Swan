import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, AutocompleteInteraction } from 'discord.js';
import { ApplicationCommandOptionType, ApplicationCommandType } from 'discord.js';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import Sanction from '@/app/models/sanction';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import { SwanCommand } from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import searchClosestSanction from '@/app/utils/searchs/searchClosestSanction';
import { unban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

@ApplySwanOptions(config)
export default class UnbanCommand extends SwanCommand {
  commandType = ApplicationCommandType.ChatInput;
  commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionType.String,
      name: 'membre',
      description: 'Membre à dé-bannir',
      autocomplete: true,
      required: true,
    },
    {
      type: ApplicationCommandOptionType.String,
      name: 'raison',
      description: 'Raison du dé-bannissement (sera affiché au membre)',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: SwanCommand.ChatInputInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(
      interaction,
      interaction.options.getString('membre'),
      interaction.options.getString('raison') ?? messages.global.noReason,
    );
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const activeBans = await Sanction.find({ revoked: false, type: SanctionTypes.TempBan });
    const search = await searchClosestSanction(activeBans, interaction.options.getString('membre'));
    await interaction.respond(
      search
        .slice(0, 20)
        .map(entry => ({
          name: entry.matchedName,
          value: entry.baseName,
        })),
    );
  }

  private async _exec(
    interaction: SwanCommand.ChatInputInteraction,
    memberId: string,
    reason: string,
  ): Promise<void> {
    await interaction.deferReply({ ephemeral: true });

    if (this.container.client.currentlyModerating.has(memberId)) {
      await interaction.followUp(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    const member = await this.container.client.users.fetch(memberId);
    this.container.client.currentlyModerating.add(memberId);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(memberId);
    }, 10_000);

    try {
      const currentBan = await ModerationHelper.getCurrentBan(memberId);
      if (!currentBan) {
        await interaction.followUp(config.messages.notBanned);
        return;
      }

      const data = new ModerationData(interaction)
        .setSanctionId(currentBan.sanctionId)
        .setVictim(member, false)
        .setReason(reason)
        .setType(SanctionTypes.Unban);

      const success = await new UnbanAction(data).commit();
      if (success)
        await interaction.followUp(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while unbanning a member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.followUp(messages.global.oops).catch(noop);
    }
  }
}
