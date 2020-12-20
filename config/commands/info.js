import { Permissions } from 'discord.js';

const permissions = Permissions.FLAGS;

// eslint-disable-next-line import/prefer-default-export
export const addonInfo = {
  settings: {
    aliases: ['addoninfo'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: [],
  },
  description: {
    name: 'AddonInfo',
    content: "Permet d'afficher diverses informations sur un addon choisit, à partir du moment ou il est sur skripttools.net.",
    usage: 'addoninfo <addon>',
    examples: ['addoninfo mongosk'],
  },
  messages: {
    startPrompt: "Entre le nom de l'addon que tu souhaites chercher.",
    retryPrompt: "Nom invalide, ré-envoie le nom de l'addon que tu souhaites chercher.",
    unknownAddon: "Désolé, mais je ne trouve pas cet addon... Es-tu sur qu'il est disponible sur [skripttools](<https://skripttools.net/addons?q={ADDON}>) ?",
    searchResults: "{AMOUNT} addons trouvés pour la recherche `{QUERY}`. Quel addon t'intéresse ?",
    more: '\n...et {AMOUNT} de plus...',
    embed: {
      title: 'Informations sur {NAME}',
      noDescription: 'Aucune description disponible',
      author: ':bust_in_silhouette: Auteur(s)',
      version: ':gear: Dernière version',
      download: ':inbox_tray: Lien de téléchargement',
      downloadDescription: '[Téléchargez ici]({LINK}) ({SIZE})',
      sourcecode: ':computer: Code source',
      sourcecodeDescription: '[Voir ici]({LINK})',
      depend: ':link: Dépendences obligatoires',
      softdepend: ':link: Dépendences facultatives',
      unmaintained: ':warning: Addon abandonné',
      unmaintainedDescription: "Cet addon a été abandonné par son auteur ! Il est fortement déconseillé de l'utiliser.",
      footer: 'Exécuté par {MEMBER} | Données fournies par https://skripttools.net',
    },
  },
};
