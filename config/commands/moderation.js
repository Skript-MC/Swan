import { stripIndent } from 'common-tags';
import { Permissions } from 'discord.js';

const permissions = Permissions.FLAGS;

const hasStaffRole = message => (message.member.roles.cache.has(process.env.STAFF_ROLE) ? null : 'No staff role');

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
  description: {
    name: 'Ban',
    content: "Appliquer une restriction du Discord à un membre (= salon des bannis (SDB)), ou le bannir définitivement. Entrer une durée pour un SDB, ou `def` pour un bannissement permanent. Utilisez le drapeau `--autoban` (`-a`) pour automatiquement bannir le membre à la fin de la sanction s'il n'a écrit aucun message.",
    usage: 'ban <@mention | pseudo | ID> <durée> <raison> [--autoban]',
    examples: ["ban @WeeskyBDW 3j t'es paumé !", 'ban 1h @Vengelis La vie est dure...'],
    permissions: 'Staff',
  },
  messages: {
    notification: 'Bonjour {MEMBER}, tu viens de recevoir une sanction ({SANCTION}) sur le serveur Skript-MC.\n**Raison :** {REASON}.\n**Durée :** {DURATION}.\nNous t\'invitons à revoir ton comportement pour éviter que cela se reproduise.',
    success: 'Membre banni avec succès !',
    promptStartMember: 'Il faut ajouter un membre. Il doit être présent sur le discord. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement le membre :',
    promptRetryMember: "Ce membre n'est pas valide, il se peut qu'il ne soit pas sur le discord ou que vous ayez fait une faute de frappe. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement le membre :",
    promptStartDuration: 'Il faut ajouter une durée (en anglais ou en francais). Vous pouvez par exemple entrer `1s` pour 1 seconde, `1min` pour 1 minute et `1j` pour 1 jour. Vous pouvez également combiner ces durées ensemble : `10j15min300s` est par exemple une durée valide. Entre-la en postant un message contenant seulement la durée :',
    promptRetryDuration: "Cette durée n'est pas valide.. Vous pouvez par exemple entrer `1s` pour 1 seconde, `1min` pour 1 minute et `1j` pour 1 jour. Vous pouvez également combiner ces durées ensemble : `10j15min300s` est par exemple une durée valide. Entre-la en postant un message contenant seulement la durée :",
    promptStartReason: 'Il faut ajouter une raison à la sanction. Entre-la en postant un message contenant seulement la raison :',
    promptRetryReason: "Cette raison n'est pas valide.  Entre-la en postant un message contenant seulement la raison :",
  },
};

// TODO: Either leave it as it is now, or remove this extra const and improve the
// configuration-detection in ModerationData#setType
export const hardban = ban;

