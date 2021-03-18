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
    clientPermissions: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Reaction Roles',
    content: `Permet de créer un nouvel espace de **ReactionRole**.
    Les membres pourront s'auto-attribuer un rôle, en ajoutant une réaction à un message de Swan.
    L'ordre des arguments n'importe pas : il faut simplement que le rôle soit toujours spécifié.
    Pour supprimer un Reaction Role, il suffit de supprimer le message correspondant !`,
    usage: 'reactionrole <@rôle | nom | ID> [émoji | --default] [#salon | ID salon | --here]',
    examples: [
      'reactionrole 818086544593518593 :tada: #annonces',
      'reactionrole @Events --default 818126792257830932',
      'reactionrole 818086544593518593 :oui: --here',
    ],
    permissions: 'Staff',
  },
  embed: {
    title: 'Obtenir le rôle {givenRole.name}',
    content: 'Cliquez sur la réaction {reaction} pour obtenir le rôle {givenRole}',
    footer: {
      icon: 'https://skript-mc.fr/assets/images/favicon.png',
      text: 'Skript-MC',
    },
  },
  messages: {
    promptStart: 'Saisis le rôle à attribuer (mentionne le rôle ou donne son ID).',
    promptRetry: 'Erreur ! Rôle invalide. Réessaye en mentionnant le rôle ou en donnant son ID :',
    notEnoughPermissions: "Erreur ! Je n'ai pas la permission d'agir sur un rôle aussi puissant !",
  },
};
