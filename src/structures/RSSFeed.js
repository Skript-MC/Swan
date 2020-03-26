/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import Parser from 'rss-parser';
import { config, client } from '../main';

const parser = new Parser();

export default async function loadRssFeed() {
  const channel = client.channels.cache.get(config.channels.rssFeed);

  const contentFeed = await parser.parseURL(config.apis.rssContentFeed).catch(console.error);
  const filesFeed = await parser.parseURL(config.apis.rssFilesFeed).catch(console.error);

  const lastContents = contentFeed.items.filter(item => new Date(item.date).getTime - Date.now() < config.bot.checkInterval);
  const lastFiles = filesFeed.items.filter(item => new Date(item.date).getTime - Date.now() < config.bot.checkInterval);

  for (const item of lastContents) {
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor('Nouveau post forum', 'attachment://logo.png')
      .setTitle(item.title)
      .setURL(item.link)
      .setDescription(item.description)
      .setTimestamp();
    channel.send(embed);
  }
  for (const item of lastFiles) {
    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor('Nouvelle ressource forum', 'attachment://logo.png')
      .setTitle(item.title)
      .setURL(item.link)
      .setDescription(item.description)
      .setTimestamp();
    channel.send(embed);
  }
}
