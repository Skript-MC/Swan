import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import { apis } from '#config/settings';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';

@ApplyOptions<TaskOptions>({ startupOrder: 4 })
export class LoadSkriptMcSyntaxesTask extends Task {
  public override async run(): Promise<void> {
    // Fetch all addons' versions from their APIs, and add them to the array, to make it easier to fetch
    // them later (becase we need their versions in the URL to fetch them.)
    try {
      this.container.client.cache.skriptToolsAddons = await axios
        .get(apis.addons)
        .then((res) => res?.data?.data);
    } catch (unknownError: unknown) {
      this.container.logger.error("Could not load SkriptTool's addons:");
      this.container.logger.error((unknownError as Error).stack);
    }
  }
}
