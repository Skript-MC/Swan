import type { ClientUtil } from 'discord-akairo';

declare module 'discord.js' {
  interface Client {
    util: ClientUtil;
  }
}

// eslint-disable-next-line import/prefer-default-export
export enum ActivityTypes {
  Playing = 'PLAYING',
  Streaming = 'STREAMING',
  Listening = 'LISTENING',
  Watching = 'WATCHING',
  CustomStatus = 'CUSTOM_STATUS',
  Competing = 'COMPETING',
}
