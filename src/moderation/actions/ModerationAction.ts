import { EmbedLimits } from '@sapphire/discord-utilities';
import type { SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import type { GuildTextBasedChannel, HexColorString } from 'discord.js';
import {
  EmbedBuilder,
  ThreadChannel,
  time as timeFormatter,
  TimestampStyles,
} from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import { ActionUpdateInformations } from '@/app/moderation/ActionUpdateInformations';
import { ErrorState } from '@/app/moderation/ErrorState';
import type { ModerationData } from '@/app/moderation/ModerationData';
import { ModerationError } from '@/app/moderation/ModerationError';
import * as ModerationHelper from '@/app/moderation/ModerationHelper';
import { SanctionTypes } from '@/app/types';
import { noop, trimText } from '@/app/utils';
import * as messages from '@/conf/messages';
import { moderation } from '@/conf/settings';

export abstract class ModerationAction {
  data: ModerationData;
  client: SapphireClient;
  logChannel: GuildTextBasedChannel;

  errorState: ErrorState;
  updateInfos: ActionUpdateInformations;

  constructor(data: ModerationData) {
    this.data = data;
    this.client = container.client;
    this.logChannel = this.client.cache.channels.log;

    this.errorState = new ErrorState(this.data.channel || this.logChannel);
    this.updateInfos = new ActionUpdateInformations(this.data);
  }

  protected get nameString(): string {
    return this.data.victim?.user ? ('<@' + this.data.victim.user.id + '>') : messages.global.unknownName;
  }

  protected get moderatorString(): string {
    return this.data.moderatorId ? ('<@' + this.data.moderatorId + '>') : messages.global.unknownName;
  }

  protected get action(): string {
    switch (this.data.type) {
      case SanctionTypes.TempBan:
        if (this.updateInfos.isUpdate())
          return messages.moderation.sanctionNames.banUpdate;
        return messages.moderation.sanctionNames.tempBan;
      case SanctionTypes.Hardban:
        return messages.moderation.sanctionNames.hardban;
      case SanctionTypes.Mute:
        if (this.updateInfos.isUpdate())
          return messages.moderation.sanctionNames.muteUpdate;
        return messages.moderation.sanctionNames.mute;
      case SanctionTypes.Kick:
        return messages.moderation.sanctionNames.kick;
      case SanctionTypes.Warn:
        return messages.moderation.sanctionNames.warn;
      case SanctionTypes.Unban:
        return messages.moderation.sanctionNames.unban;
      case SanctionTypes.Unmute:
        return messages.moderation.sanctionNames.unmute;
      case SanctionTypes.RemoveWarn:
        return messages.moderation.sanctionNames.removeWarn;
      default:
        throw new Error(`Received unexpected moderation type: ${this.data.type}`);
    }
  }

  protected get originalAction(): string {
    switch (this.data.type) {
      case SanctionTypes.TempBan:
        if (this.updateInfos.isUpdate())
          return messages.moderation.sanctionNames.tempBan;
        return this.action;
      case SanctionTypes.Mute:
        if (this.updateInfos.isUpdate())
          return messages.moderation.sanctionNames.mute;
        return this.action;
      case SanctionTypes.Unban:
        return messages.moderation.sanctionNames.tempBan;
      case SanctionTypes.Unmute:
        return messages.moderation.sanctionNames.mute;
      case SanctionTypes.RemoveWarn:
        return messages.moderation.sanctionNames.warn;
      default:
        return this.action;
    }
  }

  protected get color(): HexColorString {
    return moderation.colors[this.data.type];
  }

  public async commit(): Promise<boolean> {
    await this.updateInfos.load();

    try {
      await this.before?.();
      await this.notify();
      await this.exec();
      await this.log();
      await this.after?.();
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occurred while executing a moderation action.')
          .addDetail('Data', JSON.stringify(this.data.toSchema())),
      );
    }

    if (this.errorState.hasError()) {
      this.errorState.log();
      return false;
    }
    return true;
  }

  protected formatDuration(duration: number): string {
    return duration === -1
      ? messages.moderation.permanent
      : moment.duration(duration).humanize();
  }

  protected getFormattedChange(): string {
    const oldDuration = this.updateInfos.sanctionDocument.duration;
    const newDuration = this.data.duration;
    return pupa(messages.moderation.durationChange, {
      oldDuration: oldDuration ? this.formatDuration(oldDuration) : messages.global.unknown(true),
      newDuration: newDuration ? this.formatDuration(newDuration) : messages.global.unknown(true),
    });
  }

  protected async notify(): Promise<void> {
    const message = this.updateInfos.isUpdate()
      ? pupa(this.data.config.notificationUpdate, { action: this, change: this.getFormattedChange() })
      : pupa(this.data.config.notification, { action: this, duration: this.formatDuration(this.data.duration) });

    try {
      // If the sanction is a temporary ban, we should notify the victim in his private thread.
      // We should only notify the victim if the sanction is an update.
      if (this.data.type === SanctionTypes.TempBan
        && this.data.victim.member) {
        const thread = await ModerationHelper.getThread(this.data);
        if (thread instanceof ThreadChannel)
          await thread.send(message);
      } else {
        await (this.data.victim.member ?? this.data.victim.user)?.send(message).catch(noop);
      }
    } catch {
      await this.data.channel.send(messages.moderation.memberHasClosedDm).catch(noop);
    }
  }

  protected async log(): Promise<void> {
    if (!this.logChannel)
      return;

    const embedMsgs = messages.moderation.log;

    const embed = new EmbedBuilder()
      .setColor(this.color)
      .setTitle(pupa(messages.moderation.newCase, { action: this }))
      .setTimestamp()
      .addFields(
        { name: embedMsgs.userTitle, value: `${this.nameString}\n${this.data.victim.id}`, inline: true },
        { name: embedMsgs.moderatorTitle, value: `${this.moderatorString}\n${this.data.moderatorId}`, inline: true },
        { name: embedMsgs.actionTitle, value: this.action.toString(), inline: true },
        {
          name: embedMsgs.reasonTitle,
          value: trimText(this.data.reason.toString(), EmbedLimits.MaximumFieldValueLength),
          inline: true,
        },
      );

    if (this.data.duration && this.data.type !== SanctionTypes.Warn) {
      let content = this.formatDuration(this.data.duration);
      if (this.data?.finish !== -1) {
        content += pupa(embedMsgs.durationDescription, {
          expiration: timeFormatter(Math.round(this.data.finish / 1000), TimestampStyles.LongDateTime),
        });
      }
      embed.addFields({ name: embedMsgs.durationTitle, value: content, inline: true });
    }
    if (this.data.privateChannel) {
      embed.addFields({
        name: embedMsgs.privateChannelTitle,
        value: this.data.privateChannel.toString(),
        inline: true,
      });
    }

    await this.logChannel.send({ embeds: [embed] });
  }

  protected abstract before?(): Awaitable<void>;

  protected abstract exec(): Awaitable<void>;

  protected abstract after?(): Awaitable<void>;
}
