import type { User } from 'discord.js';
import { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import ModerationData from '@/app/moderation/ModerationData';
import ModerationHelper from '@/app/moderation/ModerationHelper';
import UnbanAction from '@/app/moderation/actions/UnbanAction';
import { SanctionTypes } from '@/app/types';
import { noop } from '@/app/utils';
import { unban as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { ChatInputCommand } from '@sapphire/framework';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';

@ApplySwanOptions(config)
export default class UnbanCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: 'Membre à appliquer le bannissement',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'raison',
      description: "Raison de l'avertissement (sera affiché au membre)",
      required: true,
    },
  ];

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
