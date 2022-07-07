import type { GuildMember } from 'discord.js';
import SwanListener from '@/app/structures/SwanListener';
import type GuildMemberTask from '@/app/structures/tasks/listeners/GuildMemberTask';

export default class GuildMemberAddListener extends SwanListener {
  public async run(member: GuildMember): Promise<void> {
    const tasks = this.getTasks().map(task => task as GuildMemberTask);
    for (const task of tasks)
      await task.runListener(member);
  }
}
