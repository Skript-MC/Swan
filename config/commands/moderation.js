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
  },
};

// TODO: Either leave it as it is now, or remove this extra const and improve the
// configuration-detection in ModerationData#setType
export const hardban = ban;

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
