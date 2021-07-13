import type { PreconditionEntryResolvable } from '@sapphire/framework';

export const basePreconditions = [
  'GuildOnly',
  {
    name: 'NotRole',
    context: { role: process.env.BAN_ROLE },
  },
  'NotLoading',
];

export const staffRolePrecondition = {
  name: 'Role',
  context: { role: process.env.STAFF_ROLE },
};

export const activeMemberRolePrecondition = {
  name: 'Role',
  context: { role: process.env.ACTIVE_MEMBER_ROLE },
};

export const channelRulesPrecondition = (rules: number): PreconditionEntryResolvable => ({
  name: 'ChannelRules',
  context: { rules },
});
