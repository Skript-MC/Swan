import Axios from 'axios';
import { MessageEmbed } from 'discord.js';
import settings from '../../config/settings';
import config from '../../config/tasks';
import Task from '../structures/Task';

class SkriptReleasesTask extends Task {
  constructor() {
    super('Skript Releases', {
      cron: '*/10 * * * *',
    });
  }

  async exec() {
    const githubReleases = await Axios.get(`${process.env.GITHUB_URL}${config.skriptReleases.githubEndpoint}`)
      .then(response => (response.status >= 300 ? undefined : response.data))
      .catch((err) => {
        this.client.logger.warn('Could not fetch GitHub\'s endpoint (for Skript\'s infos). Is either the website or the bot down/offline?');
        this.client.logger.detail(err.message);
      });

    if (!githubReleases) return;
    const latestRelease = githubReleases[0];
    if ((Date.now() - new Date(latestRelease.published_at).getTime()) > config.skriptReleases.timeDifference) return;

    const channel = this.client.channels.cache.get(process.env.SKRIPT_TALK_CHANNEL);
    const embed = new MessageEmbed()
      .setColor(settings.colors.default)
      .setAuthor(latestRelease.author.login, latestRelease.author.avatar_url)
      .setTitle(`${latestRelease.name} (${latestRelease.tag_name})`)
      .setURL(latestRelease.html_url)
      .setDescription(latestRelease.body)
      .setFooter(`${config.skriptReleases.dataProvider} (#${latestRelease.id})`)
      .setTimestamp(latestRelease.published_at);
    channel.send(config.skriptReleases.releaseAnnouncement, embed);
  }
}

export default SkriptReleasesTask;
