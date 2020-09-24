import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import { client } from '../main';

export default async function loadSkriptReleases() {
  // Envoie de la requête avec les options ci-dessus
  const githubReleases = await axios(`${client.config.apis.github}/repos/SkriptLang/Skript/releases`)
    .then((response) => {
      // Retourner si la réponse n'est pas positive (>= 300)
      if (response.status >= 300) return;
      return response.data;
    })
    .catch((err) => {
      client.logger.warn("Could not fetch github's endpoint (for Skript's infos). Is either the website or the bot down/offline?");
      client.logger.debug(`    ↳ ${err.message}`);
    });

  if (!githubReleases) return; // Retourner si non défini, évitant les boucles crash
  const latestRelease = githubReleases[0]; // Récupérer la dernière release
  if ((Date.now() - new Date(latestRelease.published_at).getTime()) > client.config.bot.checkInterval.long) return; // Vérification si c'est une nouvelle version

  // Récupérer le salon des nouvelles de Skript
  const channel = client.channels.cache.get(client.config.channels.skriptNews);
  // On envoie les informations de la nouvelle version
  const body = latestRelease.body.length >= 1900
    ? latestRelease.body.slice(0, 1900) + '...'
    : latestRelease.body;
  await channel.send('Une nouvelle version de Skript vient d\'être publiée. Vous pouvez la télécharger et consulter les changements ci-dessous.');
  const embed = new MessageEmbed()
    .setColor(client.config.colors.default)
    .setAuthor(latestRelease.author.login, latestRelease.author.avatar_url)
    .setTitle(`${latestRelease.name} (${latestRelease.tag_name})`)
    .setURL(latestRelease.html_url)
    .setDescription(body)
    .setFooter(`Données fournies par https://github.com (#${latestRelease.id})`)
    .setTimestamp(latestRelease.published_at);
  channel.send(embed);
}
