import { stripIndent } from 'common-tags';
import { PermissionFlagsBits } from 'discord.js';

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
    Nous t'invitons à revoir ton comportement pour éviter que cela se reproduise.
    `,
  notificationUpdate: stripIndent`
    Bonjour {action.nameString}, ta sanction ({action.originalAction}) sur le serveur Skript-MC a été modifiée.
    **Motif :** {action.data.reason}.
    **Changement :** {change}.
    `,
};

export const tempBan = {
  settings: {
    command: 'Bannissement temporaire',
    description: 'Appliquer un bannissement temporaire à un membre du Discord, créant un salon des bannis.',
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
  },
  messages: {
    notification: commonMessages.creationNotification(true),
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre temporairement banni avec succès !',
  },
};

export const hardban = {
  messages: {
    notification: commonMessages.creationNotification(true),
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre banni avec succès !',
  },
};

export const history = {
  settings: {
    command: 'history',
    description: "Permet de voir l'historique des sanctions d'un utilisateur.",
    defaultMemberPermissions: PermissionFlagsBits.ViewAuditLog,
  },
  messages: {
    sentInDm: "L'historique des sanctions de l'utilisateur t'a bien été envoyé en privé !",
    notFound: "Je n'ai pas pu trouver d'historique correspondant à cet utilisateur !",
    title: "**__Sanctions de l'utilisateur {name}__** ({sanctions.length})",
    overflowTitle: '...et {overflowed} de plus...',
    overflowDescription: "Toutes les sanctions de l'utilisateur n'ont pas pu être affichées. Vous pouvez toutes les consulter sur le [panel de gestion]({url})",
    sanctionsName: {
      hardban: ':bomb: Bannissement définitif',
      tempBan: ':hammer: Bannissement temporaire',
      unban: ':white_check_mark: Débannissement',
      mute: ':mute: Mute',
      unmute: ':loud_sound: Unmute',
      kick: ':door: Expulsion',
      warn: ':warning: Avertissement',
      removeWarn: ":repeat: Suppression d'avertissement",
    },
    overview: stripIndent`
      :bomb: Bannissements définitifs : {stats.hardbans}
      :hammer: Bannissement temporaires : {stats.bans}
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
    command: 'kick',
    description: "Permet d'expulser un membre du serveur.",
    defaultMemberPermissions: PermissionFlagsBits.KickMembers,
  },
  messages: {
    notification: commonMessages.creationNotification(false),
    success: 'Membre expulsé avec succès !',
  },
};

export const mute = {
  messages: {
    notification: commonMessages.creationNotification(true),
    notificationUpdate: commonMessages.notificationUpdate,
  },
};

export const purge = {
  settings: {
    command: 'purge',
    description: "Permet de supprimer plusieurs messages d'un salon ou d'un membre en particulier.",
    defaultMemberPermissions: PermissionFlagsBits.ManageMessages,
  },
  messages: {
    success: "J'ai bien supprimé {deletedMessages.size} messages.",
  },
};

export const removeWarn = {
  settings: {
    command: 'removewarn',
    description: "Permet de révoquer le dernier avertissement d'un membre.",
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  },
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
    command: 'unban',
    description: "Permet de retirer une restriction Discord d'un membre, ou le débannir s'il est banni définitivement.",
    defaultMemberPermissions: PermissionFlagsBits.BanMembers,
  },
  messages: {
    notification: commonMessages.revocationNotification,
    notBanned: "Cet utilisateur n'est pas banni.",
    success: 'Utilisateur débanni avec succès !',
  },
};

export const unmute = {
  messages: {
    notification: commonMessages.revocationNotification,
  },
};

export const warn = {
  settings: {
    command: 'Avertissement',
    description: "Permet d'avertir un membre pour une raison donnée.",
    defaultMemberPermissions: PermissionFlagsBits.ModerateMembers,
  },
  messages: {
    notFound: "Aucun membre n'a été trouvé.",
    notification: commonMessages.creationNotification(false),
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre averti avec succès !',
    banSuccess: "C'est le deuxième avertissement pour ce membre, il a donc été banni 4 jours !",
  },
};
