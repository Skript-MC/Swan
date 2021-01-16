import type { AkairoClient } from 'discord-akairo';
import { MessageEmbed } from 'discord.js';
import type { TextChannel } from 'discord.js';
import moment from 'moment';
import pupa from 'pupa';
import messages from '../../../config/messages';
import settings from '../../../config/settings';
import { SanctionTypes } from '../../types';
import { noop } from '../../utils';
import ActionUpdateInformations from '../ActionUpdateInformations';
import ErrorState from '../ErrorState';
import type ModerationData from '../ModerationData';
import ModerationError from '../ModerationError';

abstract class ModerationAction {
  data: ModerationData;
  client: AkairoClient;
  logChannel: TextChannel;

  errorState: ErrorState;
  updateInfos: ActionUpdateInformations;

  constructor(data: ModerationData) {
    this.data = data;
    this.client = this.data.client;
    this.logChannel = this.client.cachedChannels.log;

    this.errorState = new ErrorState(this.client, this.data.channel || this.logChannel);
    this.updateInfos = new ActionUpdateInformations(this.data);
  }

  public async commit(): Promise<boolean> {
    await this.updateInfos.load();

    try {
      await this.before();
      await this.notify();
      await this.exec();
      await this.log();
      await this.after();
    } catch (unknownError: unknown) {
      this.errorState.addError(
        new ModerationError()
          .from(unknownError as Error)
          .setMessage('An error occured while executing a moderation action.')
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
    return pupa(messages.moderation.durationChange, {
      oldDuration: this.formatDuration(this.updateInfos.sanctionDocument.duration),
      newDuration: this.formatDuration(this.data.duration),
    });
  }


  protected get nameString(): string {
    return this.data.victim?.user?.toString() || messages.global.unknownName;
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
    }
  }

  protected get color(): string {
    return settings.moderation.colors[this.data.type];
  }

  protected get expiration(): string {
    return this.data.duration === -1
      ? messages.moderation.never
      : moment(this.data.finish).format(settings.miscellaneous.durationFormat);
  }

  protected async notify(): Promise<void> {
    let message = '';

    message = this.updateInfos.isUpdate()
      ? pupa(this.data.config.notificationUpdate, { action: this, change: this.getFormattedChange() })
      : pupa(this.data.config.notification, { action: this, duration: this.formatDuration(this.data.duration) });

    try {
      await (this.data.victim.member || this.data.victim.user)?.send(message);
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
      .addField(messages.moderation.log.reasonTitle, this.data.reason.toString(), true);

    if (this.data.duration && this.data.type !== SanctionTypes.Warn) {
      let content = this.formatDuration(this.data.duration);
      if (this.data?.finish !== -1)
        content += pupa(messages.moderation.log.durationDescription, { action: this });
      embed.addField(messages.moderation.log.durationTitle, content, true);
    }
    if (this.data.privateChannel)
      embed.addField(messages.moderation.log.privateChannelTitle, this.data.privateChannel.toString(), true);

    await this.logChannel.send(embed);
  }

  protected abstract before(): Promise<void> | void;

  protected abstract exec(): Promise<void>;

  protected abstract after(): Promise<void> | void;
}

export default ModerationAction;
