import type { Maybe, PieceContext } from '@sapphire/framework';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import type { ButtonInteraction } from 'discord.js';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import type SwanClient from '@/app/SwanClient';
import SuggestionManager from '@/app/structures/SuggestionManager';
import settings from '@/conf/settings';

export default class SuggestionHandler extends InteractionHandler {
  constructor(ctx: PieceContext) {
    super(ctx, { interactionHandlerType: InteractionHandlerTypes.Button });
  }

  public parse(interaction: ButtonInteraction): Maybe<never> {
    if (!interaction.customId.startsWith('suggestion'))
      return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction): Promise<void> {
    const response = await SuggestionManager.suggestionVote(
      interaction.message.id,
      interaction.customId === 'suggestion_upvote',
      interaction.user.id,
    );

    let embed;
    const actions = [];
    switch (response.status) {
      case 'OK':
        embed = new MessageEmbed()
          .setColor(settings.colors.default)
          .setTitle('Vote enregistré')
          .setDescription(`Votre vote (${interaction.customId === 'suggestion_upvote' ? ':white_check_mark:' : ':x:'}) a bien été comptabilisé pour cette suggestion : celle-ci sera prochainement traitée et débattue avec la communauté en tenant compte votre vote.`)
          .setFooter({ text: 'Suggestions Skript-MC', iconURL: settings.bot.avatar });
        break;
      case 'UNLINKED':
        actions.push(new MessageActionRow()
          .addComponents(
            new MessageButton()
              .setLabel('Connexion à Skript-MC')
              .setURL(response.loginUrl)
              .setStyle('LINK'),
          ));
        embed = new MessageEmbed()
          .setColor(settings.colors.error)
          .setTitle('🔗 Liaison requise')
          .setDescription("Il semblerait que votre compte Discord ne corresponde à aucun compte Skript-MC. Pour pouvoir bénéficier des intégrations sur notre serveur Discord, il est nécessaire de lier votre compte Discord à votre compte Skript-MC.\n\nNos lutins vous ont préparé un lien magique : il ne vous suffit plus qu'à vous connecter à votre compte Skript-MC, et vous bénéficierez des intégrations sur notre serveur Discord.")
          .setFooter({ text: 'Suggestions Skript-MC', iconURL: settings.bot.avatar });
        break;
      case 'ALREADY_VOTED':
        embed = new MessageEmbed()
          .setColor(settings.colors.error)
          .setTitle('Vote déjà comptabilisé')
          .setDescription("Votre vote a déjà été pris en compte pour cette proposition. Il vous est cependant possible de modifier votre vote en cliquant sur l'autre proposition.")
          .setFooter({ text: 'Suggestions Skript-MC', iconURL: settings.bot.avatar });
    }
    if (!embed) {
      embed = new MessageEmbed()
        .setColor(settings.colors.error)
        .setTitle('🤖 Une erreur est survenue')
        .setDescription('On dirait bien que quelque chose ne fonctionne pas comme il devrait. Réessayez dans quelques instants ou consultez les suggestions directement sur [les suggestions de Skript-MC](https://skript-mc.fr/suggestions).')
        .setFooter({ text: 'Suggestions Skript-MC', iconURL: settings.bot.avatar });
    }

    if (response.suggestion) {
      const message = await interaction.channel.messages.fetch(interaction.message.id);
      const { client } = this.container;
      // Get the new embed and actions for this suggestion
      const suggestionEmbed = await SuggestionManager.getSuggestionEmbed(client as SwanClient, response.suggestion);
      const suggestionActions = SuggestionManager.getSuggestionActions(client as SwanClient, response.suggestion);
      await message.edit({ embeds: [suggestionEmbed], components: [suggestionActions] });
    }

    return interaction.reply({ embeds: [embed], components: actions, ephemeral: true });
  }
}
