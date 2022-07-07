import { ApplyOptions } from '@sapphire/decorators';
import { MessageLimits } from '@sapphire/discord-utilities';
import { MessageEmbed } from 'discord.js';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import MessageTask from '@/app/structures/tasks/listeners/MessageTask';
import type { GuildMessage } from '@/app/types';
import { noop, nullop, trimText } from '@/app/utils';
import settings from '@/conf/settings';
import { quoteLinkedMessage as config } from '@/conf/tasks/listeners/messageCreate';

@ApplyOptions<TaskOptions>(config.settings)
export default class QuoteLinkedMessageTask extends MessageTask {
  public async runListener(message: GuildMessage): Promise<boolean> {
    const linkRegex = new RegExp(`https://(?:ptb.|canary.)?discord(?:app)?.com/channels/${message.guild.id}/(\\d{18})/(\\d{18})`, 'imu');
    if (!linkRegex.test(message.content))
      return false;

    const quotes: Array<{ channelId: string; messageId: string }> = [];
    let text = message.content;
    while (linkRegex.test(text)) {
      const [full, channelId, messageId] = linkRegex.exec(text)!;
      quotes.push({ channelId, messageId });
      text = text.replace(full, '');
    }

    for (const quote of quotes) {
      const channel = await this.container.client.channels.fetch(quote.channelId).catch(nullop);
      if (!channel?.isText() || channel.type === 'DM')
        continue;

      const targetedMessage = await channel.messages.fetch(quote.messageId);
      if (!targetedMessage?.content)
        continue;

      const embed = new MessageEmbed()
        .setColor(settings.colors.default)
        .setAuthor({
          name: `Message de ${targetedMessage.member?.displayName ?? targetedMessage.author.username}`,
          iconURL: targetedMessage.author.avatarURL() ?? '',
        })
        .setDescription(`${trimText(targetedMessage.content, MessageLimits.MaximumLength - 100)}\n[(lien)](${targetedMessage.url})`)
        .setFooter({ text: `Message cité par ${message.member.displayName}.` });

      // We add all attachments if needed.
      if (targetedMessage.attachments.size > 0) {
        const attachments = [...targetedMessage.attachments.values()].slice(0, 5);
        for (const [i, attachment] of attachments.entries())
          embed.addField(`Pièce jointe n°${i}`, attachment.url);
      }

      const msg = await message.channel.send({ embeds: [embed] });
      const collector = msg
        .createReactionCollector({
          filter: (reaction, user) => user.id === message.author.id
            && (reaction.emoji.id || reaction.emoji.name) === settings.emojis.remove
            && !user.bot,
        }).on('collect', async () => {
          await msg.delete().catch(noop);
          collector.stop();
        });

      await msg.react(settings.emojis.remove);
    }
    return false;
  }
}
