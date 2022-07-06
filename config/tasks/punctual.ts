import type { TaskOptions } from '@/app/structures/tasks/Task';

export const forceRefreshPieces = {
  settings: {
    description: 'Permet de recréer tous les modules de Swan en base de données',
  } as TaskOptions,
};

export const stop = {
  settings: {
    description: 'Permet de stopper Swan et terminer son processus (et de le redémarrer si l\'environnement de production le permet)',
  } as TaskOptions,
};
