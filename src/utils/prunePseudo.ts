import type { User, GuildMember } from 'discord.js';
import messages from '../../config/messages';

function prunePseudo(member: GuildMember, user: User, id: string): string {
  return (member?.nickname?.replace(/[^a-zA-Z0-9]/gimu, '')
    || user?.username.replace(/[^a-zA-Z0-9]/gimu, '')
    || id
    || messages.global.unknownName)
    .toLowerCase();
}

export default prunePseudo;
