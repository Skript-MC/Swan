import type { PermissionResolvable } from 'discord.js';
import { Permissions } from 'discord.js';
import type { GuildMessage } from '@/app/types';

export const permissions = Permissions.FLAGS;
export const noPermissions = [] as PermissionResolvable[];
export const hasActiveMemberRole = (message: GuildMessage): string | null => (message.member.roles.cache.has(process.env.ACTIVE_MEMBER_ROLE) ? null : 'No active member role');
export const hasStaffRole = (message: GuildMessage): string | null => (message.member.roles.cache.has(process.env.STAFF_ROLE) ? null : 'No staff role');
