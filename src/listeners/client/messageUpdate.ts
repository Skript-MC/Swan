import { Listener } from '@sapphire/framework';
import {
  type BaseGuildTextChannel,
  EmbedBuilder,
  type Message,
  type MessageReaction,
} from 'discord.js';
import { User } from 'discord.js';
import pupa from 'pupa';
import * as messages from '#config/messages';
import { channels, colors, emojis, roles } from '#config/settings';
import { escapeCode, noop } from '#utils/index';

export class MessageUpdateListener extends Listener {
  public override async run(
    oldMessage: Message,
    newMessage: Message,
  ): Promise<void> {
    if (
      !oldMessage.inGuild() ||
      !oldMessage.member ||
      !newMessage.inGuild() ||
      !newMessage.member
    )
      return;

    if (oldMessage?.content && !oldMessage.system) {
      const logChannel = await this.container.client.channels.fetch(
        channels.discordLog,
      );
      if (logChannel) {
        const embed = new EmbedBuilder()
          .setDescription(
            `✏️ Message envoyé par <@${oldMessage.author.id}> édité dans <#${oldMessage.channel.id}>.
            [Aller au message](https://discord.com/channels/${oldMessage.guild.id}/${oldMessage.channel.id}/${oldMessage.id})
            `,
          )
          .setColor(colors.light)
          .setAuthor({
            name: `${oldMessage.author.tag} (${oldMessage.author.id})`,
            iconURL: oldMessage.author.displayAvatarURL(),
          })
          .setFields([
            {
              name: 'Ancien message',
              value: `\`\`\`${escapeCode(oldMessage.content)}\`\`\``,
            },
            {
              name: 'Nouveau message',
              value: `\`\`\`${escapeCode(newMessage.content)}\`\`\``,
            },
          ])
          .setFooter({ text: `ID du message: ${oldMessage.id}` });
        await (logChannel as BaseGuildTextChannel)
          .send({
            embeds: [embed],
          })
          .catch(noop);
      }
    }

    if (
      newMessage.author.bot ||
      newMessage.system ||
      newMessage.member.roles.highest.position >=
        (newMessage.guild.roles.cache.get(roles.staff)?.position || 0)
    )
      return;

    // Check for ghostpings.
    // List of all users that were mentionned in the old message.
    const oldUserMentions = [...oldMessage.mentions.users.values()].filter(
      (usr) => !usr.bot && usr.id !== newMessage.author.id,
    );
    // List of all roles that were mentionned in the old message.
    const oldRoleMentions = [...oldMessage.mentions.roles.values()];
    // List of usernames / roles name's that were mentionned in the old message.
    const oldMentions = [...oldUserMentions, ...oldRoleMentions];

    // List of all users that are mentionned in the new message.
    const newUserMentions = [...newMessage.mentions.users.values()].filter(
      (usr) => !usr.bot && usr.id !== newMessage.author.id,
    );
    // List of all roles that are mentionned in the new message.
    const newRoleMentions = [...newMessage.mentions.roles.values()];
    // List of usernames / roles name's that are mentionned in the new message.
    const newMentions = [...newUserMentions, ...newRoleMentions];

    // Filter out all the mentions that were in the previous message *and* in the new message.
    const deletedMentions = oldMentions.filter(
      (oldMention) =>
        !newMentions.some((newMention) => oldMention.id === newMention.id),
    );
    if (deletedMentions.length === 0) return;

    // Gt all the deleted role menttions
    const deletedRoleMentions = oldRoleMentions.filter(
      (oldRoleMention) =>
        !newRoleMentions.some(
          (newRoleMention) => oldRoleMention.id === newRoleMention.id,
        ),
    );
    const severalPeopleAffected =
      deletedMentions.length > 1 || deletedRoleMentions.length > 0;

    // Choose the message (plural if multiple people (or a role) were ghost-ping)
    const baseMessage = severalPeopleAffected
      ? messages.miscellaneous.ghostPingPlural
      : messages.miscellaneous.ghostPingSingular;

    const botNotificationMessage = await newMessage.channel.send(
      pupa(baseMessage, {
        mentions: deletedMentions
          .map((mention) =>
            mention instanceof User ? mention.username : mention.name,
          )
          .join(', '),
        user: newMessage.author,
      }),
    );
    if (!botNotificationMessage) return;

    // If a group of people were ghost-ping, we don't want one people to just remove the alert.
    if (severalPeopleAffected) return;

    await botNotificationMessage.react(emojis.remove);
    const collector = botNotificationMessage
      .createReactionCollector({
        filter: (r: MessageReaction, user: User) =>
          (r.emoji.id ?? r.emoji.name) === emojis.remove &&
          user.id === deletedMentions[0].id &&
          !user.bot,
      })
      .on('collect', async () => {
        collector.stop();
        await botNotificationMessage.delete();
      });
  }
}
