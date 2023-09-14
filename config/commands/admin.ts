import { PermissionFlagsBits } from 'discord.js';

export const logs = {
  settings: {
    command: 'logs',
    description: "Permet d'activer ou de désactiver la sauvegarde des messages de certains salons.",
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  },
  messages: {
    noChannelFound: ":x: Aucun salon n'a été trouvé. Vérifiez que vous l'avez correctement mentionné et essayez de rafraîchir le cache.",
    loggingStatus: 'Actuellement, la sauvegarde des messages dans ce salon est {status}.',
    success: 'La sauvegarde des messages de ce salon a bien été {status}.',
    on: 'activée :white_check_mark:',
    off: 'désactivée :x:',
  },
} as const;

export const module = {
  settings: {
    command: 'module',
    description: "Permet d'activer ou de désactiver certains modules de Swan.",
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  },
  messages: {
    embed: {
      title: 'Consultez la liste des modules sur Swan Dashboard',
      link: 'https://swan.skript-mc.fr/modules',
      content: "Vous pouvez consulter la liste des modules et modifier leurs états simplement depuis Swan Dashboard. Vous pouvez aussi directement utiliser Swan pour modifier l'état d'un de ces modules, via la commande `.module <nom> <on|off>`.",
    },
    noModuleFound: ":x: Aucun module avec ce nom n'a été trouvé. Rendez-vous sur https://swan.skript-mc.fr/modules pour consulter la liste des modules.",
    status: 'Actuellement, le module "{name}" est {status}.',
    on: 'activé :white_check_mark:',
    off: 'désactivé :x:',
    cannotBeDisabled: ':x: Ce module ne peut pas être désactivé.',
    success: 'Le module a bien été {status}.',
    confirmationPrompt: 'Êtes-vous sûr de désactiver ce module ? Il ne pourra être réactivé que depuis le panel.',
  },
} as const;

export const runTask = {
  settings: {
    command: 'run-task',
    description: "Permet d'exécuter immédiatement une tâche de Swan.",
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  },
  messages: {
    unknownTask: ':x: Je ne connais pas cette tâche.',
    taskError: ":x: Une erreur est survenue lors de l'exécution de la tâche.",
    success: ':white_check_mark: Opération effectuée avec succès !',
  },
} as const;

export const reactionRole = {
  settings: {
    command: 'reactionrole',
    description: 'Permet de créer un nouvel espace de reaction role.',
    defaultMemberPermissions: PermissionFlagsBits.ManageRoles,
  },
  messages: {
    success: "L'espace de RoleReaction a bien été créé. :white_check_mark:",
    embed: {
      title: 'Obtenir le rôle {givenRole.name}',
      content: 'Cliquez sur la réaction {reaction} pour obtenir le rôle {givenRole}',
      footer: {
        icon: 'https://raw.githubusercontent.com/Skript-MC/Swan/01f67192c18107a2f9a47beb4f7a082ac63696be/assets/logo.png',
        text: 'Skript-MC',
      },
    },
    notEnoughPermissions: "Erreur ! Je n'ai pas la permission d'agir sur un rôle aussi puissant !",
    invalidEmoji: "Je n'arrive pas à récupérer cet emoji...",
    invalidRole: "Je n'arrive pas à récupérer ce rôle...",
  },
} as const;
