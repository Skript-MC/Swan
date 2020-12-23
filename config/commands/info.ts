import { stripIndent } from 'common-tags';
import { Permissions } from 'discord.js';

const permissions = Permissions.FLAGS;

export const addonInfo = {
  settings: {
    aliases: ['addoninfo'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: [],
  },
  details: {
    name: 'AddonInfo',
    content: "Permet d'afficher diverses informations sur un addon choisi, à partir du moment ou il est sur skripttools.net.",
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

export const userInfo = {
  settings: {
    aliases: ['userinfo'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'UserInfo',
    content: "Permet d'afficher diverses informations sur un member du discord choisi.",
    usage: 'userinfo <@mention | pseudo | ID>',
    examples: ['userinfo Romitou'],
  },
  messages: {
    embed: {
      title: 'Informations sur {MEMBER}',
      names: {
        title: '❯ Noms',
        content: stripIndent`
          Pseudo : {PSEUDO}
          Surnom : {NICKNAME}
          Discriminant : \`{DISCRIMINATOR}\`
          Identifiant : \`{ID}\``,
      },
      created: {
        title: '❯ A créé son compte',
        content: '{CREATION}',
      },
      joined: {
        title: '❯ A rejoint le serveur',
        content: '{JOINED}',
      },
      roles: {
        title: '❯ Rôles',
        content: '{AMOUNT} : {ROLES}',
        noRole: 'Aucun',
      },
      presence: {
        title: '❯ Présence',
        content: stripIndent`
          Statut : {STATUS}
          {DETAILS}`,
        types: {
          playing: 'Joue à {NAME}\n',
          streaming: 'Est en live\n',
          listening: 'Écoute (sur {NAME}) :\n',
          watching: 'Regarde : {NAME}\n',
          custom_status: '{NAME}\n', // eslint-disable-line @typescript-eslint/naming-convention
        },
        details: '↳ {DETAILS}\n',
        state: '↳ {STATE}\n',
        timestamps: '↳ A commencé {TIMESTAMP}',
        status: {
          online: 'En ligne',
          idle: 'AFK',
          dnd: 'Ne pas déranger',
          offline: 'Hors ligne',
        },
      },
      footer: 'Exécuté par {MEMBER}',
    },
  },
};
