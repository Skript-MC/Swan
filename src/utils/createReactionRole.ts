import messages from "@/conf/messages";
import { User } from "discord.js";
import { Role } from "discord.js";
import { MessageReaction } from "discord.js";
import { Message } from "discord.js";
import { noop } from ".";

async function createReactionCollector(message: Message, emoji: String, givenRole: Role, permRole: Role) {
  const filter = (reaction: MessageReaction, user: User) => !user.bot && (reaction.emoji.toString()) === emoji;
  const collector = message.createReactionCollector(filter, { dispose: true })
    .on('collect', async (reaction: MessageReaction, user: User) => {
      try {
        const member = await message.guild.members.fetch(user.id);
        if (member.roles.cache.get(givenRole.id) == undefined) {
          if (permRole == undefined) {
            member.roles.add(givenRole);
          } else {
            if (member.roles.cache.get(permRole.id) != undefined)
              member.roles.add(givenRole);
            else
              reaction.users.remove(user.id);
          }
        }
      } catch {
        await message.channel.send(messages.global.oops).catch(noop);
      }
    })
    .on('remove', async (reaction: MessageReaction, user: User) => {
      try {
        const member = await message.guild.members.fetch(user.id);
        if (member.roles.cache.get(givenRole.id) != undefined) {
          member.roles.remove(givenRole);
        }
      } catch {
        await message.channel.send(messages.global.oops).catch(noop);
      }
    });
}

export default createReactionCollector;