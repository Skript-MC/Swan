/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Command } from 'discord-akairo';
import type {
  GuildMember,
  Message,
  TextChannel,
  User,
} from 'discord.js';


export interface AddonInfoCommandArguments {
  addon: string;
}

export interface AddonPackCommandArguments {
  version: string;
}

export interface AutoMessageCommandArguments {
  message: string;
}

export interface BanCommandArgument {
  member: GuildMember;
  duration: number;
  reason: string;
  autoban: boolean;
}

export interface CodeCommandArguments {
  code: string;
}

export interface ErrorDetailsCommandArguments {
  error: string;
}

export interface DocumentationCommandArguments {
  query: string;
  addon?: string;
  category?: string;
}

export interface HelpCommandArguments {
  command: Command;
}

export interface HistoryCommandArgument {
  member: GuildMember | User | string;
}

export interface KickCommandArgument {
  member: GuildMember; reason: string;
}

export interface LinksCommandArguments {
  page: number;
}

export interface MoveCommandArguments {
  channel: TextChannel;
  message: Message;
}

export interface MuteCommandArgument {
  member: GuildMember; duration: number; reason: string;
}

export interface PingCommandArguments {}

export interface PollCommandArguments {
  duration: number;
  content: string;
  anonymous: boolean;
  multiple: boolean;
}
export interface PurgeCommandArgument {
  amount: number;
  member: GuildMember;
  force: boolean;
}

export interface RemoveWarnCommandArgument {
  member: GuildMember;
  reason: string;
}

export interface StatisticsCommandArguments {}

export interface UnbanCommandArgument {
  member: GuildMember | User;
  reason: string;
}

export interface UnmuteCommandArgument {
  member: GuildMember;
  reason: string;
}

export interface UserInfoCommandArguments {
  member: GuildMember;
}

export interface WarnCommandArgument {
  member: GuildMember;
  reason: string;
}
