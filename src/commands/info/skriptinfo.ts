import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import semver from 'semver';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { skriptInfo as config } from '@/conf/commands/info';
import settings from '@/conf/settings';

const enumValues = ['all', 'dl', 'download', 'link', 'links'] as const;

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class SkriptInfoCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const display = await args.pick('enum', { enum: enumValues, caseSensitive: false })
      .catch(() => 'all') as (typeof enumValues)[number];

    await this._exec(message, display);
  }

  private async _exec(message: GuildMessage, display: (typeof enumValues)[number]): Promise<void> {
    const embeds: MessageEmbed[] = [];

    // TODO: Refactor this command's usage as it's not very intuitive.
    if (['dl', 'download', 'all'].includes(display)) {
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
          .setFooter({ text: pupa(config.messages.embed.footer, { member: message.member }) }),
      );
    }

    if (['link', 'links', 'all'].includes(display)) {
      embeds.push(
        new MessageEmbed()
          .setColor(settings.colors.default)
          .setTitle(config.messages.embed.informationsTitle)
          .setTimestamp()
          .setDescription(config.messages.embed.information)
          .setFooter({ text: pupa(config.messages.embed.footer, { member: message.member }) }),
      );
    }

    await message.channel.send({ embeds });
  }
}
