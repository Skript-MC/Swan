import type { TaskOptions } from '@/app/structures/tasks/Task';

export const poll = {
  settings: {
    category: 'messageReactionAdd',
    description: 'Ajoute le vote d\'un membre à un vote',
  } as TaskOptions,
};

export const reactionRole = {
  settings: {
    category: 'messageReactionAdd',
    description: 'Ajoute le rôle du rôle de réaction au membre',
  } as TaskOptions,
};
