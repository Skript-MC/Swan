/* eslint-disable import/no-cycle */
import moment from 'moment';
import { MessageEmbed } from 'discord.js';
import ACTION_TYPE from './actionType';
import { db, client } from '../../main';
import { toDuration } from '../../utils';

class ModerationAction {
  constructor(data) {
    this.data = data;
  }

  async commit() {
    const [stop, result, isUpdate] = await this.prepare();
    if (stop) return false;

    await this.before();

    await this.notify(isUpdate);
    await this.exec(result);
    await this.log(isUpdate);

    if (isUpdate) {
      await this.addUpdateToHistory();
      if ([ACTION_TYPE.UNBAN, ACTION_TYPE.UNMUTE, ACTION_TYPE.REMOVE_WARN].includes(this.data.type)) {
        await this.removeFromSanctions(result._id);
      }
    } else {
      await this.addToHistory();
      await this.addToSanctions();
    }

    await this.after();
    return true;
  }

  async prepare() {
    let query = { member: this.data.user.id, type: this.data.type };
    if (this.data.type === ACTION_TYPE.UNBAN) {
      query = {
        member: this.data.user.id,
        $or: [{ type: ACTION_TYPE.BAN }, { type: ACTION_TYPE.HARDBAN }],
      };
    } else if ([ACTION_TYPE.UNMUTE, ACTION_TYPE.REMOVE_WARN].includes(this.data.type)) {
      query = { member: this.data.user.id, type: ACTION_TYPE.opposite(this.data.type) };
    }
    // If it is a warn we don't want to search in the database, because you
    // can have multiple warns at the same time.
    const result = this.data.type !== ACTION_TYPE.WARN
      ? await db.sanctions.findOne(query).catch(console.error)
      : null;
    const isUpdate = !!result;

    let stop = false;
    if (!result && [ACTION_TYPE.UNBAN, ACTION_TYPE.UNMUTE, ACTION_TYPE.REMOVE_WARN].includes(this.data.type)) {
      let message = '';
      if (this.data.type === ACTION_TYPE.UNBAN) message = client.config.messages.commands.unban.notBanned;
      else if (this.data.type === ACTION_TYPE.UNMUTE) message = client.config.messages.commands.unmute.notMuted;
      else if (this.data.type === ACTION_TYPE.REMOVE_WARN) message = client.config.messages.commands.removewarn.alreadyRevoked;
      this.data.messageChannel.sendError(message.replace('%u', this.data.user.username), this.data.moderator);
      stop = true;
    }

    return [stop, result, isUpdate];
  }

  async before() {} // eslint-disable-line

  async notify(isUpdate) {
    if (this.data.silent) return;
    if ([ACTION_TYPE.WARN, ACTION_TYPE.REMOVE_WARN].includes(this.data.type)) return;

    let baseMessage = client.config.messages.miscellaneous.sanctionNotification;
    let { type } = this.data;

    if ([ACTION_TYPE.BAN, ACTION_TYPE.MUTE].includes(this.data.type) && isUpdate) {
      baseMessage = client.config.messages.miscellaneous.sanctionNotificationUpdate;
    } else if ([ACTION_TYPE.UNBAN, ACTION_TYPE.UNMUTE].includes(this.data.type)) {
      baseMessage = client.config.messages.miscellaneous.sanctionNotificationRemoved;
      type = ACTION_TYPE.opposite(this.data.type);
    }

    const notification = baseMessage
      .replace('%u', this.data.user.username)
      .replace('%s', type)
      .replace('%r', this.data.reason)
      .replace('%d', toDuration(this.data.duration));
    await this.data.user.send(notification).catch(() => {});
  }

  async exec(document) {} // eslint-disable-line

  async log(isRenewed) {
    let action;
    if (this.data.type === ACTION_TYPE.BAN && isRenewed) action = 'Modification du bannisseemnt';
    else if (this.data.type === ACTION_TYPE.BAN && !isRenewed) action = 'Bannissement';
    else if (this.data.type === ACTION_TYPE.HARDBAN) action = 'Banissement définitif';
    else if (this.data.type === ACTION_TYPE.MUTE && isRenewed) action = "Modification du mute des channels d'aide";
    else if (this.data.type === ACTION_TYPE.MUTE && !isRenewed) action = "Mute des channels d'aide";
    else if (this.data.type === ACTION_TYPE.KICK) action = 'Expulsion';
    else if (this.data.type === ACTION_TYPE.WARN) action = 'Avertissement';
    else if (this.data.type === ACTION_TYPE.UNBAN) action = 'Débanissement';
    else if (this.data.type === ACTION_TYPE.UNMUTE) action = 'Démute';
    else if (this.data.type === ACTION_TYPE.REMOVE_WARN) action = "Suppression d'avertissement";

    // Création de l'embed
    const embed = new MessageEmbed()
      .setColor(this.data.color)
      .setTitle(`Nouveau cas (${this.data.id})`)
      .setTimestamp()
      .addField(':bust_in_silhouette: Utilisateur', `${this.data.user.toString()}\n${this.data.user.id}`, true)
      .addField(':cop: Modérateur', `${this.data.moderator.toString()}\n${this.data.moderator.id}`, true)
      .addField(':tools: Action', `${action}`, true);

    if (this.data.duration && this.data.duration !== -1 && this.data.type !== ACTION_TYPE.WARN) {
      let content = toDuration(this.data.duration);
      if (this.data.finish && this.data.finish !== -1) {
        content += `\nExpire ${moment(this.data.finish).format('[à] HH:mm:ss [le] DD/MM/YYYY')}`;
      }
      embed.addField(':stopwatch: Durée', content, true);
    }

    embed.addField(':label: Raison', `${this.data.reason}`, true);
    if (this.data.privateChannel) embed.addField(':speech_left: Channel privé', `${this.data.privateChannel.toString()}`, true);

    if (this.data.file) embed.addField(':scroll: Historique des messages', 'Disponible ci-dessous', true);
    else if (this.data.type === ACTION_TYPE.UNBAN) embed.addField(':scroll: Historique des messages', 'Indisponible', true);

    if (this.data.warnId) embed.addField(":hash: ID de l'avertissement", this.data.warnId, true);

    const logChannel = this.data.guild.channels.cache.get(client.config.channels.logs);
    logChannel.send(embed);

    if (this.data.file) {
      logChannel.send({
        files: [{
          attachment: this.data.file.path,
          name: `${this.data.file.name}.txt`,
        }],
      });
    }
  }

