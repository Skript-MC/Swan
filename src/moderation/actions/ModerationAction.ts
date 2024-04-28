import { EmbedLimits } from '@sapphire/discord-utilities';
import type { SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import type { HexColorString } from 'discord.js';
import {
  EmbedBuilder,
  TimestampStyles,
  time as timeFormatter,
  userMention,
} from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import * as messages from '#config/messages';
import { channels, moderation } from '#config/settings';
import { ActionUpdateInformations } from '#moderation/ActionUpdateInformations';
import { ErrorState } from '#moderation/ErrorState';
import type { ModerationData } from '#moderation/ModerationData';
import { ModerationError } from '#moderation/ModerationError';
import * as ModerationHelper from '#moderation/ModerationHelper';
import { SanctionTypes } from '#types/index';
import { noop, nullop, trimText } from '#utils/index';

export abstract class ModerationAction {
  public data: ModerationData;
  public client: SapphireClient;

  public errorState: ErrorState;
  public updateInfos: ActionUpdateInformations;

  constructor(data: ModerationData) {
    this.data = data;
    this.client = container.client;

    this.errorState = new ErrorState();
    this.updateInfos = new ActionUpdateInformations(this.data);
  }

  protected get nameString(): string {
    return userMention(this.data.victimId);
  }

  protected get moderatorString(): string {
    return userMention(this.data.moderatorId);
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
        throw new Error(
          `Received unexpected moderation type: ${this.data.type}`,
        );
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
      await this.errorState.log();
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
    const oldDuration = this.updateInfos.sanctionDocument?.duration;
    const newDuration = this.data.duration;
    return pupa(messages.moderation.durationChange, {
      oldDuration: oldDuration
        ? this.formatDuration(oldDuration)
        : messages.global.unknown(true),
      newDuration: newDuration
        ? this.formatDuration(newDuration)
        : messages.global.unknown(true),
    });
  }

  protected async notify(): Promise<void> {
    const message = this.updateInfos.isUpdate()
      ? pupa(this.data.config.notificationUpdate, {
          action: this,
          change: this.getFormattedChange(),
        })
      : pupa(this.data.config.notification, {
          action: this,
          duration: this.formatDuration(this.data.duration),
        });

    try {
      // If the sanction is a temporary ban, we should notify the victim in his private thread.
      // We should only notify the victim if the sanction is an update.
      if (this.data.type === SanctionTypes.TempBan) {
        const thread = await ModerationHelper.getThread(this.data);
        if (thread.isThread()) await thread.send(message);
      } else {
        const victim =
          (await container.client.guild.members
            .fetch(this.data.victimId)
            .catch(nullop)) ??
          (await container.client.users
            .fetch(this.data.victimId)
            .catch(nullop));
        await victim?.send(message).catch(noop);
      }
    } catch {
      await this.data.channel?.send(messages.moderation.memberHasClosedDm);
    }
  }

  protected async log(): Promise<void> {
    const channel = await container.client.guild.channels.fetch(
      channels.sanctionLog,
    );
    if (!channel || !channel.isTextBased()) return;

    const embedMsgs = messages.moderation.log;

    const embed = new EmbedBuilder()
      .setColor(this.color)
      .setTitle(pupa(messages.moderation.newCase, { action: this }))
      .setTimestamp()
      .addFields(
        {
          name: embedMsgs.userTitle,
          value: `${this.nameString}\n${this.data.victimId}`,
          inline: true,
        },
        {
          name: embedMsgs.moderatorTitle,
          value: `${this.moderatorString}\n${this.data.moderatorId}`,
          inline: true,
        },
        {
          name: embedMsgs.actionTitle,
          value: this.action.toString(),
          inline: true,
        },
        {
          name: embedMsgs.reasonTitle,
          value: trimText(
            this.data.reason.toString(),
            EmbedLimits.MaximumFieldValueLength,
          ),
          inline: true,
        },
      );

    if (this.data.duration && this.data.type !== SanctionTypes.Warn) {
      let content = this.formatDuration(this.data.duration);
      if (this.data?.finish !== -1) {
        content += pupa(embedMsgs.durationDescription, {
          expiration: timeFormatter(
            Math.round(this.data.finish / 1000),
            TimestampStyles.LongDateTime,
          ),
        });
      }
      embed.addFields({
        name: embedMsgs.durationTitle,
        value: content,
        inline: true,
      });
    }

    await channel.send({ embeds: [embed] });
  }

  protected abstract before?(): Awaitable<void>;

  protected abstract exec(): Awaitable<void>;

  protected abstract after?(): Awaitable<void>;
}
