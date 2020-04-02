import Datastore from 'nedb-promises';

(async () => {
  // Update sanctionsHistory database
  const sanctionsHistory = Datastore.create('./databases/sanctionsHistory.db');
  await sanctionsHistory.load().catch((err) => { throw err; });

  const histories = await sanctionsHistory.find({});
  const updatedDocs = [];
  for (const history of histories) {
    if (!history.revokedWarns) {
      updatedDocs.push(sanctionsHistory.update({ _id: history._id }, { $set: { revokedWarns: [] } }));
    }
  }

  if (updatedDocs.length > 0) {
    await Promise.all(updatedDocs).catch((err) => { throw err; });
    console.log(updatedDocs.length, '"sanctionsHistory" databases have been updated to the latest document format (added revokedWarns)');
  } else {
    console.log('Evert document of "sanctionsHistory" was up to date');
  }
})();
