/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Command } from 'discord-akairo';
import type {
  TextChannel,
  Message,
  GuildMember,
  User,
} from 'discord.js';

export interface CodeCommandArguments {
  code: string;
}

export interface HelpCommandArguments {
  command: Command;
}

export interface LinksCommandArguments {
  page: number;
}

export interface MoveCommandArguments {
  channel: TextChannel;
  message: Message;
}

export interface PingCommandArguments {}

export interface StatisticsCommandArguments {}

export interface AddonInfoCommandArguments {
  addon: string;
}

export interface UserInfoCommandArguments {
  member: GuildMember;
}

export interface BanCommandArgument {
  member: GuildMember;
  duration: number;
  reason: string;
  autoban: boolean;
}

export interface HistoryCommandArgument {
  member: GuildMember | User | string;
}

export interface KickCommandArgument {
  member: GuildMember;
  reason: string;
}

export interface MuteCommandArgument {
  member: GuildMember;
  duration: number;
  reason: string;
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

export interface UnbanCommandArgument {
  member: GuildMember | User;
  reason: string;
}

export interface UnmuteCommandArgument {
  member: GuildMember;
  reason: string;
}

export interface WarnCommandArgument {
  member: GuildMember;
  reason: string;
}
