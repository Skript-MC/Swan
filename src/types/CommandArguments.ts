/* eslint-disable @typescript-eslint/no-empty-interface */
import type { Command } from 'discord-akairo';
import type {
  GuildMember,
  Role,
  TextChannel,
  User,
} from 'discord.js';
import type { GuildMessage } from './index';


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
  purge: boolean;
}

export interface CodeCommandArguments {
  code: string;
  displayLines?: boolean;
  startLinesAt?: string;
  language?: string;
}

export interface EightBallCommandArguments {
  question: string;
}

export interface ErrorDetailsCommandArguments {
  error: string;
}

export interface DiscoverCommandArguments {}

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

export interface IdeaCommandArguments {}

export interface JokeCommandArguments {
  jokeName: string;
}

export interface KickCommandArgument {
  member: GuildMember; reason: string;
}

export interface LatexCommandArguments {
  equation: string;
}

export interface LinksCommandArguments {
  page: number;
}

export interface ModuleCommandArguments {
  moduleName: string;
  enabled: string;
}

export interface MoveCommandArguments {
  channel: TextChannel;
  message: GuildMessage;
}

export interface MuteCommandArgument {
  member: GuildMember; duration: number; reason: string;
}

export interface PingCommandArguments {}

export interface PollCommandArguments {
  duration: number;
  answers: string[];
  anonymous: boolean;
  multiple: boolean;
}
export interface PurgeCommandArgument {
  amount: number;
  member: GuildMember;
  force: boolean;
}

export interface ReactionRoleCommandArguments {
  givenRole: Role;
  reaction: string;
  destinationChannel: TextChannel;
}

export interface RefreshCommandArgument {}

export interface RemoveWarnCommandArgument {
  warnId: string;
  reason: string;
}

export interface RuleCommandArguments {
  rule: string;
}

export interface ServerInfoCommandArguments {
  server: string;
}

export interface SkriptInfoCommandArguments {
  display: 'all' | 'dl' | 'download' | 'link' | 'links';
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
