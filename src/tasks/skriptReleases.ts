import { Octokit } from '@octokit/rest';
import { MessageEmbed } from 'discord.js';
import messages from '../../config/messages';
import settings from '../../config/settings';
import { skriptReleases as config } from '../../config/tasks';
import Logger from '../structures/Logger';
import Task from '../structures/Task';
import type { GithubPrerelease, GithubStableRelease } from '../types';
import { noop, trimText } from '../utils';

class SkriptReleasesTask extends Task {
  constructor() {
    super('skriptReleases', {
      // Every 10 minutes
      cron: '*/10 * * * *',
    });
  }

  public async exec(): Promise<void> {
    const octokit = new Octokit();
    const githubReleases = await octokit.repos.listReleases({ owner: 'SkriptLang', repo: 'Skript' })
      .catch((err) => {
        Logger.warn("Could not fetch GitHub's endpoint (for Skript's infos). Is either the website or the bot down/offline?");
        Logger.detail(err.message);
      });
    if (!githubReleases || !githubReleases.data)
      return;

    const lastRelease = githubReleases.data[0];
    if (!lastRelease)
      return;
    this.client.githubCache = {
      lastPrerelease: githubReleases.data.find((release): release is GithubPrerelease => release.prerelease),
      lastStableRelease: githubReleases.data.find((release): release is GithubStableRelease => !release.prerelease),
    };

    // We can't know if we've already posted it, so we don't post anything to prevent from spamming unnecessarily.
    if (!lastRelease.published_at)
      return;

    if ((Date.now() - new Date(lastRelease.published_at).getTime()) > config.timeDifference)
      return;

    const channel = this.client.channels.cache.get(settings.channels.skriptTalk);
    if (!channel?.isText())
      return;

    const body = lastRelease.body && lastRelease.body.length >= 1900
      ? trimText(lastRelease.body, 1900)
      : lastRelease.body ?? messages.miscellaneous.noDescription;
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(lastRelease.author?.login ?? 'SkriptLang', lastRelease.author?.avatar_url)
      .setTitle(`${lastRelease.name} (${lastRelease.tag_name})`)
      .setURL(lastRelease.html_url)
      .setDescription(body)
      .setFooter(`${config.dataProvider} (#${lastRelease.id})`)
      .setTimestamp(new Date(lastRelease.published_at));

    await channel.send(config.releaseAnnouncement, embed).catch(noop);
  }
}

export default SkriptReleasesTask;
