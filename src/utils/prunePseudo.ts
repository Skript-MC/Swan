import type { GuildMember, User } from 'discord.js';
import messages from '@/conf/messages';

/**
 * Remove characters that are neither letters nor numbers from a guild member / user / string.
 * @param {GuildMember} member - The member to get the nickname from.
 * @param {User} user - The user to get the username from.
 * @param {string} id - The id of the user.
 * @returns string - The string will always be lowercase.
 */
function prunePseudo(member: GuildMember, user: User, id: string): string {
  return (member?.nickname?.replace(/[^a-zA-Z0-9]/gimu, '')
    || user?.username.replace(/[^a-zA-Z0-9]/gimu, '')
    || id
    || messages.global.unknownName)
    .toLowerCase();
}

export default prunePseudo;
