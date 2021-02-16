import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import Turndown from 'turndown';
import Logger from '@/app/structures/Logger';
import Task from '@/app/structures/Task';
import type { InvisionFullRessource, InvisionFullTopic } from '@/app/types';
import { noop, trimText } from '@/app/utils';
import settings from '@/conf/settings';
import { forumFeed as config } from '@/conf/tasks';

const turndownService = new Turndown()
  .addRule('code', {
    filter: 'pre',
    replacement: (_content, node) => {
      const { className } = node as Element;
      const language = new RegExp(/lang-(?<lang>\S+)/).exec(className)?.groups?.lang;
      const code = node.textContent;
      return `\n\`\`\`${language}\n${code}\n\`\`\``;
    },
  });

class ForumFeedTask extends Task {
  constructor() {
    super('forumFeed', {
      // Every 10 minutes
      cron: '*/10 * * * *',
    });
  }

  public async exec(): Promise<void> {
    await this._checkTopics();
    await this._checkFiles();
  }

  private async _checkTopics(): Promise<void> {
    // Check if new topic has been posted by fetching all the latest, and filtering by date.
    const topics: InvisionFullTopic = await axios.get(
      settings.apis.forum + config.endpoints.forums.topics,
      config.baseAxiosParams,
    ).then(response => (response.status >= 300 ? null : response.data))
      .catch((err) => {
        Logger.warn("Could not fetch Skript-MC forums (for the forum's feed). Is either the website or the bot down/offline?");
        Logger.detail(err.message);
      });

    const channel = this.client.channels.cache.get(settings.channels.forumUpdates);

    if (!topics?.results || !channel?.isText())
      return;

    topics.results
      // We filter by only keeping those we didn't see in our time window (refresh-rate).
      .filter(topic => (Date.now() - new Date(topic.firstPost.date).getTime()) < config.timeDifference)
      .forEach((topic) => {
        const markdown = turndownService.turndown(topic.firstPost.content);
        const embed = new MessageEmbed()
          .setColor(settings.colors.default)
          .setAuthor(topic.firstPost.author.name, 'https:' + topic.firstPost.author.photoUrl)
          .setTitle(`💬 ${topic.title}`)
          .setURL(topic.url)
          .setDescription(trimText(markdown, 500))
          .setFooter(config.dataProvider)
          .setTimestamp(new Date(topic.firstPost.date));
        void channel.send(embed).catch(noop);
      });
  }

  private async _checkFiles(): Promise<void> {
    // Check if new resource has been posted by fetching all the latest, and filtering by date.
    const ressources: InvisionFullRessource = await axios.get(
      settings.apis.forum + config.endpoints.files.files,
      config.baseAxiosParams,
    ).then(response => (response.status >= 300 ? null : response.data))
      .catch((err) => {
        Logger.warn("Could not fetch Skript-MC files endpoint (for the forum's feed). Is either the website or the bot down/offline?");
        Logger.detail(err.message);
      });

    const channel = this.client.channels.cache.get(settings.channels.forumUpdates);

    if (!ressources?.results || !channel?.isText())
      return;

    ressources.results
      // We filter by only keeping those we didn't see in our time window (refresh-rate).
      .filter(ressource => (Date.now() - new Date(ressource.updated).getTime()) < config.timeDifference)
      .forEach((ressource) => {
        const markdown = turndownService.turndown(ressource.changelog || ressource.description);
        const embed = new MessageEmbed()
          .setColor(settings.colors.default)
          .setAuthor(ressource.author.name, ressource.author.photoUrlIsDefault ? null : 'https:' + ressource.author.photoUrl)
          .setTitle(trimText(`📥 ${ressource.changelog ? 'Mise à jour de' : 'Publication de'} ${ressource.title}`, 250))
          .setURL(ressource.url)
          .setDescription(trimText(markdown, 150))
          .addField('Catégorie', ressource.category.name, true)
          .addField('Version', ressource.version, true)
          .addField('Notation', '⭐'.repeat(Math.round(ressource.rating)) || 'Aucune notation', true)
          .setThumbnail(ressource.primaryScreenshotThumb ? ('https:' + ressource.primaryScreenshotThumb.url) : null)
          .setFooter(config.dataProvider)
          .setTimestamp(new Date(ressource.date));
        void channel.send(embed).catch(noop);
      });
  }
}

export default ForumFeedTask;
