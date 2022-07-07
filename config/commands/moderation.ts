import { stripIndent } from 'common-tags';
import type { SwanCommandOptions } from '@/app/types';
import { basePreconditions, staffRolePrecondition } from '@/conf/configUtils';

const commonMessages = {
  creationNotification: (showDuration: boolean): string => stripIndent`
    Bonjour {action.nameString}, tu viens de recevoir une sanction ({action.action}) sur le serveur Skript-MC.
    **Raison :** {action.data.reason}.
    ${showDuration ? '**Durée :** {duration}.' : ''}
    Nous t'invitons à revoir ton comportement pour éviter que cela se reproduise.
    `,
  revocationNotification: stripIndent`
    Bonjour {action.nameString}, ta sanction ({action.originalAction}) sur le serveur Skript-MC a été révoquée.
    **Raison :** {action.data.reason}.
    `,
  notificationUpdate: stripIndent`
    Bonjour {action.nameString}, ta sanction ({action.originalAction}) sur le serveur Skript-MC a été modifiée.
    **Motif :** {action.data.reason}.
    **Changement :** {change}.
    `,
};

export const ban = {
  settings: {
    name: 'Ban',
    category: 'moderation',
    command: 'ban',
    description: 'Applique une restriction du Discord à un membre (= salon des bannis), ou le bannir définitivement.',
    examples: ["ban @WeeskyBDW 3j t'es paumé !", 'ban 1h @Vengelis La vie est dure... -a -p'],
    preconditions: [...basePreconditions, staffRolePrecondition],
  } as SwanCommandOptions,
  messages: {
    notification: commonMessages.creationNotification(true),
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre banni avec succès !',
  },
};

export const hardban = ban;

export const history = {
  settings: {
    name: 'Historique',
    category: 'moderation',
    command: 'history',
    description: "Affiche l'historique des sanctions d'un utilisateur.",
    examples: ['history carlodrift'],
    preconditions: [...basePreconditions, staffRolePrecondition],
  } as SwanCommandOptions,
  messages: {
    sentInDm: "L'historique des sanctions de l'utilisateur t'a bien été envoyé en privé !",
    notFound: "Je n'ai pas pu trouver d'historique correspondant à cet utilisateur !",
    title: "**__Sanctions de l'utilisateur {name}__** ({sanctions.length})",
    overflowTitle: '...et {overflowed} de plus...',
    overflowDescription: "Toutes les sanctions de l'utilisateur n'ont pas pu être affichées. Vous pouvez toutes les consulter sur le [panel de gestion]({url})",
    sanctionsName: {
      hardban: ':bomb: Bannissement définitif',
      ban: ':hammer: Bannissement',
      unban: ':white_check_mark: Débannissement',
      mute: ':mute: Mute',
      unmute: ':loud_sound: Unmute',
      kick: ':door: Expulsion',
      warn: ':warning: Avertissement',
      removeWarn: ":repeat: Suppression d'avertissement",
    },
    overview: stripIndent`
      :bomb: Bannissements définitifs : {stats.hardbans}
      :hammer: Bannissements : {stats.bans}
      :mute: Mutes : {stats.mutes}
      :door: Kicks : {stats.kicks}
      :stop_sign: Avertissements totaux : {stats.warns}
      :warning: Avertissements en cours : {stats.currentWarns}/{warnLimit}`,
    sanctionDescription: {
      title: '**{name}** (`{sanction.sanctionId}`)',
      content: stripIndent`
      __Modérateur :__ <@{sanction.moderator}>
      __Date :__ {date}
      __Raison :__ {sanction.reason}
      `,
      duration: '\n    __Durée :__ {duration}',
      modifications: '    __Modification{plural} :__\n',
      update: '    - {date}, <@{sanction.moderator}> {action} (motif : {update.reason})',
      timeDiff: stripIndent`

        \`\`\`diff
        - {valueBefore}
        + {valueAfter}
        \`\`\`
      `,
    },
    updateReasons: {
      duration: 'a changé la durée',
      revoked: 'a révoqué la sanction',
    },
  },
};

