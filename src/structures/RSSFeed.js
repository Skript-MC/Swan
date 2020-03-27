/* eslint-disable import/no-cycle */
import { MessageEmbed } from 'discord.js';
import he from 'he';
import sanitize from 'sanitize-html';
import Parser from 'rss-parser';
import { config, client } from '../main';

const parser = new Parser();

export default async function loadRssFeed() {
  const channel = client.channels.cache.get(config.channels.rssFeed);

  let topics = [];
  for (const feedURL of config.apis.rssContentFeeds) {
    topics.push(parser.parseURL(feedURL));
  }
  const files = await parser.parseURL(config.apis.rssFilesFeed);

  topics = await Promise.all(topics);
  for (const forum of topics) {
    for (const topic of forum.items) {
      topic.forum = forum.title.replace(' derniers sujets', '');
    }
  }
  topics = topics.map(elt => elt.items).flat();

  const lastTopics = topics.filter(item => (Date.now()) - new Date(item.pubDate).getTime() < config.bot.checkInterval);
  const lastFiles = files.items.filter(item => (Date.now() - new Date(item.pubDate).getTime()) < config.bot.checkInterval);

  for (const item of lastTopics) {
    let { content } = item;
    content = sanitize(content, { allowedTags: [], allowedAttributes: {} });
    content = he.decode(content);
    content = content.replaceAll(/((\\t|\\n|<br \/>)(\n)?){2}/gmu, '\n');
    content = content.length > 500 ? `${content.slice(0, 500)}...` : content;

    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor(`Nouveau post forum (${item.forum})`, 'attachment://logo.png')
      .setTitle(item.title)
      .setURL(item.link)
      .setDescription(content)
      .setTimestamp();
    channel.send(embed);
  }
  for (const item of lastFiles) {
    let { content } = item;
    content = sanitize(content, { allowedTags: [], allowedAttributes: {} });
    content = he.decode(content);
    content = content.replaceAll(/((\\t|\\n|<br \/>)(\n)?){2}/gmu, '\n');
    content = content.length > 500 ? `${content.slice(0, 500)}...` : content;

    const embed = new MessageEmbed()
      .setColor(config.colors.default)
      .attachFiles([config.bot.avatar])
      .setAuthor('Nouvelle ressource forum', 'attachment://logo.png')
      .setTitle(item.title)
      .setURL(item.link)
      .setDescription(content)
      .setTimestamp();
    channel.send(embed);
  }
}
