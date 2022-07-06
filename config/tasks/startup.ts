import type { TaskOptions } from '@/app/structures/tasks/Task';

export const cacheChannels = {
  settings: {
    description: 'Met à jour le cache de salons de Swan',
    category: 'startup',
    startupOrder: 6,
  } as TaskOptions,
};

export const cachePolls = {
  settings: {
    description: 'Met à jour le cache des sondages de Swan',
    category: 'startup',
    startupOrder: 7,
  } as TaskOptions,
};

export const cacheReactionRoles = {
  settings: {
    description: 'Met à jour le cache des espaces de réaction de rôle de Swan',
    category: 'startup',
    startupOrder: 8,
  } as TaskOptions,
};

export const checkValidity = {
  settings: {
    description: 'Vérifie que la configuration et l\'environnement de Swan sont corrects',
    category: 'startup',
    startupOrder: 11,
  } as TaskOptions,
};

export const fetchMissingBans = {
  settings: {
    description: 'Récupère les bannissements qui n\'ont pas été traités par Swan jusqu\'à présent',
    category: 'startup',
    startupOrder: 9,
  } as TaskOptions,
};

export const loadCommandStats = {
  settings: {
    description: 'Charge les statistiques des commandes de Swan',
    category: 'startup',
    startupOrder: 2,
  } as TaskOptions,
};

export const loadPolls = {
  settings: {
    description: 'Charge les sondages de Swan',
    category: 'startup',
    startupOrder: 1,
  } as TaskOptions,
};

export const loadReactionRoles = {
  settings: {
    description: 'Charge les espaces de réaction de rôle de Swan',
    category: 'startup',
    startupOrder: 3,
  } as TaskOptions,
};

export const loadSkriptMcSyntaxes = {
  settings: {
    description: 'Récupère les syntaxes de la documentation de Skript-MC',
    category: 'startup',
    startupOrder: 5,
  } as TaskOptions,
};

export const loadSkriptToolsAddons = {
  settings: {
    description: 'Récupère les addons de SkriptTools',
    category: 'startup',
    startupOrder: 4,
  } as TaskOptions,
};

export const syncDatabaseChannels = {
  settings: {
    description: 'Synchronise les salons de Swan avec la base de données',
    category: 'startup',
    startupOrder: 10,
  } as TaskOptions,
};
