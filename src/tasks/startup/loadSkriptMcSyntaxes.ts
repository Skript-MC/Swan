import { ApplyOptions } from '@sapphire/decorators';
import axios from 'axios';
import { apis } from '#config/settings';
import type { TaskOptions } from '#structures/tasks/Task';
import { Task } from '#structures/tasks/Task';
import type { SkriptMcDocumentationFullAddonResponse, SkriptMcDocumentationSyntaxResponse } from '#types/index';

@ApplyOptions<TaskOptions>({ startupOrder: 5 })
export class LoadSkriptMcSyntaxesTask extends Task {
  public override async run(): Promise<void> {
    this.container.client.cache.skriptMcSyntaxes = [];
    // Load all syntaxes from Skript-MC's API.
    try {
      // TODO: Handle rate-limits. Currently set at 200 requests/hour, but with thoses 2 endpoints,
      // we consume 11 requests. See https://skript-mc.fr/api#quotas
      const token = `api_key=${process.env.SKRIPTMC_DOCUMENTATION_TOKEN}`;
      const allSyntaxes: SkriptMcDocumentationSyntaxResponse[] = await axios(`${apis.skriptmc}/documentation/syntaxes?${token}`)
        .then(res => res?.data);
      const allAddons: SkriptMcDocumentationFullAddonResponse[] = await axios(`${apis.skriptmc}/documentation/addons?${token}`)
        .then(res => res?.data);

      for (const syntax of allSyntaxes) {
        const addon = allAddons.find(adn => adn.name.toLowerCase() === syntax.addon.toLowerCase());
        if (!addon)
          continue;

        const result = /(?<englishName>.+) \((?<frenchName>.*?)\)/g.exec(syntax.name);
        if (result?.groups) {
          const { englishName, frenchName } = result.groups;
          if (englishName && frenchName) {
            syntax.englishName = englishName;
            syntax.frenchName = frenchName;
          }
        }
        const syntaxWithAddon = {
          ...syntax,
          addon: {
            name: addon.name,
            documentationUrl: addon.documentationUrl,
            dependency: addon.dependency,
          },
        };
        this.container.client.cache.skriptMcSyntaxes.push(syntaxWithAddon);
      }
    } catch (unknownError: unknown) {
      this.container.logger.error("Could not fetch Skript-MC's addons/syntaxes:");
      this.container.logger.error((unknownError as Error).stack);
    }
  }
}
