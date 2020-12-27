import type { Message, NewsChannel, TextChannel } from 'discord.js';

export type GuildTextBasedChannel = TextChannel | NewsChannel;

// Enforces that message.channel is a TextChannel or NewsChannel, not a DMChannel.
export type GuildMessage = { channel: GuildTextBasedChannel } & Message;
