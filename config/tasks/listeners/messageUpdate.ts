import type { TaskOptions } from '@/app/structures/tasks/Task';

export const checkUpdatedGhostPing = {
  settings: {
    category: 'messageUpdate',
    description: 'Vérifie si une mention a été éditée, et d\'en informer le membre',
  } as TaskOptions,
};

export const logMessageUpdate = {
  settings: {
    category: 'messageUpdate',
    description: 'Enregistre l\'édition d\'un message et son contenu',
  } as TaskOptions,
};
