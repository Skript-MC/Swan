import { ApplyOptions } from '@sapphire/decorators';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import semver from 'semver';
import Arguments from '@/app/decorators/Argument';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import { GuildMessage } from '@/app/types';
import type { SwanCommandOptions } from '@/app/types';
import { SkriptInfoCommandArguments } from '@/app/types/CommandArguments';
import { skriptInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class SkriptInfoCommand extends SwanCommand {
  @Arguments({
    name: 'display',
    type: 'string',
    match: 'pick',
    default: 'all',
    validate: (_message, value: string) => ['all', 'dl', 'download', 'link', 'links'].includes(value),
  })
  // @ts-expect-error ts(2416)
  public override async messageRun(message: GuildMessage, args: SkriptInfoCommandArguments): Promise<void> {
    const embeds: MessageEmbed[] = [];

    if (['dl', 'download', 'all'].includes(args.display)) {
      const { lastPrerelease, lastStableRelease } = this.container.client.cache.github;

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

      embeds.push(
        new MessageEmbed()
          .setColor(settings.colors.default)
          .setTitle(config.messages.embed.downloadTitle)
          .setTimestamp()
          .setDescription(downloadDescription)
          .setFooter(pupa(config.messages.embed.footer, { member: message.member })),
      );
    }

    if (['link', 'links', 'all'].includes(args.display)) {
      embeds.push(
        new MessageEmbed()
          .setColor(settings.colors.default)
          .setTitle(config.messages.embed.informationsTitle)
          .setTimestamp()
          .setDescription(config.messages.embed.information)
          .setFooter(pupa(config.messages.embed.footer, { member: message.member })),
      );
    }

    await message.channel.send({ embeds });
  }
}
