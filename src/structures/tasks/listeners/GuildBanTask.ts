import type { Awaitable, GuildBan } from 'discord.js';
import Task from '@/app/structures/tasks/Task';

export default abstract class GuildBanTask extends Task {
  public run(): void {
    throw new Error('Method not implemented.');
  }

  public abstract runListener(ban: GuildBan): Awaitable<void>;
}
