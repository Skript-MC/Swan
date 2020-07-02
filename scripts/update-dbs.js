import Datastore from 'nedb-promises';
import { uid } from '../src/utils';

function isRevoked(sanctionsArray, sanction) {
  const doc = sanctionsArray.find(elt => elt.date === sanction.date);
  const index = sanctionsArray.indexOf(doc);
  const after = sanctionsArray.slice(index + 1);

  for (const sanc of after) {
    if (sanc.type === `un${sanction.type}`) {
      return { found: true, explicit: true, sanction: sanc };
    }
    if (sanc.type === sanction.type) {
      return { found: true, explicit: false };
    }
  }
  return { found: false };
}

function formatUpdate(update) {
  return {
    date: update?.date || Date.now(),
    modId: update?.modId || '205963594658086912', // Swan's ID
    type: update.type,
    changes: {
      revoked: true,
      reason: update?.reason || 'Inconnue',
    },
  };
}

function getIdFromSanction(sanctionsDb, sanction) {
  const result = sanctionsDb.find(elt => elt.start === sanction.date);
  return result || uid();
}

function getLastSanctionId(sanctionsArray, type) {
  const reversedSanctions = sanctionsArray.reverse();
  for (const sanction of reversedSanctions) {
    if (sanction.type === `un${type}`) return null;
    if (sanction.type === type) return sanction.id;
  }
  return null;
}

(async () => {
  // Update "sanctions" and "sanctionsHistory" databases for Moderation v2
  const sanctionsHistory = Datastore.create('./databases/test/sanctionsHistory.db');
  await sanctionsHistory.load().catch((err) => { throw err; });
  const currentSanctions = Datastore.create('./databases/test/sanctions.db');
  await currentSanctions.load().catch((err) => { throw err; });

  const histories = await sanctionsHistory.find({});
  const sanctions = await currentSanctions.find({});
  const updatedSanctions = [];
  const updatedHistories = [];

  // Update "sanctions" database
  for (const sanction of sanctions) {
    // Check if it uses the old format (no ID)
    if (!sanction.id) {
      const update = {
        $set: {
          type: sanction.sanction,
          modId: sanction.modid,
          duration: sanction.duration * 1000,
          hasSentMessages: sanction.type === 'ban' ? true : undefined,
          id: uid(),
        },
        $unset: {
          sanction: true,
          modid: true,
        },
      };

      updatedSanctions.push(currentSanctions.update({ _id: sanction._id }, update).catch(console.error));
    }
  }

  await Promise.all(updatedSanctions).catch(console.error);

  for (const history of histories) {
    // Check if it uses the old format (no ID)
    if (!history.id) {
      // Rename mod into modId, and add the "id" and "revoked" fields
      const newSanctions = history.sanctions
        .map(({ mod, ...keep }) => ({
          ...keep,
          modId: mod,
          _tmp_revoked: isRevoked(history.sanctions, keep),
          id: getIdFromSanction(updatedSanctions, keep),
        }));

      // Add the updates
      for (let i = 0; i < newSanctions.length; i++) {
        const updates = [];
        if (newSanctions[i]._tmp_revoked.found) {
          const update = newSanctions[i]._tmp_revoked.explicit ? newSanctions[i]._tmp_revoked.sanction : { type: `un${newSanctions[i].type}` };
          const formattedUpdate = formatUpdate(update);
          updates.push(formattedUpdate);

          // We remove the update (as it is now in the array)
          if (newSanctions[i]._tmp_revoked.explicit) {
            const doc = newSanctions.find(elt => elt.date === newSanctions[i]._tmp_revoked.sanction.date);
            const index = newSanctions.indexOf(doc);
            newSanctions.splice(index, 1);
          }
          newSanctions[i].revoked = true;
        }
        if (!newSanctions[i]) continue;
        delete newSanctions[i]._tmp_revoked;
        newSanctions[i].updates = updates;
      }

      const updatedDoc = {
        $set: {
          memberId: history.memberId,
          sanctions: newSanctions,
          lastBanId: getLastSanctionId(newSanctions, 'ban'),
          lastMuteId: getLastSanctionId(newSanctions, 'mute'),
          count: newSanctions.length,
          currentWarnCount: history.currentWarnCount,
        },
      };

      updatedHistories.push(sanctionsHistory.update({ _id: history._id }, updatedDoc).catch(console.error));
    }
  }

  await Promise.all(updatedHistories).catch(console.error);

  const sanctionsHistory2 = Datastore.create('./databases/test/sanctionsHistory.db');
  await sanctionsHistory2.load().catch((err) => { throw err; });
  const currentSanctions2 = Datastore.create('./databases/test/sanctions.db');
  await currentSanctions2.load().catch((err) => { throw err; });

  const updatedDocs = updatedSanctions.concat(updatedHistories);

  if (updatedDocs.length > 0) {
    console.log(updatedDocs.length, '"sanctionsHistory" and "sanctions" documents have been updated to the latest format (Moderation v2)');
    console.log("You can know fix them up by hand. (yeah sorry but i can't really do better.");
  } else {
    console.log('Every document was up to date');
  }
})();
