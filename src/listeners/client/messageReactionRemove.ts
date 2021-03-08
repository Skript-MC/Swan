import { Listener } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import reactionrole from '@/app/models/reactionrole';
import Logger from '@/app/structures/Logger';
import type { GuildMessage } from '@/app/types';
import { noop } from '@/app/utils';

class MessageReactionRemove extends Listener {
    constructor() {
        super('messageReactionRemove', {
            event: 'messageReactionRemove',
            emitter: 'client',
        });
    }

    public async exec(reaction: MessageReaction, user: User): Promise<void> {
        if (user.bot || reaction.message.channel.type === 'dm')
            return;

        const message = reaction.message as GuildMessage;
        if (this.client.cache.reactionRolesIds.includes(message.id))
            await this._handleReactionRole(reaction, message, user);
    }

    private async _handleReactionRole(reaction: MessageReaction, message: GuildMessage, user: User): Promise<void> {
        const reactionRole = await reactionrole.findOne({ messageId: message.id });
        if (!reactionRole)
            return;
        const emoji = reactionRole.reaction;
        if (reaction.emoji.toString() !== emoji) {
            reaction.remove().catch(noop);
            return;
        }
        const givenRole = message.guild.roles.cache.get(reactionRole.givenRoleId);
        if (!givenRole) {
            Logger.warn('The role with id ' + reactionRole.givenRoleId + ' does not exists !');
            return;
        }
        const member = message.guild.members.cache.get(user.id);
        if (!member) {
            Logger.warn('An error has occured while trying to get member with id ' + user.id);
            return;
        }
        if (member.roles.cache.get(givenRole.id))
            member.roles.remove(givenRole).catch(noop);
    }
}

export default MessageReactionRemove;
