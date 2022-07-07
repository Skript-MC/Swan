import { ApplyOptions } from '@sapphire/decorators';
import type { GuildMember } from 'discord.js';
import pupa from 'pupa';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import GuildMemberTask from '@/app/structures/tasks/listeners/GuildMemberTask';
import { noop } from '@/app/utils';
import messages from '@/conf/messages';
import { welcomeMember as config } from '@/conf/tasks/listeners/guildMemberAdd';

@ApplyOptions<TaskOptions>(config.settings)
export default class WelcomeMemberTask extends GuildMemberTask {
  public async runListener(member: GuildMember): Promise<void> {
    const { greetings } = messages.miscellaneous;
    const randomMessage = greetings[Math.floor(Math.random() * greetings.length)];

    const channel = this.container.client.cache.channels.main;

    const content = pupa(randomMessage, { member });
    await channel.send(content).catch(noop);
  }
}
