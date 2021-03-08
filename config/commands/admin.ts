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
    Les membres pourront s'auto attribuer un rôle, en ajoutant une réaction à un message du bot.

    __**Flags:**__
    • \`--default\`: Garder l'émoji par défaut, celui défini dans la config.
    • \`--here\`: Demander au bot d'envoyer le message dans le salon où est saisie la commande.

    Pour supprimer un Reaction Role, il suffit de supprimer le message du bot correspondant !

    `,
    usage: 'reactionrole <@mention du rôle | ID du rôle> [Émoji pour obtenir le rôle | --default] [ID du salon ou poster le message | --here]',
    examples: ['reactionrole 818086544593518593 :tada: #annonces'],
    permissions: 'Staff',
  },
  embed: {
    title: 'Obtenir le rôle {givenRole.name}',
    content: 'Cliquez sur la réaction {emoji} pour obtenir le rôle {givenRole}',
    footer: {
      icon: 'https://skript-mc.fr/assets/images/favicon.png',
      text: 'Skript-MC',
    },
  },
  messages: {
    promptStart: 'Saisit le rôle à donner. (mentionne le rôle ou donne l\'ID).',
    promptRetry: 'Erreur ! Rôle invalide. Réessaye en mentionnant le rôle ou en donnant un ID :',
  },
};
