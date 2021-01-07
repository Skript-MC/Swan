import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import settings from '../../config/settings';
import { skriptReleases as config } from '../../config/tasks';
import Logger from '../structures/Logger';
import Task from '../structures/Task';
import { noop, trimText } from '../utils';

class SkriptReleasesTask extends Task {
  constructor() {
    super('skriptReleases', {
      // Every 10 minutes
      cron: '*/10 * * * *',
    });
  }

  public async exec(): Promise<void> {
    const githubReleases = await axios.get(settings.apis.github + config.githubEndpoint)
      .then(response => (response.status >= 300 ? null : response.data))
      .catch((err) => {
        Logger.warn("Could not fetch GitHub's endpoint (for Skript's infos). Is either the website or the bot down/offline?");
        Logger.detail(err.message);
      });

    if (!githubReleases)
      return;
    const latestRelease = githubReleases[0];
    if ((Date.now() - new Date(latestRelease.published_at).getTime()) > config.timeDifference)
      return;

    const channel = this.client.channels.cache.get(settings.channels.skriptTalk);
    if (!channel?.isText())
      return;

    const body = latestRelease.body.length >= 1900
      ? trimText(latestRelease.body, 1900)
      : latestRelease.body;
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(latestRelease.author.login, latestRelease.author.avatar_url)
      .setTitle(`${latestRelease.name} (${latestRelease.tag_name})`)
      .setURL(latestRelease.html_url)
      .setDescription(body)
      .setFooter(`${config.dataProvider} (#${latestRelease.id})`)
      .setTimestamp(latestRelease.published_at);

    await channel.send(config.releaseAnnouncement, embed).catch(noop);
  }
}

export default SkriptReleasesTask;
