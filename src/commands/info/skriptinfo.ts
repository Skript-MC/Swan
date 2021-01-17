import { Argument, Command } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import semver from 'semver';
import { skriptInfo as config } from '../../../config/commands/info';
import settings from '../../../config/settings';
import type { SkriptInfoCommandArguments } from '../../types/CommandArguments';
import type { GuildMessage } from '../../types/index';

class SkriptInfoCommand extends Command {
  constructor() {
    super('Skript Info', {
      aliases: config.settings.aliases,
      details: config.details,
      args: [{
        id: 'display',
        type: Argument.validate('string', (_message, phrase) => ['all', 'dl', 'download', 'link', 'links'].includes(phrase)),
        default: 'all',
      }],
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
    });
  }

  public async exec(message: GuildMessage, args: SkriptInfoCommandArguments): Promise<void> {
    if (['dl', 'download', 'all'].includes(args.display)) {
      const { lastPrerelease, lastStableRelease } = this.client.githubCache;

      const isPrereleaseImportant = lastPrerelease
        ? semver.gt(
            semver.coerce(lastPrerelease.tag_name),
            semver.coerce(lastStableRelease.tag_name),
          )
        : true;

      const baseMessage = isPrereleaseImportant
        ? config.messages.embed.versionsWithPrerelease
        : config.messages.embed.versionsWithoutPrerelease;
      const downloadDescription = pupa(baseMessage, {
        latest: lastPrerelease,
        latestStable: lastStableRelease,
      });

      const downloadEmbed = new MessageEmbed()
        .setColor(settings.colors.default)
        .setTitle(config.messages.embed.downloadTitle)
        .setTimestamp()
        .setDescription(downloadDescription)
        .setFooter(pupa(config.messages.embed.footer, { member: message.member }));

      await message.channel.send(downloadEmbed);
    }

    if (['link', 'links', 'all'].includes(args.display)) {
      const informationEmbed = new MessageEmbed()
        .setColor(settings.colors.default)
        .setTitle(config.messages.embed.informationsTitle)
        .setTimestamp()
        .setDescription(config.messages.embed.information)
        .setFooter(pupa(config.messages.embed.footer, { member: message.member }));

      await message.channel.send(informationEmbed);
    }
  }
}

export default SkriptInfoCommand;
