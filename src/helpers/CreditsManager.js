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
   * Désactivé pour le moment (le temps qu'on trouve les rewards)
   * @param {GuildMember} member
   * @param {Number} amount
   */
  static addToMember(member, amount) {
    return;
    if (amount === 0) return;

    db.credits.update(
      { member: member.id },
      { $inc: { credits: amount } },
      { upsert: true, returnUpdatedDocs: true },
      (err, _num, doc) => {
        if (err) console.error(err);

        const previousAmount = doc.credits - amount;
        const currentAmount = doc.credits;
        for (const milestone of MILESTONES) {
          if (previousAmount < milestone && currentAmount >= milestone) {
            this.giveReward(member, currentAmount, MILESTONES.indexOf(milestone));
          }
        }
      },
    );
  }

  /**
   * Enlever des crédits à un membre
   * @param {GuildMember} member
   * @param {Number} amount
   */
  static removeFromMember(guildMember, amount) {
    const member = guildMember.id;
    db.credits.findOne({ member }, async (err, doc) => {
      if (err) console.error(err);

      // Et la on met à jour sa somme de crédit.
      const currentCredits = doc ? doc.credits : 0;
      const newCredits = currentCredits - amount;
      const options = { upsert: true };
      db.credits.update({ member }, { $set: { credits: newCredits } }, options, err2 => console.error(err2));
    });
  }

  static async setMemberCredits(member, amount) {
    const done = await new Promise((resolve, reject) => {
      db.credits.update(
        { member },
        { $set: { credits: amount } },
        { upsert: true },
        (err) => {
          if (err) return reject(err);
          return resolve(true);
        },
      );
    }).catch(console.error);
    return done || false;
  }

  static async getMemberCredits(member) {
    const amount = await new Promise((resolve, reject) => {
      db.credits.findOne({ member: member.user.id }, (err, doc) => {
        if (err) return reject(err);
        return resolve(doc ? doc.credits : 0);
      });
    }).catch(console.error);
    return amount;
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
