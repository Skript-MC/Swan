/* eslint-disable @typescript-eslint/no-empty-interface */
import type {
  GuildMember,
  GuildTextBasedChannel,
  Role,
  TextChannel,
  User,
} from 'discord.js';
import type SwanCommand from '@/app/structures/commands/SwanCommand';
import type { GuildMessage } from '@/app/types';

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
  displayLines: boolean;
  startLinesAt: number;
  language: string;
}

export interface EightBallCommandArguments {
  question: string;
}

export interface ErrorDetailsCommandArguments {
  query: string;
}

export interface DiscoverCommandArguments {}

export interface DocumentationCommandArguments {
  query: string;
  addon?: string;
  category?: string;
}

export interface HelpCommandArguments {
  command: SwanCommand;
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

export interface LogsCommandArguments {
  channel: TextChannel;
  logged: boolean;
}

export interface ModuleCommandArguments {
  moduleName: string;
  enabled: boolean;
}

export interface MoveCommandArguments {
  targetedChannel: GuildTextBasedChannel;
  targetedMessage: GuildMessage;
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
  destinationChannel: GuildTextBasedChannel;
}

export interface RefreshCommandArgument {}

export interface RemoveWarnCommandArgument {
  warnId: string;
  reason: string;
}

export interface RuleCommandArguments {
  query: string;
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
