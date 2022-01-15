import type { ChatInputCommand } from '@sapphire/framework';
import type { ApplicationCommandOptionData, AutocompleteInteraction, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionTypes } from 'discord.js/typings/enums';
import ApplySwanOptions from '@/app/decorators/swanOptions';
import ConvictedUser from '@/app/models/convictedUser';
import Sanction from '@/app/models/sanction';
import ModerationData from '@/app/moderation/ModerationData';
import RemoveWarnAction from '@/app/moderation/actions/RemoveWarnAction';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { SanctionTypes } from '@/app/types';
import { noop, nullop } from '@/app/utils';
import { removeWarn as config } from '@/conf/commands/moderation';
import messages from '@/conf/messages';

@ApplySwanOptions(config)
export default class RemoveWarnCommand extends SwanCommand {
  public static commandOptions: ApplicationCommandOptionData[] = [
    {
      type: ApplicationCommandOptionTypes.USER,
      name: 'membre',
      description: 'Révoquer un avertissement de ce membre',
      required: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'avertissement',
      description: "Sélectionnez l'avertissement à révoquer",
      required: true,
      autocomplete: true,
    },
    {
      type: ApplicationCommandOptionTypes.STRING,
      name: 'raison',
      description: "Raison de la révoquation de l'avertissement",
      required: false,
    },
  ];

  public override async chatInputRun(
    interaction: CommandInteraction,
    _context: ChatInputCommand.RunContext,
  ): Promise<void> {
    await this._exec(
      interaction,
      interaction.options.getString('avertissement'),
      interaction.options.getString('raison') ?? messages.global.noReason,
    );
  }

  public override async autocompleteRun(interaction: AutocompleteInteraction): Promise<void> {
    const sanctions = await Sanction.find({ memberId: interaction.options.get('membre').value, revoked: false }).catch(nullop);
    await interaction.respond(
      sanctions
        .slice(0, 20)
        .map(entry => ({
          name: entry.sanctionId + ' — ' + entry.reason,
          value: entry.sanctionId,
        })),
    );
  }

  private async _exec(
    interaction: CommandInteraction,
    warnId: string,
    reason: string,
  ): Promise<void> {
    const warn = await Sanction.findOne({ sanctionId: warnId, revoked: false }).catch(nullop);
    if (!warn) {
      await interaction.reply(config.messages.invalidWarnId).catch(noop);
      return;
    }

    const member = interaction.guild.members.cache.get(warn.memberId)
      ?? await interaction.guild.members.fetch(warn.memberId).catch(nullop);
    if (!member) {
      await interaction.reply(config.messages.memberNotFound);
      return;
    }

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
      if (!convictedUser || convictedUser.currentWarnCount === 0) {
        await interaction.reply(config.messages.notWarned);
        return;
      }

      const data = new ModerationData(interaction)
        .setVictim(member)
        .setReason(reason)
        .setType(SanctionTypes.RemoveWarn)
        .setOriginalWarnId(warn.sanctionId);

      const success = await new RemoveWarnAction(data).commit();
      if (success)
        await interaction.reply(config.messages.success).catch(noop);
    } catch (unknownError: unknown) {
      this.container.logger.error('An unexpected error occurred while removing a warn from member!');
      this.container.logger.info(`Parsed member: ${member}`);
      this.container.logger.info((unknownError as Error).stack, true);
      await interaction.reply(messages.global.oops).catch(noop);
    }
  }
}
