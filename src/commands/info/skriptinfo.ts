import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import semver from 'semver';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { skriptInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class SkriptInfoCommand extends SwanCommand {
  // [{
  //   id: 'display',
  //   type: Argument.validate('string', (_message, phrase) =>
  //     ['all', 'dl', 'download', 'link', 'links'].includes(phrase)),
  //   default: 'all',
  // }],

  public override async run(message: GuildMessage, args: Args): Promise<void> {
    const displayQuery = (await args.pickResult('string'))?.value ?? 'all';
    const display = ['all', 'dl', 'download', 'link', 'links'].includes(displayQuery) ? displayQuery : 'all';

    if (['dl', 'download', 'all'].includes(display)) {
      const { lastPrerelease, lastStableRelease } = this.context.client.cache.github;

      // Check if a prerelease is greater than the last stable release.
      const isPrereleaseImportant = lastPrerelease
        ? semver.gt(
            semver.coerce(lastPrerelease.tag_name) ?? '',
            semver.coerce(lastStableRelease?.tag_name) ?? '',
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

    if (['link', 'links', 'all'].includes(display)) {
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
