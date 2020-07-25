import { MessageEmbed } from 'discord.js';
import he from 'he';
import sanitize from 'sanitize-html';
import Parser from 'rss-parser';
import { client } from '../main';

const parser = new Parser();

function warn(msg) {
  client.logger.warn('Could not fetch a Skript-MC\'s RSS Endpoint. Is either the website or the bot down/offline?');
  client.logger.debug(`    ↳ ${msg}`);
}

function sendTopics(topics, channel) {
  for (const forum of topics) {
    for (const topic of forum.items) {
      topic.forum = forum.title.replace(' derniers sujets', '');
    }
  }
  topics = topics.map(elt => elt.items).flat(); // eslint-disable-line no-param-reassign

  const lastTopics = topics.filter(item => (Date.now() - new Date(item.pubDate).getTime()) < client.config.bot.checkInterval.long);

  for (const item of lastTopics) {
    let { content } = item;
    content = sanitize(content, { allowedTags: [], allowedAttributes: {} });
    content = he.decode(content);
    content = content.replace('Contenu masqué\n\n\nRéagissez ou répondez à ce message afin de consulter le contenu masqué.', '');
    content = content.replace(/(\n){3,}/gmu, '\n');
    if (content.length > 503) content = `${content.slice(0, 500)}...`;

    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .attachFiles([client.config.bot.avatar])
      .setAuthor(`Nouveau post forum (${item.forum})`, 'attachment://logo.png')
      .setTitle(item.title)
      .setURL(item.link)
      .setDescription(content)
      .setTimestamp();
    if (channel) channel.send(embed);
  }
}

function sendFiles(files, channel) {
  const lastFiles = files.items.filter(item => (Date.now() - new Date(item.pubDate).getTime()) < client.config.bot.checkInterval.long);

  for (const item of lastFiles) {
    let { content } = item;
    content = sanitize(content, { allowedTags: [], allowedAttributes: {} });
    content = he.decode(content);
    content = content.replace('Contenu masqué\n\n\nRéagissez ou répondez à ce message afin de consulter le contenu masqué.', '');
    content = content.replace(/(\n){3,}/gmu, '\n');
    if (content.length > 503) content = `${content.slice(0, 500)}...`;

    const embed = new MessageEmbed()
      .setColor(client.config.colors.default)
      .attachFiles([client.config.bot.avatar])
      .setAuthor('Nouvelle ressource forum', 'attachment://logo.png')
      .setTitle(item.title)
      .setURL(item.link)
      .setDescription(content)
      .setTimestamp();
    if (channel) channel.send(embed);
  }
}

export default async function loadRssFeed() {
  const channel = client.channels.resolve(client.config.channels.rssFeed);

  let topics = [];
  for (const feedURL of client.config.apis.rssContentFeeds) {
    // eslint-disable-next-line no-void
    topics.push(parser.parseURL(feedURL).catch(err => void warn(err)));
  }
  const files = await parser.parseURL(client.config.apis.rssFilesFeed).catch(warn);

  topics = await Promise.all(topics);
  topics = topics.filter(elt => typeof elt !== 'undefined');

  if (topics) sendTopics(topics, channel);
  if (files) sendFiles(files, channel);
}
