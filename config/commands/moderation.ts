import { stripIndent } from 'common-tags';
import { hasStaffRole, permissions } from '@/conf/configUtils';

const see = (where: string): string => `Voir [la documentation](https://github.com/Skript-MC/Swan/wiki/Modération#${where}) pour plus d'informations.`;

const commonMessages = {
  promptStartMember: 'Il faut ajouter un membre qui doit être présent sur le Discord. Tu peux le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en envoyant un message contenant seulement le membre :',
  promptRetryMember: "Ce membre n'est pas valide, il se peut qu'il ne soit pas sur le Discord ou que tu aies fait une faute de frappe. Tu peux le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en envoyant un message contenant seulement le membre :",

  promptStartDuration: `Il faut ajouter une durée (en anglais ou en francais). Tu peux par exemple entrer \`1s\` pour 1 seconde, \`1min\` pour 1 minute et \`1j\` pour 1 jour. Tu peux également combiner ces durées ensemble : \`10j15min300s\` est par exemple une durée valide. ${see('durée')} Entre-la en envoyant un message contenant seulement la durée :`,
  promptRetryDuration: `Cette durée n'est pas valide. Tu peux par exemple entrer \`1s\` pour 1 seconde, \`1min\` pour 1 minute et \`1j\` pour 1 jour. Tu peux également combiner ces durées ensemble : \`10j15min300s\` est par exemple une durée valide. ${see('durée')} Entre-la en envoyant un message contenant seulement la durée :`,

  promptStartReason: 'Il faut ajouter une raison à la sanction. Entre-la en envoyant un message contenant seulement la raison :',
  promptRetryReason: "Cette raison n'est pas valide. Entre-la en envoyant un message contenant seulement la raison :",

  creationNotification: stripIndent`
    Bonjour {action.nameString}, tu viens de recevoir une sanction ({action.action}) sur le serveur Skript-MC.
    **Raison :** {action.data.reason}.
    **Durée :** {duration}.
    Nous t'invitons à revoir ton comportement pour éviter que cela se reproduise.
    `,
  revocationNotification: stripIndent`
    Bonjour {action.nameString}, ta sanction ({action.action}) sur le serveur Skript-MC a été révoquée.
    **Raison :** {action.data.reason}.
    Nous t'invitons à revoir ton comportement pour éviter que cela se reproduise.
    `,
  notificationUpdate: stripIndent`
    Bonjour {action.nameString}, ta sanction ({action.action}) sur le serveur Skript-MC a été modifiée.
    **Motif :** {action.data.reason}.
    **Changement :** {change}.
    `,
};

export const ban = {
  settings: {
    aliases: ['ban', 'sdb'],
    clientPermissions: permissions.SEND_MESSAGES
      | permissions.MANAGE_MESSAGES
      | permissions.BAN_MEMBERS
      | permissions.MANAGE_CHANNELS
      | permissions.MANAGE_ROLES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Ban',
    content: `Appliquer une restriction du Discord à un membre (= salon des bannis (SDB)), ou le bannir définitivement. Entre une durée pour un SDB, ou \`def\` pour un bannissement permanent. Utilise le drapeau \`--autoban\` (\`-a\`) pour automatiquement bannir le membre à la fin de la sanction s'il n'a écrit aucun message. Utilisez le drapeau \`--purge\` (\`-p\`) pour supprimer les messages postés par le membre dans les 7 derniers jours. ${see('bannissement')}`,
    usage: 'ban <@mention | pseudo | ID> <durée> <raison> [--autoban] [--purge]',
    examples: ["ban @WeeskyBDW 3j t'es paumé !", 'ban 1h @Vengelis La vie est dure... -a -p'],
    permissions: 'Staff',
  },
  messages: {
    notification: commonMessages.creationNotification,
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre banni avec succès !',
    promptStartMember: commonMessages.promptStartMember,
    promptRetryMember: commonMessages.promptRetryMember,
    promptStartDuration: commonMessages.promptStartDuration,
    promptRetryDuration: commonMessages.promptRetryDuration,
    promptStartReason: commonMessages.promptStartReason,
    promptRetryReason: commonMessages.promptRetryReason,
  },
};

export const hardban = ban;

