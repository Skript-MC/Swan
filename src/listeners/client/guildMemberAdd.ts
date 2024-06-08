import { Listener } from '@sapphire/framework';
import type { GuildMember } from 'discord.js';
import pupa from 'pupa';
import * as messages from '#config/messages';
import { channels } from '#config/settings';

export class GuildMemberAddListener extends Listener {
  private deduplication = new Set<string>();

  public override async run(member: GuildMember): Promise<void> {
    if (this.deduplication.has(member.id)) return;

    this.deduplication.add(member.id);
    setTimeout(() => this.deduplication.delete(member.id), 60_000);

    await this._greet(member);
  }

  private async _greet(member: GuildMember): Promise<void> {
    const { greetings } = messages.miscellaneous;
    const randomMessage =
      greetings[Math.floor(Math.random() * greetings.length)];

    const channel = await this.container.client.guild.channels.fetch(
      channels.main,
    );
    if (!channel || !channel.isTextBased()) return;

    const content = pupa(randomMessage, { member });
    await channel.send(content);
  }
}
