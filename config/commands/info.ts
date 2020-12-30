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
    name: 'Addon Info',
    content: "Permet d'afficher diverses __informations sur un addon__ choisi, à partir du moment où il est sur skripttools.net.",
    usage: 'addoninfo <addon>',
    examples: ['addoninfo mongosk'],
  },
  messages: {
    startPrompt: "Entre le nom de l'addon que tu souhaites chercher.",
    retryPrompt: "Nom invalide, ré-envoie le nom de l'addon que tu souhaites chercher.",
    unknownAddon: "Désolé, mais je ne trouve pas l'addon `{addon}`... Es-tu sûr qu'il est disponible sur skripttools (<https://skripttools.net/addons?q={addon}>) ?",
    searchResults: "{matchingAddons.length} addons trouvés pour la recherche `{addon}`. Quel addon t'intéresse ?",
    more: '\n...et {amount} de plus...',
    embed: {
      title: 'Informations sur {addon.plugin}',
      noDescription: 'Aucune description disponible.',
      author: ':bust_in_silhouette: Auteur(s)',
      version: ':gear: Dernière version',
      download: ':inbox_tray: Lien de téléchargement',
      downloadDescription: '[Téléchargez ici]({addon.download}) ({size})',
      sourcecode: ':computer: Code source',
      sourcecodeDescription: '[Voir ici]({addon.sourcecode})',
      depend: ':link: Dépendances obligatoires',
      softdepend: ':link: Dépendances facultatives',
      unmaintained: ':warning: Addon abandonné',
      unmaintainedDescription: "Cet addon a été abandonné par son auteur ! Il est fortement déconseillé de l'utiliser.",
      footer: 'Exécuté par {member.displayName} | Données fournies par https://skripttools.net',
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
    name: 'User Info',
    content: "Permet d'afficher diverses __informations sur un membre__ en particulier du Discord.",
    usage: 'userinfo <@mention | pseudo | ID>',
    examples: ['userinfo Romitou'],
  },
  messages: {
    embed: {
      title: 'Informations sur {member.user.username}',
      names: {
        title: '❯ Noms',
        content: `
          Pseudo : {member.user.username}
          Surnom : {member.displayName}
          Discriminant : \`{member.user.discriminator}\`
          Identifiant : \`{member.id}\``,
      },
      created: {
        title: '❯ A créé son compte',
        content: '{creation}',
      },
      joined: {
        title: '❯ A rejoint le serveur',
        content: '{joined}',
      },
      roles: {
        title: '❯ Rôles',
        content: '{amount} : {roles}',
        noRole: 'Aucun',
      },
      presence: {
        title: '❯ Présence',
        content: stripIndent`
          Statut : {status}
          {presenceDetails}`,
        types: {
          playing: 'Joue à {activity.name}\n',
          streaming: 'Est en live\n',
          listening: 'Écoute (sur {activity.name}) :\n',
          watching: 'Regarde : {activity.name}\n',
          custom_status: '{activity.name}\n', // eslint-disable-line @typescript-eslint/naming-convention
          competing: 'En compétition ({activity.name})',
        },
        details: '↳ {activity.details}\n',
        state: '↳ {activity.state}\n',
        timestamps: '↳ A commencé {timestamp}',
        status: {
          online: 'En ligne',
          idle: 'AFK',
          dnd: 'Ne pas déranger',
          offline: 'Hors ligne',
        },
      },
      footer: 'Exécuté par {member.user.username}',
    },
  },
};
