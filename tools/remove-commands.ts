import 'source-map-support/register';
import 'module-alias/register';
import 'dotenv/config';

import { Client, GatewayIntentBits } from 'discord.js';

async function start(): Promise<void> {
  const client = new Client({
    intents: [
      GatewayIntentBits.GuildIntegrations,
    ],
  });
  await client.login(process.env.DISCORD_TOKEN);

  console.log('Removing commands...');
  await client.application.commands.set([]);
  await client.application.commands.set([], process.env.GUILD_ID);
  console.log('Done!');

  await client.destroy();
}
void start();
