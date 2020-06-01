/**
 * Créé un "message séléecteur"; va envoyer un message à l'utilisateur pour qu'il choisisse parmis plusieurs options
 * @param {Client} client - Le client
 * @param {Array} results - L'array que l'on doit ittérer
 * @param {string} query - La recherche de l'utilisateur (simplement un args.join(' '))
 * @param {Message} message - Le message de l'utilisateur
 * @param {Object} cmdConfig - La config de la commande (simplement un this.config)
 * @param {Function} messageCallback - Le callback pour afficher chaque ligne
 * @param {Function} callback - Le callback quand l'utilisateur à fais son choix
 */
export default async function selectorMessage(client, results, query, message, cmdConfig, messageCallback, callback) {
  const reactionsNumbers = ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟'];
  let content = cmdConfig.searchResults.replace('%r', results.length).replace('%s', query);

  const elementNumber = results.length > 10 ? 10 : results.length;
  for (let i = 0; i < elementNumber; i++) content += `\n${reactionsNumbers[i]} ${messageCallback(results[i])}`;

  if (results.length - 10 > 0) content += `\n...et ${results.length - 10} de plus...`;
  const botMessage = await message.channel.send(content);

  for (let i = 0; i < elementNumber; i++) await botMessage.react(reactionsNumbers[i]);
  await botMessage.react('❌');

  const collectorNumbers = botMessage
    .createReactionCollector((reaction, user) => !user.bot
      && user.id === message.author.id
      && reactionsNumbers.includes(reaction.emoji.name))
    .once('collect', (reaction) => {
      botMessage.delete();
      callback(client.config, message, results[reactionsNumbers.indexOf(reaction.emoji.name)], cmdConfig);
      collectorNumbers.stop();
    });

  const collectorStop = botMessage
    .createReactionCollector((reaction, user) => !user.bot
      && user.id === message.author.id
      && reaction.emoji.name === '❌')
    .once('collect', () => {
      message.delete();
      botMessage.delete();
      collectorNumbers.stop();
      collectorStop.stop();
    });
}
