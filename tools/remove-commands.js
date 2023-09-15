import 'dotenv/config';
import { Client, GatewayIntentBits } from 'discord.js';

async function start() {
  const client = new Client({
    intents: [
      GatewayIntentBits.GuildIntegrations,
    ],
  });
  await client.login(process.env.DISCORD_TOKEN);

  // Await for the client to be ready.
  await new Promise((resolve) => {
    client.once('ready', () => {
      resolve();
    });
  });

  console.log('Removing commands...');
  await client.application.commands.set([]);
  await client.application.commands.set([], process.env.GUILD_ID);
  console.log('Done!');

  await client.destroy();
}
void start();
