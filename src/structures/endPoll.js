const reactions = {
  yesno: ['✅', '❌'],
  multiple: ['1⃣', '2⃣', '3⃣', '4⃣', '5⃣', '6⃣', '7⃣', '8⃣', '9⃣', '🔟', '🇦', '🇧', '🇨', '🇩', '🇪', '🇫', '🇬', '🇭'],
  basic: ['ℹ', '🛑'],
};

export default async function endPoll(client, db, poll, stopped = false) {
  await db.polls.remove({ id: poll.id });
  const voters = Object.values(poll.votes).map(elt => elt.length).reduce((acc, cur) => acc + cur);

  let results = '';
  if (poll.type === 0) {
    const yes = poll.votes['✅'].length;
    const no = poll.votes['❌'].length;
    results = `:white_check_mark: : ${yes} oui (${Math.round((100 * yes) / voters || 0)}%)\n:x: : ${no} non (${Math.round((100 * no) / voters || 0)}%)`;
  } else if (poll.type === 1) {
    for (let i = 0; i < Object.keys(poll.votes).length; i++) {
      const r = reactions.multiple[i];
      results += `${r} : ${poll.votes[r].length} ${poll.customAnswers[i]} (${(100 * poll.votes[r].length) / voters || 0}%)\n`;
    }
  }
  results += `\n:bust_in_silhouette: : ${voters} votant${voters > 1 ? 's' : ''}.`;

  const channelMessages = client.guild.channels.resolve(poll.channel).messages;
  const message = channelMessages.resolve(poll.id) || await channelMessages.fetch(poll.id);
  if (!message) return;

  const embed = message.embeds[0];
  embed.setColor(client.config.colors.success)
    .setTitle(`Ce vote est fini ! ${stopped ? '*(arrêté)*' : ''}`)
    .addField('Résultats :', results);

  message.reactions.removeAll();
  message.edit(embed);
}
