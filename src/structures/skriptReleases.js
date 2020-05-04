/* eslint-disable import/no-cycle */
import axios from 'axios';
import { MessageEmbed } from 'discord.js';
import { config, client } from '../main';

export default async function loadSkriptReleases() {
  // Envoie de la requête avec les options ci-dessus
  const githubReleases = await axios(`${config.apis.github}/repos/SkriptLang/Skript/releases`)
    .then((response) => {
      // Retourner unedefined si la réponse n'est pas positive (= 200)
      if (response.status !== 200) return undefined;
      return response.data;
    })
    .catch(console.error);

  if (!githubReleases) return; // Retourner si non défini, évitant les boucles crash
  const latestRelease = githubReleases[0]; // Récupérer la dernière release
  if ((Date.now() - new Date(latestRelease.published_at).getTime()) > config.bot.checkInterval) return; // Vérification si c'est une nouvelle version

  // Récupérer le salon des nouvelles de Skript
  const channel = client.channels.cache.get(config.channels.skriptNews);
  // On envoie les informations de la nouvelle version
  await channel.send('Une nouvelle version de Skript vient d\'être publiée. Vous pouvez la télécharger et consulter les changements ci-dessous.');
  const embed = new MessageEmbed()
    .setColor(config.colors.default)
    .setAuthor(latestRelease.author.login, latestRelease.author.avatar_url)
    .setTitle(`${latestRelease.name} (${latestRelease.tag_name})`)
    .setURL(latestRelease.html_url)
    .setDescription(latestRelease.body)
    .setFooter(`Données fournies par https://github.com (#${latestRelease.id})`)
    .setTimestamp(latestRelease.published_at);
  channel.send(embed);
}
