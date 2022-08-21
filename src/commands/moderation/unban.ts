import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { AutocompleteInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { unban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import Sanction from '@/app/models/sanction';
import searchClosestSanction from '@/app/utils/searchs/searchClosestSanction';

@ApplySwanOptions(config)
export default class UnbanCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'membre',
      description: 'Membre à dé-bannir',
      autocomplete: true,
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'raison',
      description: 'Raison du dé-bannissement (sera affiché au membre)',
      required: true,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(
      interaction,
      interaction.options.getString('membre'),
      interaction.options.getString('raison') ?? messages.global.noReason,
    );
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const activeBans = await Sanction.find({ revoked: false, type: SanctionTypes.Ban });
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
    interaction: CommandInteraction,
    memberId: string,
    reason: string,
  ): Promise<void> {
    if (this.container.client.currentlyModerating.has(memberId)) {
      await interaction.reply(messages.moderation.alreadyModerated).catch(noop);
      return;
    }

    const member = await this.container.client.users.fetch(memberId);
    this.container.client.currentlyModerating.add(memberId);
    setTimeout(() => {
      this.container.client.currentlyModerating.delete(memberId);
    }, 10_000);

    try {
      const isBanned = await ModerationHelper.isBanned(memberId, false);
      if (!isBanned) {
        await interaction.reply(config.messages.notBanned);
        return;
      }

      const ban = await Sanction.findOne({
        revoked: false,
        type: SanctionTypes.Ban,
        userId: memberId,
      });

      const data = new ModerationData(interaction)
        .setSanctionId(ban.sanctionId)
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