export const kick = {
  settings: {
    name: 'Expulsion',
    category: 'moderation',
    command: 'kick',
    description: 'Expulse un membre du serveur.',
    examples: ['kick tutur Vade retro !'],
    preconditions: [...basePreconditions, staffRolePrecondition],
    permissions: ['Staff'],
  } as SwanCommandOptions,
  messages: {
    notification: commonMessages.creationNotification(false),
    success: 'Membre expulsé avec succès !',
  },
};

export const mute = {
  settings: {
    name: 'Mute',
    category: 'moderation',
    command: 'mute',
    description: 'Applique une restriction de la parole à un membre (= timeout).',
    usage: 'mute <@mention | pseudo | ID> <durée> <raison>',
    examples: ['mute @Xamez chuuuut'],
    preconditions: [...basePreconditions, staffRolePrecondition],
    permissions: ['Staff'],
  } as SwanCommandOptions,
  messages: {
    notification: commonMessages.creationNotification(true),
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre rendu muet avec succès !',
  },
};

export const purge = {
  settings: {
    name: 'Purge',
    category: 'moderation',
    command: 'purge',
    description: "Supprime plusieurs messages d'un salon ou d'un membre en particulier.",
    examples: ['purge 10 -f', 'purge @membre 40'],
    preconditions: [...basePreconditions, staffRolePrecondition],
    permissions: ['Staff'],
  } as SwanCommandOptions,
  messages: {
    success: "J'ai bien supprimé {deletedMessages.size} messages.",
  },
};

export const removeWarn = {
  settings: {
    name: "Suppression d'avertissement",
    category: 'moderation',
    command: 'removewarn',
    description: "Révoque le dernier avertissement d'un membre.",
    examples: ['removewarn noftaly désolé je me suis trompé', 'removewarn @Rémi'],
    preconditions: [...basePreconditions, staffRolePrecondition],
    permissions: ['Staff'],
  } as SwanCommandOptions,
  messages: {
    notification: commonMessages.revocationNotification,
    success: 'Avertissement révoqué avec succès !',
    memberNotFound: "Je n'ai pas réussi à trouver ce membre...",
    notWarned: "Ce membre n'a aucun avertissement en cours.",
    invalidWarnId: "Cet identifiant n'est pas valide. Est-ce bien un avertissement ? N'est-il pas révoqué ?",
  },
};

export const unban = {
  settings: {
    name: 'Unban',
    category: 'moderation',
    command: 'unban',
    description: "Retire une restriction Discord d'un membre, ou le débannir s'il est banni définitivement.",
    examples: ['unban @WeeskyBDW', 'unban @Vengelis désolé !'],
    preconditions: [...basePreconditions, staffRolePrecondition],
    permissions: ['Staff'],
  } as SwanCommandOptions,
  messages: {
    notification: commonMessages.revocationNotification,
    notBanned: "Cet utilisateur n'est pas banni.",
    success: 'Utilisateur débanni avec succès !',
  },
};

export const unmute = {
  settings: {
    name: 'Unmute',
    category: 'moderation',
    command: 'unmute',
    description: "Retire un mute d'un membre du Discord.",
    examples: ['unmute @Vengelis désolé !'],
    preconditions: [...basePreconditions, staffRolePrecondition],
    permissions: ['Staff'],
  } as SwanCommandOptions,
  messages: {
    notification: commonMessages.revocationNotification,
    notMuted: "Cet utilisateur n'est pas muet.",
    success: 'Utilisateur dé-mute avec succès !',
  },
};

export const warn = {
  settings: {
    name: 'Avertissement',
    category: 'moderation',
    command: 'warn',
    description: 'Avertit un membre pour une raison donnée.',
    examples: ["warn @Rémi Il faut penser à respecter le modèle d'aide !"],
    preconditions: [...basePreconditions, staffRolePrecondition],
    permissions: ['Staff'],
  } as SwanCommandOptions,
  messages: {
    notFound: "Aucun membre n'a été trouvé.",
    notification: commonMessages.creationNotification(false),
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre averti avec succès !',
    banSuccess: "C'est le deuxième avertissement pour ce membre, il a donc été banni 4 jours !",
  },
};
