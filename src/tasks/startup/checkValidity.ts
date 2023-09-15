import { ApplyOptions } from '@sapphire/decorators';
import { PermissionFlagsBits } from 'discord.js';
import { channels, roles } from '#config/settings';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';

@ApplyOptions<TaskOptions>({ startupOrder: 11 })
export class CheckValidityTask extends Task {
  public override run(): void {
    const { guild } = this.container.client;
    if (!guild)
      return;

    // Check tokens.
    if (!process.env.SENTRY_TOKEN)
      this.container.logger.info('Disabling Sentry as the DSN was not set in the environment variables (SENTRY_TOKEN).');

    // Check channels IDs.
    const cachedChannels = guild.channels.cache;
    const invalidChannels: string[] = [];
    for (const [key, value] of Object.entries(channels)) {
      if (!value)
        invalidChannels.push(`settings.channels.${key} is not set. You may want to fill this field to avoid any error.`);
      else if (!cachedChannels.has(value))
        invalidChannels.push(`The id entered for settings.channels.${key} is not a valid channel.`);
    }
    if (invalidChannels.length > 0) {
      this.container.logger.error('Configured channels are invalid:');
      for (const error of invalidChannels)
        this.container.logger.info(error);

      if (process.env.NODE_ENV === 'production')
        throw new Error('Please fill correctly the configuration to start the bot.');
    }

    // Check roles IDs.
    for (const [key, value] of Object.entries(roles)) {
      if (!value)
        this.container.logger.warn(`settings.roles.${key} is not set. You may want to fill this field to avoid any error.`);
      else if (!guild.roles.cache.has(value))
        this.container.logger.warn(`The id entered for settings.roles.${key} is not a valid role.`);
    }

    // TODO: Also check for emojis IDs.

    // Check client's server-level permissions.
    const requiredChannelPermissions = PermissionFlagsBits.AddReactions
      | PermissionFlagsBits.AttachFiles
      | PermissionFlagsBits.ManageMessages
      | PermissionFlagsBits.ReadMessageHistory
      | PermissionFlagsBits.SendMessages
      | PermissionFlagsBits.CreatePublicThreads
      | PermissionFlagsBits.ViewChannel;
    const requiredGuildPermissions = requiredChannelPermissions
      | PermissionFlagsBits.ManageGuild
      | PermissionFlagsBits.ManageRoles;

    const guildMissingPerms = guild.members.me!.permissions.missing(requiredGuildPermissions);
    if (guildMissingPerms.length > 0)
      this.container.logger.warn(`Swan is missing Guild-Level permissions in guild "${guild.name}". Its cumulated roles' permissions does not contain: ${guildMissingPerms.join(', ')}.`);

    // Check client's channels permissions.
    for (const channel of cachedChannels.values()) {
      if (!channel.isTextBased())
        continue;

      const channelMissingPerms = channel.permissionsFor(guild.members.me!)
        .missing(requiredChannelPermissions);
      if (channelMissingPerms.length > 0)
        this.container.logger.warn(`Swan is missing permissions ${channelMissingPerms.join(', ')} in channel "#${channel.name}"`);
    }
  }
}
