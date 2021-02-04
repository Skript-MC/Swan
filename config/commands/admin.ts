import { Permissions } from 'discord.js';
import type { PermissionResolvable } from 'discord.js';

const permissions = Permissions.FLAGS;

// eslint-disable-next-line import/prefer-default-export
export const refresh = {
  settings: {
    aliases: ['refresh'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [] as PermissionResolvable[],
  },
  details: {
    name: 'Rafraîchir le cache',
    content: 'Permet de rafraîchir le cache de Swan en re-fetchant les bases de données.',
    usage: 'refresh',
    examples: ['refresh'],
  },
  messages: {
    success: ':white_check_mark: Le cache a été rafraîchit avec succès !',
  },
};
