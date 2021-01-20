import { stripIndent } from 'common-tags';
import { Permissions } from 'discord.js';
import type { GuildMessage } from '../../src/types';

const permissions = Permissions.FLAGS;

const hasActiveMemberRole = (message: GuildMessage): string | null => (message.member.roles.cache.has(process.env.ACTIVE_MEMBER_ROLE) ? null : 'No active member role');

export const addonPack = {
  settings: {
    aliases: ['addonPack'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: "Pack d'add-on",
    content: "Permet de connaître les versions recommandées de Skript et de ses add-ons d'une version.",
    usage: 'addonPack <version>',
    examples: ['addonPack 1.16.4', 'addonPack 1.13'],
  },
  messages: {
    startPrompt: 'Ajoute la version Minecraft dont tu souhaites connaître les versions recommandées :',
    retryPrompt: 'Version Minecraft invalide. Ré-entre ta version :',
    notFound: "Désolé, je n'ai pas trouvé de pack d'add-on pour cette version. Réessaie ou demande son ajout.",
  },
};

export const autoMessage = {
  settings: {
    aliases: ['auto', 'autoMsg', 'autoMessage', 'automaticMessage'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Message rapide',
    content: "Permet d'envoyer rapidement un message prédéfini.",
    usage: 'auto <message>',
    examples: ['auto skript-gui', 'autoMsg 1.8'],
  },
  messages: {
    startPrompt: 'Ajoute une le nom du message rapide que tu souhaites envoyer :',
    retryPrompt: 'Nom de message invalide. Ré-entre son nom :',
    notFound: "Aucun message n'existe avec ce nom. Réessaye ou suggère son ajout.",
  },
};

export const code = {
  settings: {
    aliases: ['code', 'balise', 'balises'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Code',
    content: "Permet d'__afficher du code__ bien présenté, avec des balises de code et une coloration syntaxique. Vous pouvez ajouter le drapeau `-l` (ou `--lignes`/`--lines`) pour afficher le numéro des lignes. Vous pouvez, en plus, ajouter l'option `-s=<nombre>` (ou `--start=<nombre>`) pour spécifier à quel nombre commencer le compte des lignes.",
    usage: 'code <code>',
    examples: ['code broadcast "Yeah!"'],
  },
  messages: {
    title: '**Code de {message.author.username} :**',
    emergency: "Une erreur s'est produite lors de la création de ton bloc de code. Il se peut que ton code ait été totalement supprimé, alors le voici, si tu veux le reposter :)",
    startPrompt: 'Ajoute un code à formatter :',
    retryPrompt: 'Code invalide. Ré-entre ton code :',
  },
};

export const errorDetails = {
  settings: {
    aliases: ['error', 'errorDetails'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: "Détails d'erreur",
    content: 'Permet de trouver des informations supplémentaires sur une erreur rencontrée avec Skript.',
    usage: 'error <erreur>',
    examples: ['error Invalid amount and/or placement of double quotes'],
  },
  messages: {
    startPrompt: "Ajoute une erreur dont tu souhaites avoir plus d'informations :",
    retryPrompt: 'Erreur invalide. Ré-entre ton erreur :',
    notFound: "Je n'ai pas pu trouver d'information sur ton erreur. Réessaye uniquement avec le début de l'erreur ou demande son ajout.",
  },
};

export const help = {
  settings: {
    aliases: ['help', 'aide'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Aide',
    content: 'Affiche la __liste des commandes__ disponibles ou des informations précises sur une commande spécifique.',
    usage: 'help [commande]',
    examples: ['help', 'aide ping'],
  },
  messages: {
    commandInfo: {
      title: ':star: Commande "{command.details.name}"',
      description: '❯ Description',
      usage: '❯ Utilisation',
      usableBy: '❯ Utilisable par',
      aliases: '❯ Aliases',
      examples: '❯ Exemples',
    },
    commandsList: {
      title: 'Commandes de Swan ({amount})',
      description: "Faites `{helpCommand}` pour avoir plus d'informations sur une commande.",
      category: '❯ {categoryName}',
    },
  },
};

export const links = {
  settings: {
    aliases: ['links', 'link', 'liens', 'lien'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: [],
  },
  details: {
    name: 'Liens',
    content: "Affiche la liste des __liens utiles concernant Skript__, comme les serveurs Discord, les documentations, les plateformes de téléchargement d'addons...",
    usage: 'links [page]',
    examples: ['links', 'liens 4'],
  },
  messages: {
    embed: {
      summary: `
        Voici la liste des liens importants relatifs à Skript. Sommaire :
        :zero: Sommaire.
        :one: Liens sur les documentations de Skript.
        :two: Liens sur les documentations des addons de Skript.
        :three: Liens de téléchargement de Skript et de ses addons.
        :four: Liens vers quelques Discord importants.
        :five: Divers liens importants.
      `,
      fields: [
        [
          {
            title: ':books: Documentation Skript de SkriptMC : https://bit.ly/2KSZ6pN',
            description: "Documentation sur Skript, réalisée et maintenue par la communauté de Skript-MC. Elle est en français et en constante amélioration. Si tu as une suggestion ou si tu vois une erreur, n'hésite pas à nous en faire part !",
          }, {
            title: ':books: Documentation Skript officielle : https://bit.ly/2VUGZ3W',
            description: 'Documentation de Skript officielle. Elle est en anglais mais plus complète. Elle contient toutes les syntaxes utilisables dans la dernière version de Skript.',
          },
        ], [
          {
            title: ':books: Documentation addons de SkriptMC : https://bit.ly/2viSqq8',
            description: 'Documentation des addons, réalisée et maintenue par la communauté de Skript-MC. Elle ne contient pas encore tous les addons, mais elle est en français et en constante amélioration !',
          }, {
            title: ':books: Documentation des addons : https://bit.ly/2UTSlJ6',
            description: 'Documentation rédigée en anglais, mais contenant la quasi-totalité des addons disponibles.',
          },
        ], [
          {
            title: ':inbox_tray: Téléchargement de Skript : https://bit.ly/2TMxYNm',
            description: 'Lien officiel de téléchargement des dernières versions de Skript. La dernière version de Skript ne supporte que les dernières versions de Minecraft à partir de la 1.9.',
          }, {
            title: ':inbox_tray: Téléchargement des addons : https://bit.ly/2XvahGH',
            description: 'Lien de téléchargement des dernières versions de tous les addons de Skript.',
          },
        ], [
          {
            title: ':speech_left: Discord Skript-MC : https://discord.com/invite/J3NSGaE',
            description: 'Lien officiel de ce Discord.',
          }, {
            title: ':speech_left: Discord Skript Chat : https://discord.gg/V4qFVnh',
            description: "Lien du Discord \"Skript Chat\", le serveur Discord officiel de Skript. Tu peux y demander de l'aide en anglais, que ce soit sur Skript ou sur des addons.",
          },
        ], [
          {
            title: ':speech_balloon: Forum Skript-MC : https://skript-mc.fr',
            description: "Forum français de Skript-MC. Tu peux y demander des scripts, de l'aide sur Skript, Java ou vos serveurs, discuter avec des membres de la communauté ou mettre en ligne tes meilleurs projets !",
          }, {
            title: ':computer: GitHub de Skript : https://bit.ly/2W0EJrU',
            description: 'GitHub officiel du projet Skript. Tu peux y consulter son développement, y signaler des problèmes ou y contribuer.',
          },
        ],
      ],
    },
  },
};

export const move = {
  settings: {
    aliases: ['move', 'movemessage'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS | permissions.MANAGE_MESSAGES,
    userPermissions: hasActiveMemberRole,
  },
  details: {
    name: 'Déplacer un message',
    content: "Permet de __déplacer un message__ d'un salon d'aide à un autre, si le salon d'aide est déjà occupé ou n'est pas adapté à la demande par exemple.",
    usage: 'move <#salon> <ID message>',
    examples: ['move #skript-2 756858183229636640'],
    permissions: 'Membre Actif',
  },
  messages: {
    startChannelPrompt: "Tu n'as pas spécifié de salon ! Entre son ID ou mentionne-le.",
    retryChannelPrompt: "Identifiant du salon invalide. Le salon d'origine/d'arrivée n'est pas un salon d'aide, ou ce sont les mêmes salons.",
    startMessagePrompt: "Tu n'as pas spécifié de message à déplacer. Entre son ID.",
    retryMessagePrompt: 'Identifiant du message invalide. Vérifie que le message spécifié est bien dans ce salon.',
    successfullyMoved: ':twisted_rightwards_arrows: {targetDisplayName}, ton message a été déplacé vers {targetChannel} par {memberDisplayName}.',
    moveInfos: stripIndent`
      {memberDisplayName} à déplacé un message de {targetDisplayName}, depuis {sourceChannel} vers {targetChannel}.
      En cas d'erreur, réagissez avec {emoji} pour supprimer ce re-post.
    `,
    emergency: "Une erreur s'est produite lors du déplacement de ton message dans les salons d'aide. Il se peut que ton message ait été totalement supprimé, alors le voici, si tu veux le reposter :)",
  },
};

export const ping = {
  settings: {
    aliases: ['ping', 'ms'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Ping',
    content: "Permet de connaître la __latence de Swan__ et de __l'API Discord__.",
    usage: 'ping',
    examples: ['ping'],
  },
  messages: {
    firstMessage: ':incoming_envelope: Calcul en cours...',
    secondMessage: `
      :hourglass: Swan : {swanPing} ms {swanIndicator}

      :globe_with_meridians: API Discord : {discordPing} ms {discordIndicator}
    `,
  },
};

export const statistics = {
  settings: {
    aliases: ['statistics', 'stats', 'stat', 'statistique', 'statistiques', 'botinfo', 'swan'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Statistique',
    content: 'Affiche des __statistiques et diverses informations__ sur Swan, comme son temps de fonctionnement, sa version etc.',
    usage: 'stats',
    examples: ['stats'],
  },
  messages: {
    embed: {
      title: 'Statistiques de Swan',
      description: 'Le préfixe est `{prefix}`. Faites `{helpCommand}` pour avoir la liste des commandes.',
      version: '❯ Version',
      versionContent: stripIndent`
        Version : {version}
        Commit : {commitLink}
      `,
      uptime: '❯ Temps de fonctionnement',
      memory: '❯ Mémoire',
      commands: '❯ Commandes',
      developers: '❯ Développeurs',
      developersContent: '<@188341077902753794>\n<@191495299884122112>',
      thanks: '❯ Remerciements',
      thanksContent: stripIndent`
        <@218505052015296512> : ancien développeur
        <@173542833364533249> : contributions
        <@294134773901688833> : contributions
      `,
      bugs: 'Support',
      bugsContent: 'Tu peux reporter les bugs ou problèmes que tu trouves, ou les suggestions que tu as sur le [GitHub](<{url}>). Tu peux aussi venir discuter avec nous sur le [Discord](<https://discord.gg/njSgX3w>) de Swan.',
    },
  },
};
