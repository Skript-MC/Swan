import { Permissions } from 'discord.js';

const permissions = Permissions.FLAGS;


// eslint-disable-next-line import/prefer-default-export
export const purge = {
  settings: {
    aliases: ['purge'],
    clientPermissons: [permissions.SEND_MESSAGES, permissions.MANAGE_MESSAGES],
    userPermissions: [permissions.MANAGE_MESSAGES],
  },
  description: {
    content: "Permet de supprimer plusieurs messages à la fois dans un salon, avec la possibilité de spécifier un membre en particulier. Il n'est possible que de supprimer des messages ayant été envoyés il y a moins de 15 jours : c'est une limitation de discord. Par défaut, les messages des membres du staff ne seront pas inclus. Si vous voulez aussi supprimer les messages du Staff, ajoutez le drapeau `--force` (ou `-f`)",
    usage: 'purge <nombre> [<@mention | pseudo | ID>] [--force | -f]',
    examples: ['purge 10 -f', 'purge @membre 40'],
  },
  messages: {
    startPrompt: 'Entrez un nombre de message à supprimer.',
    retryPrompt: 'Montant invalide.',
    success: "J'ai bien supprimé {AMOUNT} messages.",
  },
};
