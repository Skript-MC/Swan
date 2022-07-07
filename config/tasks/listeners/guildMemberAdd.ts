import type { TaskOptions } from '@/app/structures/tasks/Task';

export const normalizeMemberUsername = {
  settings: {
    category: 'guildMemberAdd',
    description: 'Permet de renommer les membres en utilisant un nom valide',
  } as TaskOptions,
};

export const welcomeMember = {
  settings: {
    category: 'guildMemberAdd',
    description: 'Permet d\'envoyer un message de bienvenue au nouveau membre',
  } as TaskOptions,
};
