import { Command } from "discord-akairo";
import { reactionrole as config } from '@/conf/commands/moderation';
import { GuildMessage } from "@/app/types";
import { ReactionRoleCommandArguments } from "@/app/types/CommandArguments";
import reactionrole from '@/app/models/reactionrole';
import { TextChannel } from "discord.js";
import settings from "@/conf/settings";
import { MessageEmbed } from "discord.js";
import { createReactionCollector } from "@/app/utils";
import messages from "@/conf/messages";
import { MessageReaction, User } from "discord.js";

class ReactionRoleCommand extends Command {
  constructor() {
    super('reactionrole', {
      aliases: config.settings.aliases,
      details: config.details,
      clientPermissions: config.settings.clientPermissions,
      userPermissions: config.settings.userPermissions,
      channel: 'guild',
      args: [{
        id: 'givenRole',
        type: 'role',
        prompt: {
          start: config.messages.prompt_start,
          retry: config.messages.prompt_retry,
        },
      },
      {
        id: 'reaction',
        type: 'string',
      },
      {
        id: 'permRole',
        type: 'role',
      },
      {
        id: 'destinationChannel',
        type: 'textChannel'
      }],
    });
  }

  public async exec(message: GuildMessage, args: ReactionRoleCommandArguments): Promise<void> {
    const { givenRole: givenRole } = args;
    if (givenRole == null) {
      message.channel.send(config.messages.error.replace('{0}', 'Le role saisi n\'est pas valide !'));
      return;
    }
    let { reaction: emoji } = args;
    let { permRole: permRole } = args;
    let { destinationChannel: targetedChannel } = args;
    if (emoji == undefined || emoji.toLowerCase() === "--default")
      emoji = settings.emojis.yes;
    if (targetedChannel == undefined)
      targetedChannel = message.channel as TextChannel;

    const embed = new MessageEmbed({
      title: config.embed.title.replace('{0}', givenRole.name),
      description: config.embed.content.replace('{0}', emoji).replace('{1}', '<@&' + givenRole.id + '>'),
      color: config.embed.color,
      footer: {
        icon_url: config.embed.footer.image,
        text: config.embed.footer.text,
      }
    });
    const sendMessage = await targetedChannel.send(embed);
    sendMessage.react(emoji);
    createReactionCollector(sendMessage, emoji, givenRole, permRole);

    const document = {
      messageId: sendMessage.id,
      channelId: sendMessage.channel.id,
      givenRoleId: givenRole.id,
      reaction: emoji,
      permissionRoleId: permRole == null ? "" : permRole.id,
    }
    reactionrole.create(document);
  }
}

export default ReactionRoleCommand;