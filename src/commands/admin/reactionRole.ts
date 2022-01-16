import { ApplyOptions } from '@sapphire/decorators';
import type { Args } from '@sapphire/framework';
import type { GuildTextBasedChannel, Role } from 'discord.js';
import { MessageEmbed } from 'discord.js';
import pupa from 'pupa';
import ReactionRole from '@/app/models/reactionRole';
import SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage, SwanCommandOptions } from '@/app/types';
import { noop } from '@/app/utils';
import { reactionRole as config } from '@/conf/commands/admin';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

@ApplyOptions<SwanCommandOptions>({ ...settings.globalCommandsOptions, ...config.settings })
export default class ReactionRoleCommand extends SwanCommand {
  public override async messageRun(message: GuildMessage, args: Args): Promise<void> {
    const givenRole = await args.pickResult('role');
    if (!givenRole.success) {
      await message.channel.send(messages.prompt.role);
      return;
    }

    const defaultEmoji = message.guild.emojis.resolve(settings.emojis.yes).toString();
    const reaction = await args.pick('enum', { enum: ['default'] }).then(() => defaultEmoji)
      .catch(async () => args.pick('emoji').catch(() => defaultEmoji));

    const destinationChannel = await args.pickResult('guildTextBasedChannel');

    await this._exec(message, givenRole.value, reaction, destinationChannel.value ?? message.channel);
  }

  private async _exec(
    message: GuildMessage,
    givenRole: Role,
    reaction: string,
    channel: GuildTextBasedChannel,
  ): Promise<void> {
    const botMember = this.container.client.guild.me;
    if (!botMember || botMember.roles.highest.position <= givenRole.position) {
      await message.channel.send(config.messages.notEnoughPermissions).catch(noop);
      return;
    }

    const embed = new MessageEmbed()
      .setTitle(pupa(config.messages.embed.title, { givenRole }))
      .setDescription(pupa(config.messages.embed.content, { reaction, givenRole }))
      .setColor(settings.colors.default)
      .setFooter({ text: config.messages.embed.footer.text, iconURL: config.messages.embed.footer.icon });

    const sendMessage = await channel.send({ embeds: [embed] });
    try {
      await sendMessage.react(reaction);
    } catch {
      message.channel.send(messages.global.oops).catch(noop);
      return;
    }

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: givenRole.id,
      reaction,
    };

    this.container.client.cache.reactionRolesIds.add(document.messageId);
    await ReactionRole.create(document).catch(noop);
  }
}