export const history = {
  settings: {
    aliases: ['history', 'historique'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Historique',
    content: "Permet de voir l'__historique des sanctions__ d'un utilisateur.",
    usage: 'history <@mention | pseudo | ID>',
    examples: ['history carlodrift'],
    permissions: 'Staff',
  },
  messages: {
    sentInDm: "L'historique des sanctions de l'utilisateur t'a bien été envoyé en privé !",
    promptStartUser: "Il faut ajouter un utilisateur. Tu peux le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en envoyant un message contenant seulement l'utilisateur :",
    promptRetryUser: "Cet utilisateur n'est pas valide, il se peut que tu aies fait une faute de frappe. Tu peux le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en envoyant un message contenant seulement l'utilisateur :",
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
    aliases: ['kick'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.KICK_MEMBERS,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Expulsion',
    content: `Permet d'__expulser un membre__ du serveur. ${see('kick')}`,
    usage: 'kick <@mention | pseudo | ID> <raison>',
    examples: ['kick tutur Vade retro !'],
    permissions: 'Staff',
  },
  messages: {
    notification: commonMessages.creationNotification,
    success: 'Membre expulsé avec succès !',
    promptStartMember: commonMessages.promptStartMember,
    promptRetryMember: commonMessages.promptRetryMember,
    promptStartReason: commonMessages.promptStartReason,
    promptRetryReason: commonMessages.promptRetryReason,
  },
};

export const mute = {
  settings: {
    aliases: ['mute'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_ROLES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Mute',
    content: `Appliquer une __restriction de la parole__ à un membre (= interdiction de parler dans les salons d'aide). ${see('mute')}`,
    usage: 'mute <@mention | pseudo | ID> <durée> <raison>',
    examples: ['mute @Xamez chuuuut'],
    permissions: 'Staff',
  },
  messages: {
    notification: commonMessages.creationNotification,
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre rendu muet avec succès !',
    promptStartMember: commonMessages.promptStartMember,
    promptRetryMember: commonMessages.promptRetryMember,
    promptStartDuration: commonMessages.promptStartDuration,
    promptRetryDuration: commonMessages.promptRetryDuration,
    promptStartReason: commonMessages.promptStartReason,
    promptRetryReason: commonMessages.promptRetryReason,
  },
};

export const purge = {
  settings: {
    aliases: ['purge'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_MESSAGES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Purge',
    content: "Permet de __supprimer plusieurs messages__ à la fois dans un salon, avec la possibilité de spécifier un membre en particulier. Il n'est possible que de supprimer des messages ayant été envoyés il y a __moins de 15 jours__ : c'est une limitation de Discord. Par défaut, les messages des membres du staff ne seront pas inclus. Si tu veux aussi supprimer les messages du staff, ajoute le drapeau `--force` (ou `-f`).",
    usage: 'purge <nombre> [<@mention | pseudo | ID>] [--force | -f]',
    examples: ['purge 10 -f', 'purge @membre 40'],
    permissions: 'Staff',
  },
  messages: {
    startPrompt: 'Entre un nombre de message à supprimer.',
    retryPrompt: "Ce montant n'est pas valide. Entre-le en envoyant un message contenant seulement un nombre :",
    success: "J'ai bien supprimé {deletedMessages.size} messages.",
  },
};

export const removeWarn = {
  settings: {
    aliases: ['remove-warn', 'remove_warn', 'unwarn', 'dewarn'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: "Suppression d'avertissement",
    content: `Permet de __révoquer le dernier avertissement__ d'un membre. ${see('mise-à-jour-annulation')}`,
    usage: 'removewarn <@mention | pseudo | ID> [raison]',
    examples: ['removewarn noftaly désolé je me suis trompé', 'removewarn @Rémi'],
    permissions: 'Staff',
  },
  messages: {
    notification: commonMessages.revocationNotification,
    success: 'Avertissement révoqué avec succès !',
    notWarned: "Ce membre n'a aucun avertissement en cours.",
    promptStartMember: commonMessages.promptStartMember,
    promptRetryMember: commonMessages.promptRetryMember,
  },
};

export const unban = {
  settings: {
    aliases: ['unban', 'deban'],
    clientPermissions: permissions.SEND_MESSAGES
      | permissions.MANAGE_CHANNELS
      | permissions.MANAGE_ROLES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Unban',
    content: `Permet de __retirer une restriction du Discord__ à un membre, ou le débannir s'il est banni définitivement. ${see('annulation')}`,
    usage: 'unban <@mention | pseudo | ID> [raison]',
    examples: ['unban @WeeskyBDW', 'unban @Vengelis désolé !'],
    permissions: 'Staff',
  },
  messages: {
    notification: commonMessages.revocationNotification,
    notBanned: "Cet utilisateur n'est pas banni.",
    success: 'Utilisateur débanni avec succès !',
    promptStartMember: commonMessages.promptStartMember,
    promptRetryMember: commonMessages.promptRetryMember,
  },
};

export const unmute = {
  settings: {
    aliases: ['unmute', 'demute'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_ROLES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Unmute',
    content: `Permet de __retirer un mute__ à un membre du Discord. ${see('annulation-1')}`,
    usage: 'unmute <@mention | pseudo | ID> [raison]',
    examples: ['unmute @Vengelis désolé !'],
    permissions: 'Staff',
  },
  messages: {
    notification: commonMessages.revocationNotification,
    notMuted: "Cet utilisateur n'est pas muet.",
    success: 'Utilisateur dé-mute avec succès !',
    promptStartMember: commonMessages.promptStartMember,
    promptRetryMember: commonMessages.promptRetryMember,
  },
};

export const warn = {
  settings: {
    aliases: ['warn'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: hasStaffRole,
  },
  details: {
    name: 'Avertissement',
    content: `Permet d'__avertir un membre__ pour une raison donnée. Au bout de 2 avertissements, le membre sera banni pendant 4 jours. Les avertissements expirent au bout d'un mois. ${see('warn')}`,
    usage: 'warn <@mention | pseudo | ID> <raison>',
    examples: ["warn @Rémi Il faut penser à respecter le modèle d'aide !"],
    permissions: 'Staff',
  },
  messages: {
    notification: commonMessages.creationNotification,
    notificationUpdate: commonMessages.notificationUpdate,
    success: 'Membre averti avec succès !',
    banSuccess: "C'est le deuxième avertissement pour ce membre, il a donc été banni 4 jours !",
    promptStartMember: commonMessages.promptStartMember,
    promptRetryMember: commonMessages.promptRetryMember,
    promptStartReason: commonMessages.promptStartReason,
    promptRetryReason: commonMessages.promptRetryReason,
  },
};
