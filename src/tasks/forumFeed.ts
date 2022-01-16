import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import Turndown from 'turndown';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import type { InvisionFullResource, InvisionFullTopic } from '@/app/types';
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

@ApplyOptions<TaskOptions>({ cron: '*/10 * * * *' })
export default class ForumFeedTask extends Task {
  public override async run(): Promise<void> {
    await this._checkTopics();
    await this._checkFiles();
  }

  private async _checkTopics(): Promise<void> {
    // Check if new topic has been posted by fetching all the latest, and filtering by date.
    const topics: InvisionFullTopic = await axios.get(
      settings.apis.forum + config.endpoints.forums.topics,
      config.baseAxiosParams,
    ).then(response => (response.status >= 300 ? null : response.data))
      .catch((err: Error) => {
        this.container.logger.warn("Could not fetch Skript-MC forums (for the forum's feed). Is either the website or the bot down/offline?");
        this.container.logger.info(err.message);
      });

    const channel = this.container.client.channels.cache.get(settings.channels.forumUpdates);

    if (!topics?.results || !channel?.isText())
      return;

    topics.results
      // We filter by only keeping those we didn't see in our time window (refresh-rate).
      .filter(topic => (Date.now() - new Date(topic.firstPost.date).getTime()) < config.timeDifference)
      .forEach((topic) => {
        const markdown = turndownService.turndown(topic.firstPost.content);
        const embed = new MessageEmbed()
          .setColor(settings.colors.default)
          .setAuthor({ name: topic.firstPost.author.name, iconURL: 'https:' + topic.firstPost.author.photoUrl })
          .setTitle(pupa(config.embed.title, { topic }))
          .setURL(topic.url)
          .setDescription(trimText(markdown, 500))
          .setFooter({ text: config.dataProvider })
          .setTimestamp(new Date(topic.firstPost.date));
        void channel.send({ embeds: [embed] }).catch(noop);
      });
  }

  private async _checkFiles(): Promise<void> {
    // Check if new resource has been posted by fetching all the latest, and filtering by date.
    const resources: InvisionFullResource = await axios.get(
      settings.apis.forum + config.endpoints.files.files,
      config.baseAxiosParams,
    ).then(response => (response.status >= 300 ? null : response.data))
      .catch((err: Error) => {
        this.container.logger.warn("Could not fetch Skript-MC files endpoint (for the forum's feed). Is either the website or the bot down/offline?");
        this.container.logger.info(err.message);
      });

    const channel = this.container.client.channels.cache.get(settings.channels.forumUpdates);

    if (!resources?.results || !channel?.isText())
      return;

    resources.results
      // We filter by only keeping those we didn't see in our time window (refresh-rate).
      .filter(resource => (Date.now() - new Date(resource.updated).getTime()) < config.timeDifference)
      .forEach((resource) => {
        const markdown = turndownService.turndown(resource.changelog || resource.description);
        const embed = new MessageEmbed()
          .setColor(settings.colors.default)
          .setAuthor({ name: resource.author.name, iconURL: resource.author.photoUrlIsDefault ? '' : `https:${resource.author.photoUrl}` })
          .setTitle(trimText(pupa(resource.changelog ? config.embed.update : config.embed.post, { resource }), 250))
          .setURL(resource.url)
          .setDescription(trimText(markdown, 150))
          .addField(config.embed.categoryTitle, resource.category.name, true)
          .addField(config.embed.versionTitle, resource.version, true)
          .addField(config.embed.ratingTitle, '⭐'.repeat(Math.round(resource.rating)) || config.embed.noRating, true)
          .setThumbnail(resource.primaryScreenshotThumb ? `https:${resource.primaryScreenshotThumb.url}` : '')
          .setFooter({ text: config.dataProvider })
          .setTimestamp(new Date(resource.date));
        void channel.send({ embeds: [embed] }).catch(noop);
      });
  }
}
