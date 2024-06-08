import { container } from '@sapphire/pieces';
import type { ChatInputCommandInteraction, Guild, GuildTextBasedChannel, ModalSubmitInteraction } from 'discord.js';
import { nanoid } from 'nanoid';
import * as configs from '#config/commands/moderation';
import * as messages from '#config/messages';
import type { ModerationDataResult } from '#types/index';
import { SanctionTypes } from '#types/index';

export class ModerationData {
  public channel: GuildTextBasedChannel | null;
  public moderatorId: string;
  public guild: Guild;
  public reason: string;
  public start: number;
  public sanctionId: string;
  // @ts-expect-error: TS is right but changing this would require a lot of work, which isn't needed because it
  // works in its current state (the setters are always correctly called). Also the whole moderation system needs a
  // general lift up and this would probably be trashed anyway.
  public type: SanctionTypes;
  // @ts-expect-error: ditto
  public config: Record<string, string>;
  // @ts-expect-error: ditto
  public duration: number;
  // @ts-expect-error: ditto
  public finish: number;
  // @ts-expect-error: ditto
  public victimId: string;
  // @ts-expect-error: ditto
  public victimName: string;

  /**
   * Create moderation data from a message or from individual informations.
   */
  constructor(interaction?: ChatInputCommandInteraction<'cached'> | ModalSubmitInteraction<'cached'>) {
    this.channel = interaction?.channel ?? null;
    const moderatorId = interaction?.user.id ?? container.client.guild.members.me?.id;
    if (!moderatorId) throw new Error('No moderator ID found.');
    this.moderatorId = moderatorId;
    this.guild = interaction?.guild ?? container.client.guild;
    this.reason = messages.global.noReason;
    this.start = Date.now();
    this.sanctionId = nanoid(8);
  }

  public setSanctionId(id: string): this {
    this.sanctionId = id;
    return this;
  }

  public setVictim({ id, name }: { id: string; name: string }): this {
    this.victimId = id;
    this.victimName = name;
    return this;
  }

  public setType(type: SanctionTypes): this {
    this.type = type;
    this.config = configs[this.type].messages;
    if (this.type === SanctionTypes.Hardban) this.setDuration(-1, false);
    return this;
  }

  public setModeratorId(member: string): this {
    this.moderatorId = member;
    return this;
  }

  public setReason(reason?: string | null): this {
    if (reason) this.reason = reason;
    return this;
  }

  public setDuration(duration: number, computeFinishTimestamp: boolean): this {
    this.duration = duration;
    if (computeFinishTimestamp) this.finish = this.start + duration;
    return this;
  }

  public toSchema(): ModerationDataResult {
    return {
      memberId: this.victimId,
      type: this.type,
      moderator: this.moderatorId,
      start: this.start,
      finish: this.finish,
      duration: this.duration,
      reason: this.reason,
      revoked: false,
      sanctionId: this.sanctionId,
    };
  }
}
