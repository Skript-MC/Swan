import { container } from '@sapphire/framework';
import axios from 'axios';
import type { Message } from 'discord.js';
import { MessageActionRow, MessageButton, MessageEmbed } from 'discord.js';
import type { PublishResponse, Suggestion, VoteResponse } from '@/app/types';
import { nullop } from '@/app/utils';
import settings from '@/conf/settings';

const token = `api_key=${process.env.SKRIPTMC_DOCUMENTATION_TOKEN}`;

export default {
  async getPendingSuggestions(): Promise<Suggestion[]> {
    return await axios.get(`${settings.apis.skriptmc}suggestions/pending?${token}`)
      .then(response => (response.status >= 300 ? null : response.data))
      .catch(nullop);
  },

  async getSuggestion(messageId: string): Promise<Suggestion> {
    return await axios.get(`${settings.apis.skriptmc}suggestions/${messageId}?${token}`)
      .then(response => (response.status >= 300 ? null : response.data))
      .catch(nullop);
  },

  async suggestionCallback(suggestion: Suggestion, message: Message): Promise<void> {
    await axios.post(`${settings.apis.skriptmc}suggestions/callback?${token}`, {
      suggestionId: suggestion.id,
      messageId: message.id,
    }).catch(nullop);
  },

  async publishSuggestion(description: string, discordId: string): Promise<PublishResponse> {
    const { data } = await axios.post(`${settings.apis.skriptmc}suggestions/publish?${token}`, {
      description,
      discordId,
    }, {
      validateStatus: status => status < 500,
    }).catch(nullop);
    return data;
  },

  async suggestionVote(messageId: string, upVote: boolean, discordId: string): Promise<VoteResponse> {
    const { data } = await axios.post(`${settings.apis.skriptmc}suggestions/vote?${token}`, {
      messageId,
      upVote,
      discordId,
    }, {
      validateStatus: status => status < 500,
    }).catch(nullop);
    return data;
  },

  getSuggestionStatus(status: number): string {
    switch (status) {
      case 1:
        return '🕑 Suggestion non traitée';
      case 2:
        return '✅ Suggestion acceptée';
      case 3:
        return '🛠️ Suggestion appliquée';
      case 4:
        return '❌ Suggestion refusée';
    }
  },

  async getSuggestionEmbed(suggestion: Suggestion): Promise<MessageEmbed> {
    const { client } = container;
    const embed = new MessageEmbed()
      .setColor(suggestion.status === 1
        ? settings.colors.default
        : suggestion.status === 2
          ? settings.colors.success
          : suggestion.status === 3
            ? settings.colors.light
            : settings.colors.error)
      .setTitle(`Suggestion de ${suggestion.user.username}`)
      .setURL(`https://skript-mc.fr/suggestions#${suggestion.id}`)
      .setDescription(suggestion.description)
      .setFooter({ text: this.getSuggestionStatus(suggestion.status) })
      .setTimestamp(new Date(suggestion.created_at));

    // If the user has linked his Discord account, add more cool data :)
    if (suggestion.user.discordId) {
      const suggestionUser = await client.users.fetch(suggestion.user.discordId);
      embed.setFooter({ text: this.getSuggestionStatus(suggestion.status), iconURL: suggestionUser.avatarURL() })
        .setTitle(`Suggestion de ${suggestion.user.username} (${suggestionUser.tag})`);
    }

    // The staff has responded to the suggestion, display the response :D
    if (suggestion.response)
      embed.addField("📝 Réponse de l'équipe", suggestion.response);

    return embed;
  },

  getSuggestionActions(suggestion: Suggestion): MessageActionRow {
    return new MessageActionRow()
      .addComponents(
        new MessageButton()
          .setCustomId('suggestion_upvote')
          .setLabel(`✅ (${suggestion.upVotes})`)
          .setDisabled(suggestion.status !== 1)
          .setStyle('SECONDARY'),
        new MessageButton()
          .setCustomId('suggestion_downvote')
          .setLabel(`❌ (${suggestion.downVotes})`)
          .setDisabled(suggestion.status !== 1)
          .setStyle('SECONDARY'),
      );
  },

};
