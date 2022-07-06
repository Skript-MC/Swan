import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import type { TaskOptions } from '@/app/structures/tasks/Task';
import Task from '@/app/structures/tasks/Task';
import type { SkriptToolsAddonListResponse } from '@/app/types';
import settings from '@/conf/settings';
import { loadSkriptToolsAddons as config } from '@/conf/tasks/startup';

@ApplyOptions<TaskOptions>(config.settings)
export default class LoadSkriptMcSyntaxesTask extends Task {
  public override async run(): Promise<void> {
    this.container.client.cache.addonsVersions = [];
    // Fetch all addons' versions from their APIs, and add them to the array, to make it easier to fetch
    // them later (becase we need their versions in the URL to fetch them.)
    try {
      const allAddons: SkriptToolsAddonListResponse = await axios(settings.apis.addons)
        .then(res => res?.data?.data);
      if (!allAddons)
        return;


      for (const addon of Object.keys(allAddons)) {
        const versions = allAddons[addon];
        if (versions)
          this.container.client.cache.addonsVersions.push(versions[versions.length - 1]);
      }
    } catch (unknownError: unknown) {
      this.container.logger.error("Could not load SkriptTool's addons:");
      this.container.logger.error((unknownError as Error).stack);
    }
  }
}
