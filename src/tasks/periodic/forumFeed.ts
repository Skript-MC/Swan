import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import { EmbedBuilder } from 'discord.js';
import he from 'he';
import pupa from 'pupa';
import Turndown from 'turndown';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import { Task } from '@/app/structures/tasks/Task';
import type { InvisionFullResource, InvisionFullTopic, InvisionUpdate } from '@/app/types';
import { trimText } from '@/app/utils';
import { apis, channels, colors } from '@/conf/settings';
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
export class ForumFeedTask extends Task {
  public override async run(): Promise<void> {
    await this._checkTopics();
    await this._checkFiles();
  }

  private async _checkTopics(): Promise<void> {
    // Check if new topic has been posted by fetching all the latest, and filtering by date.
    const topics: InvisionFullTopic = await axios.get(
      apis.forum + config.endpoints.forums.topics,
      config.baseAxiosParams,
    )
      .then(response => (response.status >= 300 ? null : response.data))
      .catch((err: Error) => {
        this.container.logger.warn("Could not fetch Skript-MC forums (for the forum's feed). Is either the website or the bot down/offline?");
        this.container.logger.info(err.message);
      });

    const channel = this.container.client.channels.cache.get(channels.forumUpdates);

    if (!topics?.results || !channel?.isTextBased())
      return;

    for (const topic of topics.results) {
      if ((Date.now() - new Date(topic.firstPost.date).getTime()) > config.timeDifference)
        continue;

      if (![56, 35, 19, 45, 9, 58, 46, 22, 14, 8, 2, 99, 57, 47, 21, 7, 62, 20, 6, 88, 52, 4].includes(topic.forum.id))
        continue;

      const markdown = turndownService.turndown(topic.firstPost.content);
      const embed = new EmbedBuilder()
        .setColor(colors.default)
        .setAuthor({
          name: topic.firstPost.author.name,
          iconURL: topic.firstPost.author.photoUrlIsDefault
            ? null
            : this._ensureHttpScheme(topic.firstPost.author.photoUrl),
        })
        .setTitle(pupa(config.embed.title, { topic }))
        .setURL(topic.url)
        .setDescription(trimText(markdown, 500))
        .setFooter({ text: config.dataProvider })
        .setTimestamp(new Date(topic.firstPost.date));
      await channel.send({ embeds: [embed] });
    }
  }

  private async _checkFiles(): Promise<void> {
    // Check if new resource has been posted by fetching all the latest, and filtering by date.
    const resources: InvisionFullResource = await axios.get(
      apis.forum + config.endpoints.files.files,
      {
        params: config.baseAxiosParams.params,
        auth: config.baseAxiosParams.auth,
      },
    )
      .then(response => (response.status >= 300 ? null : response.data))
      .catch((err: Error) => {
        this.container.logger.warn("Could not fetch Skript-MC files endpoint (for the forum's feed). Is either the website or the bot down/offline?");
        this.container.logger.info(err.message);
      });

    const channel = this.container.client.channels.cache.get(channels.forumUpdates);

    if (!resources?.results || !channel?.isTextBased())
      return;

    for (const resource of resources.results) {
      const updates: InvisionUpdate[] = await axios.get(
        `${apis.forum}${config.endpoints.files.files}/${resource.id}/history`,
        config.baseAxiosParams,
      )
        .then(response => (response.status >= 300 ? null : response.data));
      if (!updates || updates.length <= 0)
        continue;

      if ((Date.now() - new Date(updates[0].date).getTime()) > config.timeDifference)
        continue;

      const markdown = turndownService.turndown(resource.changelog || resource.description);
      const embed = new EmbedBuilder()
        .setColor(colors.default)
        .setAuthor({
          name: resource.author.name,
          iconURL: resource.author.photoUrlIsDefault ? null : this._ensureHttpScheme(resource.author.photoUrl),
        })
        .setTitle(trimText(pupa(resource.changelog ? config.embed.update : config.embed.post, { resource }), 250))
        .setURL(resource.url)
        .setDescription(trimText(markdown, 150))
        .addFields(
          { name: config.embed.categoryTitle, value: he.unescape(resource.category.name), inline: true },
          { name: config.embed.versionTitle, value: resource.version, inline: true },
          { name: config.embed.ratingTitle, value: '⭐'.repeat(Math.round(resource.rating)) || config.embed.noRating, inline: true },
        )
        .setThumbnail(resource.primaryScreenshot
          ? this._ensureHttpScheme(resource.primaryScreenshot.url)
          : null)
        .setFooter({ text: config.dataProvider })
        .setTimestamp(new Date(resource.date));

      await channel.send({ embeds: [embed] });
    }
  }

  private _ensureHttpScheme(url: string): string {
    return url.startsWith('https://') ? url : `https://${url}`;
  }
}
