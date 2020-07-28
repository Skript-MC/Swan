import ModerationData from './ModerationData';
import ACTION_TYPE from './actions/actionType';
import BanAction from './actions/BanAction';
import UnbanAction from './actions/UnbanAction';
import UnmuteAction from './actions/UnmuteAction';
import RemoveWarnAction from './actions/RemoveWarnAction';
import endPoll from './endPoll';

class DatabaseChecker {
  static async checkSanctions(client, db) {
    const messageChannel = client.guild.channels.resolve(client.config.channels.logs);
    // Trouver tous les élements dont la propriété "finish" est inférieure ($lt) à maintenant et ($and) la durée
    // ("duration") n'est pas égale ($not) à -1 (= ban def)
    const query = {
      $and: [
        { finish: { $lt: Date.now() } },
        { $not: { duration: -1 } }],
    };
    const results = await db.sanctions.find(query).catch(console.error);

    for (const result of results) {
      const victim = client.guild.members.cache.get(result.member) || await client.users.fetch(result.member);

      const data = new ModerationData()
        .setType(ACTION_TYPE.opposite(result.type))
        .setColor(client.config.colors.success)
        .setReason(client.config.messages.miscellaneous.sanctionExpired)
        .setModerator(client.guild.members.resolve(client.user.id))
        .setMessageChannel(messageChannel);
      await data.setVictimId(victim.id);

      if (!victim) {
        if (result.type === ACTION_TYPE.BAN) {
          // Si on ne retrouve pas la victime alors qu'elle était bannie (sdb), alors elle doit être bannie
          // (= elle a quitté/on l'a banni pendant que le bot était offline)
          messageChannel.sendError(client.config.messages.errors.assumeBanned);
          await data.setVictimId(result.member);
          data.setType(ACTION_TYPE.HARDBAN);
          data.setColor(client.config.colors.hardban);
          data.setReason(client.config.messages.miscellaneous.hardBanAutomatic);
          data.setDuration(-1);

          new BanAction(data).commit();
        }
        continue;
      }

      if (result.type === ACTION_TYPE.BAN && !result.hasSentMessages && result.hardbanIfNoMessages) {
        data.setType(ACTION_TYPE.HARDBAN)
          .setColor(client.config.colors.hardban)
          .setReason(client.config.messages.miscellaneous.inactivityWhileBanned)
          .setDuration(-1)
          .setFinishTimestamp();
        new BanAction(data).commit();
        continue;
      }

      if (data.type === ACTION_TYPE.UNBAN) new UnbanAction(data).commit();
      else if (data.type === ACTION_TYPE.UNMUTE) new UnmuteAction(data).commit();
      else if (data.type === ACTION_TYPE.REMOVE_WARN) {
        data.setWarnId(result.id);
        new RemoveWarnAction(data).commit();
      }
    }
  }

  static async checkPolls(client, db) {
    const polls = await db.polls.find({ finish: { $lt: Date.now() } }).catch(console.error);
    for (const poll of polls) endPoll(client, db, poll);
  }
}

export default DatabaseChecker;
