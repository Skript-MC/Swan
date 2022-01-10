import { EmbedLimits } from '@sapphire/discord-utilities';
import type { SapphireClient } from '@sapphire/framework';
import { container } from '@sapphire/pieces';
import type { Awaitable } from '@sapphire/utilities';
import { Formatters, MessageEmbed } from 'discord.js';
import type { GuildTextBasedChannel, HexColorString } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import ActionUpdateInformations from '@/app/moderation/ActionUpdateInformations';
import ErrorState from '@/app/moderation/ErrorState';
import type ModerationData from '@/app/moderation/ModerationData';
import ModerationError from '@/app/moderation/ModerationError';
import { SanctionTypes } from '@/app/types';
import { noop, trimText } from '@/app/utils';
import messages from '@/conf/messages';
import settings from '@/conf/settings';

export default abstract class ModerationAction {
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

  protected get nameString(): string {
    return this.data.victim?.user?.toString() ?? messages.global.unknownName;
  }

  protected get moderatorString(): string {
    return this.data.moderator.toString() || messages.global.unknownName;
  }

  protected get action(): string {
    switch (this.data.type) {
      case SanctionTypes.Ban:
        if (this.updateInfos.isUpdate())
          return messages.moderation.sanctionNames.banUpdate;
        return messages.moderation.sanctionNames.ban;
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
      case SanctionTypes.Ban:
        if (this.updateInfos.isUpdate())
          return messages.moderation.sanctionNames.ban;
        return this.action;
      case SanctionTypes.Mute:
        if (this.updateInfos.isUpdate())
          return messages.moderation.sanctionNames.mute;
        return this.action;
      case SanctionTypes.Unban:
        return messages.moderation.sanctionNames.ban;
      case SanctionTypes.Unmute:
        return messages.moderation.sanctionNames.mute;
      case SanctionTypes.RemoveWarn:
        return messages.moderation.sanctionNames.warn;
      default:
        return this.action;
    }
  }

  protected get color(): HexColorString {
    return settings.moderation.colors[this.data.type];
  }

  protected async notify(): Promise<void> {
    const message = this.updateInfos.isUpdate()
      ? pupa(this.data.config.notificationUpdate, { action: this, change: this.getFormattedChange() })
      : pupa(this.data.config.notification, { action: this, duration: this.formatDuration(this.data.duration) });

    try {
      await (this.data.victim.member ?? this.data.victim.user)?.send(message);
    } catch {
      await this.data.channel.send(messages.moderation.memberHasClosedDm).catch(noop);
    }
  }

  protected async log(): Promise<void> {
    if (!this.logChannel)
      return;

    const embed = new MessageEmbed()
      .setColor(this.color)
      .setTitle(pupa(messages.moderation.newCase, { action: this }))
      .setTimestamp()
      .addField(messages.moderation.log.userTitle, `${this.nameString}\n${this.data.victim.id}`, true)
      .addField(messages.moderation.log.moderatorTitle, `${this.moderatorString}\n${this.data.moderator.id}`, true)
      .addField(messages.moderation.log.actionTitle, this.action.toString(), true)
      .addField(
        messages.moderation.log.reasonTitle,
        trimText(this.data.reason.toString(), EmbedLimits.MaximumFieldValueLength),
        true,
      );

    if (this.data.duration && this.data.type !== SanctionTypes.Warn) {
      let content = this.formatDuration(this.data.duration);
      if (this.data?.finish !== -1) {
        content += pupa(messages.moderation.log.durationDescription, {
          expiration: Formatters.time(Math.round(this.data.finish / 1000), Formatters.TimestampStyles.LongDateTime),
        });
      }
      embed.addField(messages.moderation.log.durationTitle, content, true);
    }
    if (this.data.privateChannel)
      embed.addField(messages.moderation.log.privateChannelTitle, this.data.privateChannel.toString(), true);

    if (this.data.file)
      embed.addField(messages.moderation.log.banlogTitle, messages.moderation.log.banlogAvailableDescription, true);
    else if (this.data.type === SanctionTypes.Unban && this.updateInfos.sanctionDocument?.duration !== -1)
      embed.addField(messages.moderation.log.banlogTitle, messages.moderation.log.banlogUnavailableDescription, true);

    await this.logChannel.send({ embeds: [embed] });

    if (this.data.file) {
      await this.logChannel.send({
        files: [{
          attachment: this.data.file.path,
          name: `${this.data.file.name}.txt`,
        }],
      });
    }
  }

  protected abstract before?(): Awaitable<void>;

  protected abstract exec(): Awaitable<void>;

  protected abstract after?(): Awaitable<void>;
}
