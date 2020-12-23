import { Permissions } from 'discord.js';
import type { Message } from 'discord.js';

const permissions = Permissions.FLAGS;

const hasActiveMemberRole = (message: Message): string | null => (message.member.roles.cache.has(process.env.ACTIVE_MEMBER_ROLE) ? null : 'No active member role');

export const code = {
  settings: {
    aliases: ['code', 'balise', 'balises'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Code',
    content: "Permet d'afficher du code bien présenté, avec des balises de code et une coloration syntaxique.",
    usage: 'code <code>',
    examples: ['code broadcast "Yeah!"'],
  },
  messages: {
    emergency: "Une erreur s'est produite lors de la création de ton bloc de code. Il se peut que ton code ait été totalement supprimé, alors le voici, si tu veux le reposter :)",
    startPrompt: 'Ajoute un code à formatter :',
    retryPrompt: 'Code invalid. Ré-entre ton code :',
  },
};

export const help = {
  settings: {
    aliases: ['help', 'aide'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: null,
  },
  details: {
    name: 'Aide',
    content: 'Affiche la __liste des commandes__ disponibles ou des informations précises sur une commande spécifique.',
    usage: 'help [commande]',
    examples: ['help', 'aide ping'],
  },
  messages: {
    commandInfo: {
      title: ':star: Commande "{NAME}"',
      description: '❯ Description',
      usage: '❯ Utilisation',
      usableBy: '❯ Utilisable par',
      aliases: '❯ Aliases',
      examples: '❯ Exemples',
    },
    commandsList: {
      title: 'Commandes de Swan ({NUMBER})',
      description: "Faites `{COMMAND}` pour avoir plus d'informations sur une commande",
      category: '❯ {CATEGORY}',
    },
  },
};

export const links = {
  settings: {
    aliases: ['links', 'link', 'liens', 'lien'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: null,
  },
  details: {
    name: 'Liens',
    content: "Affiche la liste des __liens utiles concernant Skript__, comme les serveurs Discord, les documentations, les plateformes de téléchargement d'addon...",
    usage: 'links [page]',
    examples: ['links', 'liens 4'],
  },
  messages: {
    embed: {
      summary: 'Voici la liste des liens importants relatifs à Skript. Sommaire :\n:zero: Sommaire\n:one: Liens sur les documentations de Skript\n:two: Liens sur les documentations des addons de Skript\n:three: Liens de téléchargement de Skript et de ses addons\n:four: Liens vers quelques Discord importants\n:five: Divers liens importants',
      fields: [
        [
          {
            title: ':books: Documentation Skript de SkriptMC : https://bit.ly/2KSZ6pN',
            description: "Documentation sur Skript, réalisée et maintenue par la communauté de Skript-MC. Elle est en français et en constante amélioration. Si vous avez une suggestion ou si vous voyez une erreur, n'hésitez pas à nous en faire part !",
          }, {
            title: ':books: Documentation Skript officielle : https://bit.ly/2VUGZ3W',
            description: 'Documentation de Skript officielle. Elle est en anglais mais plus complète. Elle contient toutes les syntaxes utilisables dans la dernière version de Skript.',
          },
        ], [
          {
            title: ':books: Documentation addons de SkriptMC : https://bit.ly/2viSqq8',
            description: 'Documentation des addons, réalisée et maintenue par la communauté de Skript-MC. Elle ne contient pas encore tous les addons, mais elle est en français et complète.',
          }, {
            title: ':books: Documentation des addons : https://bit.ly/2UTSlJ6',
            description: 'Documentation rédigée en anglais, mais contenant la quasi-totalité des addons disponibles.',
          },
        ], [
          {
            title: ':inbox_tray: Téléchargement de Skript : https://bit.ly/2TMxYNm',
            description: "Lien officiel de téléchargement des dernières versions de Skript. La dernière version de Skript en date ne supporte que les dernières versions de Minecraft de la 1.9 à la 1.13 inclus. Cela veut dire que la 1.12.1 n'est pas supportée, mais la 1.12.2 l'est.",
          }, {
            title: ':inbox_tray: Téléchargement des addons : https://bit.ly/2XvahGH',
            description: 'Lien de téléchargement des dernières versions de tous les addons existants de Skript.',
          },
        ], [
          {
            title: ':speech_left: Discord Skript-MC : https://discord.com/invite/J3NSGaE',
            description: 'Lien officiel de ce Discord.',
          }, {
            title: ':speech_left: Discord Skript Chat : https://discord.gg/V4qFVnh',
            description: "Lien du Discord \"Skript Chat\", étant le serveur Discord officiel de Skript. Vous pouvez y demander de l'aide en anglais, que ce soit sur Skript ou sur des addons.",
          },
        ], [
          {
            title: ':speech_balloon: Forum Skript-MC : https://skript-mc.fr',
            description: "Forum français de Skript-MC. Vous pouvez y demander des scripts, de l'aide Skript, Java ou sur vos serveurs, discuter avec des membres de la communauté ou mettre en ligne vos scripts !",
          }, {
            title: ':computer: GitHub de Skript : https://bit.ly/2W0EJrU',
            description: 'GitHub officiel du projet Skript. Vous pouvez y consulter son développement, y signaler des problèmes ou y contribuer.',
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
    content: "Permet de déplacer un message d'un salon d'aide à un autre, si le salon d'aide est déjà occupé ou n'est pas adapté à la demande par exemple.",
    usage: 'move <#salon> <ID message>',
    examples: ['move #skript-2 756858183229636640'],
    permissions: 'Membre Actif',
  },
  messages: {
    startChannelPrompt: "Vous n'avez pas spécifié de salon ! Entrez son ID ou mentionnez-le.",
    retryChannelPrompt: "Identifiant du salon invalide. Le salon d'origine/d'arrivée ne sont pas des salons d'aide, ou ce sont les mêmes salons.",
    startMessagePrompt: "Vous n'avez pas spécifié de message à déplacer. Entrez son ID.",
    retryMessagePrompt: 'Identifiant du message invalide. Vérifiez que le message spécifié est bien dans ce salon',
    successfullyMoved: ':twisted_rightwards_arrows: {TARGET_MEMBER}, ton message a été déplacé vers {TARGET_CHANNEL} par {EXECUTOR}.',
    moveInfos: "{EXECUTOR} à déplacé un message de {TARGET_MEMBER}, depuis {SOURCE_CHANNEL} vers {TARGET_CHANNEL}.\nEn cas d'erreur, réagissez avec {EMOJI} pour supprimer ce re-post.",
    emergency: "Une erreur s'est produite lors du déplacement de ton message dans les salons d'aide. Il se peut que ton message ait été totalement supprimé, alors le voici, si tu veux le reposter :)",
  },
};

export const ping = {
  settings: {
    aliases: ['ping', 'ms'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: null,
  },
  details: {
    name: 'Ping',
    content: "Permet de savoir la __latence de Swan__ et de __l'API Discord__.",
    usage: 'ping',
    examples: ['ping'],
  },
  messages: {
    firstMessage: ':incoming_envelope: Calcul en cours...',
    secondMessage: `
      :hourglass: Swan : {SWAN_PING} ms {SWAN_INDICATOR}

      :globe_with_meridians: API Discord : {DISCORD_PING} ms {DISCORD_INDICATOR}
    `,
  },
};

export const statistics = {
  settings: {
    aliases: ['statistics', 'stats', 'stat', 'statistique', 'statistiques', 'botinfo', 'swan'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: null,
  },
  details: {
    name: 'Statistique',
    content: 'Affiche des __statistiques et diverses informations__ sur Swan, comme son temps de fonctionnement, sa version etc...',
    usage: 'stats',
    examples: ['stats'],
  },
  messages: {
    embed: {
      title: 'Statistiques de Swan',
      description: 'Le préfixe est `{PREFIX}`. Faites `{HELP}` pour avoir la liste des commandes.',
      version: '❯ Version',
      uptime: '❯ Temps de fonctionnement',
      memory: '❯ Mémoire',
      commands: '❯ Commandes',
      developers: '❯ Développeurs',
      developersContent: '<@188341077902753794>\n<@191495299884122112>',
      thanks: '❯ Remerciements',
      thanksContent: '<@218505052015296512> : ancien développeur\n<@173542833364533249> : contributions\n<@294134773901688833> : contributions',
      bugs: 'Signalement des bugs/problèmes et suggestions',
      bugsContent: 'Vous pouvez les signaler sur le [GitHub](<{URL}>). Vous pouvez aussi venir discuter avec nous sur le [Discord](<https://discord.gg/njSgX3w>) de Swan.',
    },
  },
};
