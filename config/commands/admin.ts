import { stripIndent } from 'common-tags';
import { Rules } from '@/app/types';
import { basePreconditions, channelRulesPrecondition, staffRolePrecondition } from '@/conf/configUtils';

export const logs = {
  settings: {
    name: 'Gérer les sauvegardes de messages',
    aliases: ['logs'],
    description: "Permet d'activer ou de désactiver la sauvegarde des messages de certains salons.",
    usage: 'logs <#salon> <on|off>',
    examples: ['logs #bot on'],
    preconditions: [...basePreconditions, staffRolePrecondition, channelRulesPrecondition(Rules.NoHelpChannel)],
    permissions: ['Staff'],
  },
  messages: {
    noChannelFound: ":x: Aucun salon n'a été trouvé. Vérifiez que vous l'avez correctement mentionné et essayez de rafraîchir le cache.",
    noStatus: ":x: Vous n'avez pas spécifié le statut à définir. Utilisez plutôt : `.logs {swanChannel.channelId} <on|off>`.",
    success: ':white_check_mark: La sauvegarde des messages de ce salon a bien été {status}.',
  },
};

export const module = {
  settings: {
    name: 'Modifier les modules',
    aliases: ['module'],
    description: "Permet d'activer ou de désactiver certains modules de Swan.",
    usage: 'module <nom module> <on|off>',
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
    success: ':white_check_mark: Le module a bien été {status}.',
  },
};

export const refresh = {
  settings: {
    name: 'Rafraîchir le cache',
    aliases: ['refresh'],
    description: 'Permet de rafraîchir le cache de Swan en re-fetchant les bases de données.',
    usage: 'refresh',
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
    aliases: ['reactionrole', 'rr'],
    description: stripIndent`
      Permet de créer un nouvel espace de **ReactionRole**.
      Les membres pourront s'auto-attribuer un rôle, en ajoutant une réaction à un message de Swan.
      L'ordre des arguments n'importe pas : il faut simplement que le rôle soit toujours spécifié.
      Pour supprimer un Reaction Role, il suffit de supprimer le message correspondant !
    `,
    usage: 'reactionrole <@rôle | nom | ID> [émoji | --default] [#salon | ID salon | --here]',
    examples: [
      'reactionrole 818086544593518593 :tada: #annonces',
      'reactionrole @Events --default 818126792257830932',
      'reactionrole 818086544593518593 :oui: --here',
    ],
    preconditions: [...basePreconditions, staffRolePrecondition, channelRulesPrecondition(Rules.NoHelpChannel)],
    permissions: ['Staff'],
  },
  messages: {
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
