import { Listener } from '@sapphire/framework';
import type Task from '@/app/structures/tasks/Task';

export default abstract class SwanListener extends Listener {
  private readonly _name;

  protected constructor(context: Listener.Context, options: Listener.Options) {
    super(context, options);
    this._name = context.name;
  }

  public getTasks(): Task[] {
    return this.container.client.stores.get('tasks')
      .filter(task => task.enabled
        && task.category === this._name)
      .map(task => task);
  }
}
