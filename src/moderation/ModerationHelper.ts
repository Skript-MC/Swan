import { container } from '@sapphire/pieces';
import type { GuildMember, TextChannel } from 'discord.js';
import { ChannelType, PermissionsBitField, ThreadChannel } from 'discord.js';
import Sanction from '@/app/models/sanction';
import type ModerationData from '@/app/moderation/ModerationData';
import type { SanctionDocument } from '@/app/types';
import { SanctionTypes } from '@/app/types';
import { nullop } from '@/app/utils';
import settings from '@/conf/settings';

export default {
  async getThread(data: ModerationData, orCreate = false): Promise<ThreadChannel> {
    const channelName = `${data.victim.member.displayName || data.victim.id} (${data.sanctionId})`;

    const banChannel = await data.guild.channels.fetch(settings.channels.banChannel) as TextChannel;

    const existingChannel = data.guild.channels.cache.find(thread => thread instanceof ThreadChannel
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
      await thread.members.add(data.victim.id);
      return thread;
    } catch (unknownError: unknown) {
      container.logger.error(`Could not create the private thread for the ban of ${data.victim.member?.displayName ?? data.victim.id}.`);
      container.logger.info(`Member's name: "${data.victim.member?.displayName ?? 'Unknown'}"`);
      container.logger.info(`Thread name: "${channelName}"`);
      container.logger.info(`Create thread permissions: ${data.guild.members.me?.permissions.has(PermissionsBitField.Flags.ManageChannels) ?? 'Unknown'}`);
      container.logger.error((unknownError as Error).stack);
      throw new Error('Private Channel Creation Failed');
    }
  },

  async removeAllRoles(member: GuildMember): Promise<void> {
    const removingRoles: Array<Promise<GuildMember | null>> = [];

    // We remove the roles one by one, because even if we fail on one we want to continue and try for the others.
    for (const memberRole of member.roles.cache.keys())
      removingRoles.push(member.roles.remove(memberRole).catch(nullop));

    await Promise.all(removingRoles);
  },

  async getCurrentSanction(memberId: string, sanctionType: SanctionTypes): Promise<SanctionDocument> {
    return Sanction.findOne({
      userId: memberId,
      revoked: false,
      type: sanctionType,
    });
  },

  async getCurrentBan(memberId: string): Promise<SanctionDocument> {
    return await this.getCurrentSanction(memberId, SanctionTypes.TempBan);
  },

  async getCurrentHardban(memberId: string): Promise<SanctionDocument> {
    return await this.getCurrentSanction(memberId, SanctionTypes.Hardban);
  },

  async getCurrentMute(memberId: string): Promise<SanctionDocument> {
    return await this.getCurrentSanction(memberId, SanctionTypes.Mute);
  },

  async getCurrentWarnCount(memberId: string): Promise<number> {
    return Sanction.countDocuments({
      userId: memberId,
      revoked: false,
      type: SanctionTypes.Warn,
    });
  },

};
