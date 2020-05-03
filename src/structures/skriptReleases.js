/* eslint-disable import/no-cycle */
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import { config, client } from '../main';

require('dotenv').config();

export default async function loadSkriptReleases() {
  // Options for the request with the auth header
  const options = {
    accept: 'Accept: application/vnd.github.v3+json',
    headers: { Authorization: `Authorization: token ${process.env.GITHUB_API}` },
  };
  // Send the request with options above
  const githubReleases = await axios(`${config.apis.github}/repos/SkriptLang/Skript/releases`, options)
    .then((response) => {
      // Return undefined if bad credentials or other reasons
      if (response.status !== 200) return undefined;
      return response.data;
    })
    .catch(console.error);


  // Return if undefined, avoid crash loop
  if (!githubReleases) return;
  // Get the latest release
  const latestRelease = githubReleases[0];
  // Check if it's a new release, else return
  if ((Date.now() - new Date(latestRelease.published_at).getTime()) > config.bot.checkInterval) return;


  // Get the targeted channel message
  const channel = client.channels.cache.get(config.channels.skriptNews);
  // Send the new release and infos
  await channel.send('Une nouvelle version de Skript vient d\'être publiée. Vous pouvez la télécharger et consulter les changements ci-dessous.');
  const embed = new MessageEmbed()
    .setColor(config.colors.default)
    // Show the author of the release (username and avatar)
    .setAuthor(latestRelease.author.login, latestRelease.author.avatar_url)
    // Set the title to release name and tag name
    .setTitle(`${latestRelease.name} (${latestRelease.tag_name})`)
    // Add the release URL link
    .setURL(latestRelease.html_url)
    // Add the changelog and informations of the release
    .setDescription(latestRelease.body)
    // Add footer and ID of the release
    .setFooter(`Données fournies par https://github.com (#${latestRelease.id})`)
    // Add the date of the release
    .setTimestamp(latestRelease.published_at);
  channel.send(embed);
}
