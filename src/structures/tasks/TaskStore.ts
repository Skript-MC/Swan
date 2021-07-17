import type { Constructor } from '@sapphire/pieces';
import { Store } from '@sapphire/pieces';
import Task from './Task';

export default class TaskStore extends Store<Task> {
  constructor() {
    super(Task as Constructor<Task>, { name: 'tasks' });
  }
}
