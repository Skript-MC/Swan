import { Listener } from '@sapphire/framework';
import type { SwanClient } from '#app/SwanClient';
import { bot } from '#config/settings';
import { Events } from '#types/sapphire';

export class ReadyListener extends Listener {
  public override async run(): Promise<void> {
    const client = this.container.client as SwanClient;

    const guild = this.container.client.guilds.resolve(bot.guild);
    if (!guild) throw new TypeError('Expected SwanClient.guild to be defined after resolving.');
    client.guild = guild;

    const taskStore = this.container.client.stores.get('tasks');
    if (!taskStore) throw new TypeError('Expected taskStore to be defined.');

    this.container.logger.info('Loading startup tasks...');
    const tasks = taskStore
      .filter((task) => task.enabled && Number.isInteger(task.startupOrder))
      .sort((a, b) => (a.startupOrder || 0) - (b.startupOrder || 0));
    for (const [taskName, task] of tasks) {
      this.container.logger.info(`Run startup task ${taskName}...`);
      try {
        await task.run();
      } catch (error: unknown) {
        this.container.client.emit(Events.TaskError, error as Error, {
          piece: this,
        });
      }
    }

    this.container.logger.info('Swan is ready to listen for messages.');

    this.container.client.isLoading = false;
  }
}
