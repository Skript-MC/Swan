import type SwanClient from '@/app/SwanClient';
import SwanListener from '@/app/structures/SwanListener';
import { Events } from '@/app/types/sapphire';
import settings from '@/conf/settings';

export default class ReadyListener extends SwanListener {
  public override async run(): Promise<void> {
    const client = this.container.client as SwanClient;
    client.guild = this.container.client.guilds.resolve(settings.bot.guild)!;
    if (!client.guild)
      throw new TypeError('Expected SwanClient.guild to be defined after resolving.');

    this.container.logger.info('Loading pieces from database...');
    await client.refreshPieces();

    const taskStore = this.container.client.stores.get('tasks');
    if (!taskStore)
      throw new TypeError('Expected taskStore to be defined.');

    this.container.logger.info('Loading startup tasks...');
    const tasks = taskStore.filter(task => task.enabled && Number.isInteger(task.startupOrder))
      .sort((a, b) => a.startupOrder - b.startupOrder);
    for (const [taskName, task] of tasks) {
      this.container.logger.info(`Run startup task ${taskName}...`);
      try {
        await task.run();
      } catch (error: unknown) {
        this.container.client.emit(Events.TaskError, error as Error, { piece: this });
      }
    }

    this.container.logger.info('Swan is ready to listen for messages.');

    this.container.client.isLoading = false;
  }
}
