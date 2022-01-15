import { stripIndent } from 'common-tags';
import { Rules } from '@/app/types';
import { basePreconditions, channelRulesPrecondition, staffRolePrecondition } from '@/conf/configUtils';

export const logs = {
  settings: {
    name: 'Gérer les sauvegardes de messages',
    command: 'logs',
    description: "Permet d'activer ou de désactiver la sauvegarde des messages de certains salons.",
    examples: ['logs #bot on'],
    preconditions: [...basePreconditions, staffRolePrecondition, channelRulesPrecondition(Rules.NoHelpChannel)],
    permissions: ['Staff'],
  },
  messages: {
    noChannelFound: ":x: Aucun salon n'a été trouvé. Vérifiez que vous l'avez correctement mentionné et essayez de rafraîchir le cache.",
    loggingStatus: 'Actuellement, la sauvegarde des messages dans ce salon est {status}.',
    success: 'La sauvegarde des messages de ce salon a bien été {status}.',
    on: 'activée :white_check_mark:',
    off: 'désactivée :x:',
  },
};

export const module = {
  settings: {
    name: 'Modifier les modules',
    command: 'module',
    description: "Permet d'activer ou de désactiver certains modules de Swan.",
    examples: ['module skriptReleases off'],
    preconditions: [...basePreconditions, staffRolePrecondition, channelRulesPrecondition(Rules.NoHelpChannel)],
    permissions: ['Staff'],
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
};

export const refresh = {
  settings: {
    name: 'Rafraîchir le cache',
    command: 'refresh',
    description: 'Permet de rafraîchir le cache de Swan en re-fetchant les bases de données.',
    examples: ['refresh'],
    preconditions: [...basePreconditions, staffRolePrecondition, channelRulesPrecondition(Rules.NoHelpChannel)],
    permissions: ['Staff'],
  },
  messages: {
    success: ':white_check_mark: Le cache a été rafraîchi avec succès !',
  },
};

export const reactionRole = {
  settings: {
    name: 'Reaction Roles',
    command: 'reactionRole',
    description: 'Permet de créer un nouvel espace de reaction role.',
    examples: [
      'reactionrole 818086544593518593 :tada: #annonces',
      'reactionrole @Events default 818126792257830932',
      'reactionrole 818086544593518593 :oui:',
    ],
    preconditions: [...basePreconditions, staffRolePrecondition, channelRulesPrecondition(Rules.NoHelpChannel)],
    permissions: ['Staff'],
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
  },
};
