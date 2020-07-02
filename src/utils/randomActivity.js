function randomCommand(commands, withoutPerms = true) {
  for (;;) {
    const command = commands[Math.floor(Math.random() * commands.length)];
    if (withoutPerms && command.permissions.length === 0) return command.aliases[0].toLowerCase();
  }
}

export default function randomActivity(client, commands, prefix) {
  if (!client.activated) return { activity: { name: 'Désactivé.', type: 'WATCHING' }, status: 'idle' };
  const random = Math.floor(Math.random() * 3);
  let status;
  if (random === 0) status = { activity: { name: `${client.guild.members.cache.filter(m => !m.user.bot).size} membres 🎉`, type: 'WATCHING' }, status: 'online' };
  if (random === 1) status = { activity: { name: `${prefix}aide | Skript-MC`, type: 'WATCHING' }, status: 'online' };
  if (random === 2) status = { activity: { name: `${prefix}help ${randomCommand(commands)}`, type: 'PLAYING' }, status: 'dnd' };
  return status;
}
