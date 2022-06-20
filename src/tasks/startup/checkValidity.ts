import { ApplyOptions } from '@sapphire/decorators';
import { Permissions } from 'discord.js';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import settings from '@/conf/settings';

@ApplyOptions<TaskOptions>({ startupOrder: 11 })
export default class LoadSkriptMcSyntaxesTask extends Task {
  public override run(): void {
    const { guild } = this.container.client;
    if (!guild)
      return;


    // Check tokens.
    if (!process.env.SENTRY_TOKEN)
      this.container.logger.info('Disabling Sentry as the DSN was not set in the environment variables (SENTRY_TOKEN).');


    // Check channels IDs.
    const channels = guild.channels.cache;
    const invalidChannels: string[] = [];
    for (const [key, value] of Object.entries(settings.channels)) {
      if (Array.isArray(value)) {
        if (value.length === 0)
          invalidChannels.push(`settings.channels.${key} is not set. You may want to fill this field to avoid any error.`);
         else if (!value.every(elt => channels.has(elt)))
          invalidChannels.push(`One of the id entered for settings.channels.${key} is not a valid channel.`);
      } else if (!value) {
        invalidChannels.push(`settings.channels.${key} is not set. You may want to fill this field to avoid any error.`);
      } else if (!channels.has(value)) {
        invalidChannels.push(`The id entered for settings.channels.${key} is not a valid channel.`);
      }
    }
    if (invalidChannels.length > 0) {
      this.container.logger.error('Configured channels are invalid:');
      for (const error of invalidChannels)
        this.container.logger.info(error);


      if (process.env.NODE_ENV === 'production')
        throw new Error('Please fill correctly the configuration to start the bot.');
    }

    // Check roles IDs.
    for (const [key, value] of Object.entries(settings.roles)) {
      if (!value)
        this.container.logger.warn(`settings.roles.${key} is not set. You may want to fill this field to avoid any error.`);
       else if (!guild.roles.cache.has(value))
        this.container.logger.warn(`The id entered for settings.roles.${key} is not a valid role.`);
    }

    // TODO: Also check for emojis IDs.

    // Check client's server-level permissions.
    const requiredChannelPermissions = new Permissions([
      'ADD_REACTIONS',
      'ATTACH_FILES',
      'MANAGE_MESSAGES',
      'READ_MESSAGE_HISTORY',
      'SEND_MESSAGES',
      'USE_PUBLIC_THREADS',
      'VIEW_CHANNEL',
    ]);
    const requiredGuildPermissions = new Permissions([
      ...requiredChannelPermissions,
      'MANAGE_GUILD',
      'MANAGE_ROLES',
    ]);

    const guildMissingPerms = guild.me?.permissions.missing(requiredGuildPermissions);
    if (guildMissingPerms.length > 0)
      this.container.logger.warn(`Swan is missing Guild-Level permissions in guild "${guild.name}". Its cumulated roles' permissions does not contain: ${guildMissingPerms.join(', ')}.`);


    // Check client's channels permissions.
    for (const channel of channels.values()) {
      if (!channel.isText())
        continue;


      const channelMissingPerms = channel.permissionsFor(guild.me)
        .missing(requiredChannelPermissions);
      if (channelMissingPerms.length > 0)
        this.container.logger.warn(`Swan is missing permissions ${channelMissingPerms.join(', ')} in channel "#${channel.name}"`);
    }
  }
}
