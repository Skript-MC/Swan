import { Listener } from 'discord-akairo';
import type { MessageReaction, User } from 'discord.js';
import ReactionRole from '@/app/models/reactionRole';
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
        const document = await ReactionRole.findOne({ messageId: message.id });
        if (!document)
            return;
        const emoji = document.reaction;
        if (reaction.emoji.toString() !== emoji) {
            reaction.remove().catch(noop);
            return;
        }
        const givenRole = message.guild.roles.cache.get(document.givenRoleId);
        if (!givenRole) {
            Logger.warn('The role with id ' + document.givenRoleId + ' does not exists !');
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