export const history = {
  settings: {
    aliases: ['history', 'historique'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: hasStaffRole,
  },
  description: {
    name: 'Historique',
    content: "Permet de voir l'historique des sanctions d'un utilisateur.",
    usage: 'history <@mention | pseudo | ID>',
    examples: ['history carlodrift'],
    permissions: 'Staff',
  },
  messages: {
    sentInDm: "L'historique des sanctions de l'utilisateur vous a bien été envoyé en privé !",
    promptStartUser: "Il faut ajouter un utilisateur. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement l'utilisateur :",
    promptRetryUser: "Cet utilisateur n'est pas valide, il se peut que vous ayez fait une faute de frappe. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement l'utilisateur :",
    notFound: "Je n'est pas pu trouver d'historique correspondant à cet utilisateur !",
    title: "**__SANCTION DE L'UTILISATEUR {NAME}__** (*{COUNT}*)\n\n",
    sanctionsName: {
      hardban: ':bomb: Bannissement définitif',
      ban: ':hammer: Bannissement',
      unban: ':white_check_mark: Débannissement',
      mute: ':mute: Mute',
      unmute: ':loud_sound: Unmute',
      kick: ':door: Expulsion',
      warn: ':warning: Avertissement',
      unwarn: ":repeat: Suppression d'Avertissement",
    },
    overview: stripIndent`
      :bomb: Bannissements définitifs : {HARDBANS}
      :hammer: Bannissements : {BANS}
      :mute: Mutes : {MUTES}
      :door: Kicks : {KICKS}
      :stop_sign: Avertissements totaux : {WARNS}
      :warning: Avertissements en cours : {CURRENT_WARNS}/{WARN_LIMIT}`,
    updateReasons: {
      duration: 'a changé la durée',
      reason: 'a changé la raison',
      revoked: 'a révoqué la sanction',
    },
    sanctionDescription: {
      main: stripIndent`
        ━━━━━━━━━━━━━━━

        **{NAME}** (\`{ID}\`)
            __Modérateur :__ <@{MODERATOR}>
            __Date :__ {DATE}
            __Raison :__ {REASON}
      `,
      duration: '\n    __Durée :__ {DURATION}',
      modifications: '    __Modification{PLURAL} :__\n',
    },
  },
};

export const kick = {
  settings: {
    aliases: ['kick'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.KICK_MEMBERS,
    userPermissions: hasStaffRole,
  },
  description: {
    name: 'Expulsion',
    content: "Permet d'expulser un membre du serveur..",
    usage: 'kick <@mention | pseudo | ID> <raison>',
    examples: ['kick Gonpvp'],
    permissions: 'Staff',
  },
  messages: {
    notification: 'Bonjour {MEMBER}, tu viens de recevoir une sanction ({SANCTION}) sur le serveur Skript-MC.\n**Raison :** {REASON}.\nNous t\'invitons à revoir ton comportement pour éviter que cela se reproduise.',
    success: 'Membre expulsé avec succès !',
    promptStartMember: 'Il faut ajouter un membre. Il doit être présent sur le discord. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement le membre :',
    promptRetryMember: "Ce membre n'est pas valide, il se peut qu'il ne soit pas sur le discord ou que vous ayez fait une faute de frappe. Vous pouvez le mentionner, entrer son identifiant discord, ou simplement son pseudo. Entre-le en postant un message contenant seulement le membre :",
    promptStartReason: 'Il faut ajouter une raison à la sanction. Entre-la en postant un message contenant seulement la raison :',
    promptRetryReason: "Cette raison n'est pas valide.  Entre-la en postant un message contenant seulement la raison :",
  },
};

export const purge = {
  settings: {
    aliases: ['purge'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_MESSAGES,
    userPermissions: hasStaffRole,
  },
  description: {
    name: 'Purge',
    content: "Permet de __supprimer plusieurs messages à la fois__ dans un salon, avec la possibilité de spécifier un membre en particulier. Il n'est possible que de supprimer des messages ayant été envoyés il y a __moins de 15 jours__ : c'est une limitation de discord. Par défaut, les messages des membres du staff ne seront pas inclus. Si vous voulez aussi supprimer les messages du Staff, ajoutez le drapeau `--force` (ou `-f`)",
    usage: 'purge <nombre> [<@mention | pseudo | ID>] [--force | -f]',
    examples: ['purge 10 -f', 'purge @membre 40'],
    permissions: 'Staff',
  },
  messages: {
    startPrompt: 'Entrez un nombre de message à supprimer.',
    retryPrompt: 'Montant invalide.',
    success: "J'ai bien supprimé {AMOUNT} messages.",
  },
};

export const unban = {
  settings: {
    aliases: ['unban', 'deban'],
    clientPermissions: permissions.SEND_MESSAGES
      | permissions.MANAGE_MESSAGES
      | permissions.BAN_MEMBERS
      | permissions.MANAGE_CHANNELS
      | permissions.MANAGE_ROLES,
    userPermissions: hasStaffRole,
  },
  description: {
    name: 'Unban',
    content: 'Retirer une restriction du Discord à un membre, ou le débannir.',
    usage: 'unban <@mention | pseudo | ID> [raison]',
    examples: ['unban @WeeskyBDW', 'unban @Vengelis désolé !'],
    permissions: 'Staff',
  },
  messages: {
    notification: "Bonjour {MEMBER}, ta sanction (bannissement) sur le serveur Skript-MC à été révoquée. Raison : \"%r\". Nous t'invitons a revoir ton comportement pour éviter que cela se reproduise.",
    notBanned: "Cet utilisateur n'est pas banni.",
    success: 'Utilisateur débanni avec succès !',
  },
};
