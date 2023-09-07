import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import pupa from 'pupa';
import * as messages from '#config/messages';
import { noop } from '#utils/index';

export class GuildMemberAddListener extends Listener {
  public override async run(member: GuildMember): Promise<void> {
    await this._greet(member);
  }

  private async _greet(member: GuildMember): Promise<void> {
    const { greetings } = messages.miscellaneous;
    const randomMessage = greetings[Math.floor(Math.random() * greetings.length)];

    const channel = this.container.client.cache.channels.main;

    const content = pupa(randomMessage, { member });
    await channel.send(content).catch(noop);
  }
}
