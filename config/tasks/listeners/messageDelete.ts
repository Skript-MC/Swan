import type { TaskOptions } from '@/app/structures/tasks/Task';

export const checkDeletedGhostPing = {
  settings: {
    category: 'messageDelete',
    description: 'Vérifie si une mention a été supprimée, et d\'en informer le membre',
  } as TaskOptions,
};

export const logMessageDeletion = {
  settings: {
    category: 'messageDelete',
    description: 'Enregistre la suppression d\'un message et son contenu',
  } as TaskOptions,
};
