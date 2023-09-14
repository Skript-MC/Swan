import { container } from '@sapphire/pieces';
import type { TextChannel, ThreadChannel } from 'discord.js';
import { ChannelType, PermissionFlagsBits } from 'discord.js';
import { channels } from '#config/settings';
import { Sanction } from '#models/sanction';
import type { ModerationData } from '#moderation/ModerationData';
import type { SanctionDocument } from '#types/index';
import { SanctionTypes } from '#types/index';

export async function getThread(data: ModerationData, orCreate = false): Promise<ThreadChannel> {
  const channelName = `${data.victimName} (${data.sanctionId})`;

  const banChannel = await container.client.guild.channels.fetch(channels.banChannel) as TextChannel;

  const existingChannel = container.client.guild.channels.cache.find(thread => thread.isThread()
    && thread.parentId === banChannel.id
    && !thread.archived && !thread.locked);
  if (!orCreate || existingChannel)
    return existingChannel as ThreadChannel;

  try {
    const thread = await banChannel.threads.create({
      name: channelName,
      invitable: false,
      type: ChannelType.PrivateThread,
      reason: `Création d'un fil de discussion pour le bannissement de ${channelName}.`,
    });

    await thread.members.add(data.victimId);
    return thread;
  } catch (unknownError: unknown) {
    container.logger.error(`Could not create the private thread for the ban of ${data.victimId}.`);
    container.logger.info(`Thread name: "${channelName}"`);
    container.logger.info(`Create thread permissions: ${container.client.guild.members.me?.permissions.has(PermissionFlagsBits.ManageChannels) ?? 'Unknown'}`);
    container.logger.error((unknownError as Error).stack);
    throw new Error('Private Channel Creation Failed');
  }
}

export async function getCurrentSanction(
  memberId: string,
  sanctionType: SanctionTypes,
): Promise<SanctionDocument | null> {
  return await Sanction.findOne({
    userId: memberId,
    revoked: false,
    type: sanctionType,
  });
}

export async function getCurrentBan(memberId: string): Promise<SanctionDocument | null> {
  return await getCurrentSanction(memberId, SanctionTypes.TempBan);
}

export async function getCurrentHardban(memberId: string): Promise<SanctionDocument | null> {
  return await getCurrentSanction(memberId, SanctionTypes.Hardban);
}

export async function getCurrentMute(memberId: string): Promise<SanctionDocument | null> {
  return await getCurrentSanction(memberId, SanctionTypes.Mute);
}

export async function getCurrentWarnCount(memberId: string): Promise<number> {
  return await Sanction.countDocuments({
    userId: memberId,
    revoked: false,
    type: SanctionTypes.Warn,
  });
}
