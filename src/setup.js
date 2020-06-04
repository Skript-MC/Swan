/* eslint-disable import/no-dynamic-require */
import axios from 'axios';
import Datastore from 'nedb-promises';

export async function loadSkriptHubAPI(client) {
  const options = {
    method: 'GET',
    headers: {
      Authorization: `Token ${process.env.SKRIPTHUB_API}`,
    },
  };
  const syntaxes = [];

  await axios(`${client.config.apis.syntax}/syntax/`, options)
    .then((response) => {
      for (const syntax of response.data) syntaxes[syntax.id] = syntax;
    }).catch(console.error);

  await axios(`${client.config.apis.syntax}/syntaxexample/`, options)
    .then((response) => {
      for (const example of response.data) {
        if (syntaxes[example.syntax_element]) {
          syntaxes[example.syntax_element].example = example;
        }
      }
    }).catch(console.error);

  client.logger.step('SkriptHub : api loaded!');
  return syntaxes;
}

export async function loadSkripttoolsAddons(client) {
  let addons = [];

  const allAddons = await axios(client.config.apis.addons)
    .then(response => (response ? response.data.data : undefined))
    .catch(console.error);
  if (typeof allAddons === 'undefined') return client.logger.error(`Unable to retrieve informations from ${client.config.apis.addons}`);

  for (const addon of Object.keys(allAddons)) {
    const versions = allAddons[addon];
    // Cas rare (que 1 addon, mais ca lance une erreur et empêche de charger les autres addons, alors il vaut mieux l'éviter)
    if (!versions) continue;

    const latest = versions[versions.length - 1];
    addons.push(axios(`${client.config.apis.addons}${latest}`)
      .then(response => response.data.data)
      .catch(console.error));
  }
  addons = await Promise.all(addons);
  client.logger.step('Skripttools : addons loaded!');
  return addons;
}

export function loadDatabases(client) {
  const databases = {};
  const databasesNames = [
    // Store all current sanctions
    'sanctions',
    // Store all sanctions history
    'sanctionsHistory',
    // Store all blacklisted musics and channels
    'musics',
    // Store all music stats
    'musicsStats',
    // Store all commands stats
    'commandsStats',
    // Jokes stats
    'jokes',
    // Polls objects
    'polls',
    // Miscellaneous
    'miscellaneous',
  ];
  for (const db of databasesNames) {
    databases[db] = Datastore.create(`./databases/${db}.db`);
    databases[db].load()
      .then(() => client.logger.step(`Databases : "${db}.db" loaded!`))
      .catch(console.error);
    databases[db].on('__error__', (datastore, event, error, ...args) => {
      client.logger.error(`Database ${db} generated the following error (${event}). Arguments: ${args}`);
      console.error(error);
    });
  }

  return databases;
}
