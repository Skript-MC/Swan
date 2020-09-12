import SwanClient from './SwanClient';

require('dotenv').config();

const client = new SwanClient();
client.login(process.env.DISCORD_TOKEN);
