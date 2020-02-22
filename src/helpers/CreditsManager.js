/* eslint-disable import/no-cycle */
import { db, config } from '../main';

const MILESTONES = [
  10,
  1000,
  5000,
  10000,
  50000,
  100000,
  500000,
  1000000,
];

class CreditsManager {
  /**
   * Ajouter des crédits à un membre
   * @param {GuildMember} member
   * @param {Number} amount
   */
  static async addToMember(member, amount) {
    return;
    // eslint-disable-next-line no-unreachable, no-useless-return
    if (amount === 0) return;

    const doc = await db.credits.update(
      { member: member.id },
      { $inc: { credits: amount } },
      { upsert: true, returnUpdatedDocs: true, multi: false },
    ).catch(console.error);

    const previousAmount = doc.credits - amount;
    const currentAmount = doc.credits;
    for (const milestone of MILESTONES) {
      if (previousAmount < milestone && currentAmount >= milestone) {
        this.giveReward(member, currentAmount, MILESTONES.indexOf(milestone));
      }
    }
  }

  /**
   * Enlever des crédits à un membre
   * @param {GuildMember} member
   * @param {Number} amount
   */
  static async removeFromMember(guildMember, amount) {
    const member = guildMember.id;
    const doc = await db.credits.findOne({ member }).catch(console.error);
    // Et la on met à jour sa somme de crédit.
    const currentCredits = doc ? doc.credits : 0;
    const newCredits = currentCredits - amount;
    await db.credits.update(
      { member },
      { $set: { credits: newCredits } },
      { upsert: true },
    ).catch(console.error);
  }

  static async setMemberCredits(member, amount) {
    const done = await db.credits.update(
      { member },
      { $set: { credits: amount } },
      { upsert: true, returnUpdatedDocs: true, multi: false },
    ).catch(console.error);
    return !!done || false;
  }

  static async getMemberCredits(member) {
    const doc = await db.credits.findOne({ member: member.user.id }).catch(console.error);
    return doc ? doc.credits : 0;
  }

  static giveReward(member, amount, reward) {
    // eslint-disable-next-line default-case
    switch (reward) {
      case 0:
        member.send(
          config.messages.miscellaneous.creditsFirstReward
            .replace('%s', member.nickname || member.user.username)
            .replace('%d', amount),
        );
        break;
      case 1:
        member.send(
          config.messages.miscellaneous.creditsReward
            .replace('%s', member.nickname || member.user.username)
            .replace('%d', amount)
            .replace('%r', 'Pas encore défini'),
        );
        break;
    }
  }
}

export default CreditsManager;
