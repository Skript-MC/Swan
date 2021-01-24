import { promises as fs } from 'fs';
import path from 'path';
import { stripIndent } from 'common-tags';
import { Permissions, TextChannel } from 'discord.js';
import type { GuildChannel, NewsChannel } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import Sanction from '@/app/models/sanction';
import Logger from '@/app/structures/Logger';
import { SanctionTypes } from '@/app/types';
import type { BanChannelMessage } from '@/app/types';
import { prunePseudo } from '@/app/utils';
import settings from '@/conf/settings';
import type ModerationData from './ModerationData';

export default {
  async getOrCreateChannel(data: ModerationData): Promise<TextChannel | never> {
    const pseudo = prunePseudo(data.victim.member, data.victim.user, data.victim.id);
    const channelName = settings.moderation.banChannelPrefix + pseudo;

    const filter = (chan: GuildChannel): boolean => chan instanceof TextChannel && chan?.topic?.split(' ')[0] === data.victim.id;
    if (data.guild.channels.cache.some(chan => filter(chan)))
      return data.guild.channels.cache.find((chan): chan is TextChannel => filter(chan)) as TextChannel;

    try {
      const channel = await data.guild.channels.create(
        channelName,
        {
          type: 'text',
          topic: `${data.victim.id} - ${pupa(settings.moderation.banChannelTopic, { member: data.victim.member })}`,
          parent: settings.channels.privateChannelsCategory,
          permissionOverwrites: [{
            id: settings.roles.everyone,
            deny: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.CREATE_INSTANT_INVITE],
          }, {
            id: settings.roles.staff,
            allow: [Permissions.FLAGS.VIEW_CHANNEL, Permissions.FLAGS.MANAGE_CHANNELS],
          }, {
            id: data.victim.id,
            allow: [Permissions.FLAGS.VIEW_CHANNEL],
          }],
        },
      );
      return channel;
    } catch (unknownError: unknown) {
      Logger.error(`Could not create the private channel for the ban of ${data.victim.member?.displayName ?? 'Unknown'}.`);
      Logger.detail(`Member's name: "${data.victim.member?.displayName ?? 'Unknown'}"`);
      Logger.detail(`Stripped name: "${pseudo}"`);
      Logger.detail(`Create channel permissions: ${data.guild.me.hasPermission(Permissions.FLAGS.MANAGE_CHANNELS) ?? 'Unknown'}`);
      Logger.error((unknownError as Error).stack);
      throw new Error('Private Channel Creation Failed');
    }
  },

  async getAllChannelMessages(channel: NewsChannel | TextChannel): Promise<BanChannelMessage[]> {
    const allMessages: BanChannelMessage[] = [];
    let beforeId: string;

    while (true) {
      const messages = await channel.messages.fetch({ limit: 100, before: beforeId }, false, false);
      if (messages.size === 0)
        break;

      beforeId = messages.last().id;
      const parsedMessages: BanChannelMessage[] = messages.array()
        .map(msg => ({
          id: msg.id,
          content: msg.content,
          authorName: msg.author.username,
          authorId: msg.author.id,
          sentAt: msg.createdTimestamp,
          edited: msg.editedTimestamp,
          attachments: msg.attachments?.array().map(atc => ({ name: atc.name, url: atc.url })),
        }));
      allMessages.push(...parsedMessages);

      if (messages.size < 90)
        break;
    }

    return allMessages.reverse();
  },

  async getMessageFile(
    data: ModerationData,
    messages: BanChannelMessage[],
  ): Promise<{ path: string; name: string }> {
    let fileContent = stripIndent`
      Historique des messages du salon du banni : ${data.victim?.id ?? 'Inconnu'}.
      ----------------------------------------------------------------------------
      Messages :\n\n\n
    `;

    for (const message of messages) {
      const sentAt = moment(new Date(message.sentAt)).format(settings.miscellaneous.durationFormat);

      let line = `[${message.id}] (${sentAt}) ${message.authorName} : ${message.content}`;
      if (message.edited)
        line = `[Modifié] ${line}`;
      for (const attachment of message.attachments)
        line += `[Pièce jointe "${attachment.name}" (${attachment.url})]`;

      fileContent += `${line}\n`;
    }

    let fileName = `logs-${data.victim?.id}`;
    const filePath = path.join(process.cwd(), 'banlogs/');
    let i = 1;

    const exists = async (filepath: string): Promise<boolean> => fs.access(filepath)
      .then(() => true)
      .catch(() => false);

    if (await exists(`${filePath}${fileName}.txt`)) {
      while (await exists(`${filePath}${fileName}-${i}.txt`))
        i++;

      fileName += `-${i}`;
    }

    if (!(await exists(filePath)))
      await fs.mkdir(filePath);

    await fs.writeFile(`${filePath}${fileName}.txt`, fileContent);

    return {
      path: `${filePath}${fileName}.txt`,
      name: fileName,
    };
  },

  async isBanned(memberId: string, includeHardban = false): Promise<boolean> {
    const banTypes = [SanctionTypes.Ban];
    if (includeHardban)
      banTypes.push(SanctionTypes.Hardban);

    const banObject = await Sanction.findOne({
      memberId,
      revoked: false,
      type: { $in: banTypes },
    });
    return Boolean(banObject);
  },

  async isMuted(memberId: string): Promise<boolean> {
    const muteObject = await Sanction.findOne({
      memberId,
      revoked: false,
      type: SanctionTypes.Mute,
    });
    return Boolean(muteObject);
  },
};