  async addToHistory() {
    let result = await db.sanctionsHistory.findOne({ memberId: this.data.user.id }).catch(console.error);

    // Si le membre n'a pas d'historique, on créé un document
    if (!result) {
      result = await db.sanctionsHistory.insert({
        memberId: this.data.user.id,
        sanctions: [],
        lastBanId: null,
        lastMuteId: null,
        count: 0,
        currentWarnCount: 0,
      }).catch(console.error);
    }

    // On ajoute la sanction à l'historique
    const sanction = {
      type: this.data.type,
      modId: this.data.moderator.id,
      date: Date.now(),
      duration: this.data.duration,
      reason: this.data.reason || client.config.messages.errors.noReasonSpecified,
      id: this.data.id,
      updates: [],
    };

    const documentUpdate = {
      $push: { sanctions: sanction },
      $inc: { count: 1 },
    };

    if ([ACTION_TYPE.BAN, ACTION_TYPE.HARDBAN].includes(this.data.type)) {
      documentUpdate.$set = { lastBanId: this.data.id };
    } else if (this.data.type === ACTION_TYPE.MUTE) {
      documentUpdate.$set = { lastMuteId: this.data.id };
    }

    await db.sanctionsHistory.update({ _id: result._id }, documentUpdate).catch(console.error);
  }

  async addUpdateToHistory() {
    const result = await db.sanctionsHistory.findOne({ memberId: this.data.user.id }).catch(console.error);
    const { sanctions } = result;

    let sanctionId;
    let changes;
    switch (this.data.type) {
      case ACTION_TYPE.HARDBAN:
      case ACTION_TYPE.BAN: {
        sanctionId = result.lastBanId;
        changes = { duration: this.data.duration, reason: this.data.reason };
        break;
      }
      case ACTION_TYPE.MUTE: {
        sanctionId = result.lastMuteId;
        changes = { duration: this.data.duration, reason: this.data.reason };
        break;
      }
      case ACTION_TYPE.UNBAN: {
        sanctionId = result.lastBanId;
        changes = { revoked: true, reason: this.data.reason };
        break;
      }
      case ACTION_TYPE.UNMUTE: {
        sanctionId = result.lastMuteId;
        changes = { revoked: true, reason: this.data.reason };
        break;
      }
      case ACTION_TYPE.REMOVE_WARN: {
        sanctionId = this.data.warnId;
        changes = { revoked: true, reason: this.data.reason };
        break;
      }
      default:
        throw new Error(`Unexpected moderation action type. (received "${this.data.type}")`);
    }

    const lastSanction = sanctions.find(elt => elt.id === sanctionId);
    if (!lastSanction) return;

    lastSanction.updates.push({
      date: Date.now(),
      modId: this.data.moderator.id,
      type: this.data.type,
      changes,
    });

    const documentUpdate = { sanctions };
    if (this.data.type === ACTION_TYPE.UNBAN) documentUpdate.lastBanId = null;
    else if (this.data.type === ACTION_TYPE.UNMUTE) documentUpdate.lastMuteId = null;
    else if (this.data.type === ACTION_TYPE.REMOVE_WARN) documentUpdate.currentWarnCount = result.currentWarnCount - 1;
    await db.sanctionsHistory.update({ _id: result._id }, { $set: documentUpdate }).catch(console.error);
  }

  async addToSanctions() {
    await db.sanctions.insert({
      type: this.data.type,
      reason: this.data.reason,
      member: this.data.user.id,
      modId: this.data.moderator.id,
      start: Date.now(),
      duration: this.data.duration || 0,
      finish: this.data.finish,
      hasSentMessages: this.data.type === ACTION_TYPE.BAN ? false : undefined,
      hardbanIfNoMessages: this.data.type === ACTION_TYPE.BAN ? this.data.hardbanIfNoMessages : undefined,
      id: this.data.id,
    }).catch(console.error);
  }

  async removeFromSanctions(id) {
    await db.sanctions.remove({ _id: id }).catch(console.error);
  }

  async after() {} // eslint-disable-line
}

export default ModerationAction;
