import { Store } from '@sapphire/pieces';
import type { Constructor } from '@sapphire/utilities';
import { Task } from '@/app/structures/tasks/Task';

export class TaskStore extends Store<Task> {
  constructor() {
    super(Task as unknown as Constructor<Task>, { name: 'tasks' });
  }
}
