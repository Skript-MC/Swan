import dotenv from 'dotenv';
import SwanClient from './SwanClient';

dotenv.config();

const client = new SwanClient();
client.login(process.env.DISCORD_TOKEN);
