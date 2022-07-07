import type { Awaitable, GuildMember } from 'discord.js';
import Task from '@/app/structures/tasks/Task';

export default abstract class GuildMemberTask extends Task {
  public run(): void {
    throw new Error('Method not implemented.');
  }

  public abstract runListener(member: GuildMember): Awaitable<void>;
}
