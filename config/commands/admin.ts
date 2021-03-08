import { hasActiveMemberRole, hasStaffRole, permissions } from '@/conf/configUtils';

export const refresh = {
  settings: {
    aliases: ['refresh'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: hasActiveMemberRole,
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

export const reactionRole = {
  settings: {
    aliases: ['reactionrole', 'rr'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Reaction Roles',
    content: 'Permet de créer un nouvel espace de ReactionRole.',
    usage: 'reactionrole <@mention du role | ID du role> [Émoji pour obtenir le role | --default] [ID du role nécessaire | --noperm] [ID du salon ou poster le message | --here]',
    examples: ['reactionrole 818086544593518593 :tada: --noperm #annonces'],
    permissions: 'Staff',
  },
  embed: {
    title: 'Obtenir le role {0}',
    content: 'Cliquez sur la réaction {0} pour obtenir le role {1}',
    color: 4_886_754,
    footer: {
      icon: 'https://skript-mc.fr/assets/images/favicon.png',
      text: 'Skript-MC',
    },
  },
  messages: {
    error: 'Une erreur est survenue lors de l\'ajout de ce ReactionRole. Erreur: {0}',
    promptStart: 'Merci de saisir le role à donner. (Mentionner le role ou donner l\'ID.)',
    promptRetry: 'Erreur ! Role invalide. Merci de réessayer !',
  },
};
