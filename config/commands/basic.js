import { Permissions } from 'discord.js';

const permissions = Permissions.FLAGS;

const hasActiveMemberRole = message => (message.member.roles.cache.has(process.env.ACTIVE_MEMBER_ROLE) ? null : 'No active member role');

export const help = {
  settings: {
    aliases: ['help', 'aide'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: null,
  },
  description: {
    name: 'Aide',
    content: 'Affiche la __liste des commandes__ disponible ou des informations précises sur une commande spécifique.',
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
      unavailable: 'Indisponible.',
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
  description: {
    name: 'Liens',
    content: "Affiche la liste des __liens utiles concernant Skript__, comme les discords, les documentations, les plateformes de téléchargement d'addon...",
    usage: 'links [page]',
    examples: ['links', 'liens 4'],
  },
  messages: {
    embed: {
      summary: 'Voici la liste des liens importants relatifs à Skript. Sommaire :\n:zero: Sommaire\n:one: Liens sur les documentations de Skript\n:two: Liens sur les documentations des addons de Skript\n:three: Liens de téléchargement de Skript et de ses addons\n:four: Liens vers quelques Discord importants\n:five: Divers liens importants',
      fields: [
        [
          [
            ':books: Documentation Skript de SkriptMC : https://bit.ly/2KSZ6pN',
            "Documentation sur Skript, faite par la communauté de Skript-MC. Elle est en français et elle est en constante amélioration. Si vous avez une suggestion, ou si vous voyez une erreur, n'hésitez pas à nous en faire part !",
          ], [
            ':books: Documentation Skript officielle : https://bit.ly/2VUGZ3W',
            'Documentation de Skript officielle. Elle est en anglais mais est complète. Elle contient toutes les syntaxes utilisables dans la dernière version de Skript.',
          ],
        ], [
          [
            ':books: Documentation addons de SkriptMC : https://bit.ly/2viSqq8',
            'Documentation des addons, faite par la communauté de Skript-MC. Elle ne contient pas encore tous les addons, mais est en français et elle est complête.',
          ], [
            ':books: Documentation des addons : https://bit.ly/2UTSlJ6',
            'Documentation officielle de tous les addons. Elle est en anglais, mais contient la quasi-totalité des addons disponibles.',
          ],
        ], [
          [
            ':inbox_tray: Téléchargement de Skript : https://bit.ly/2TMxYNm',
            "Lien pour télécharger la dernière version de Skript officielle. La dernière version de Skript en date ne supporte que les dernières versions de Minecraft de la 1.9 à la 1.13 inclus. Cela veut dire que la 1.12.1 n'est pas supportée, mais la 1.12.2 l'est.",
          ], [
            ':inbox_tray: Téléchargement des addons : https://bit.ly/2XvahGH',
            'Lien de téléchargement des dernières versions de tous les addons existant pour Skript.',
          ],
        ], [
          [
            ':speech_left: Discord Skript-MC : https://discordapp.com/invite/J3NSGaE',
            'Lien officiel de ce Discord.',
          ], [
            ':speech_left: Discord Skript Chat : https://discord.gg/V4qFVnh',
            "Lien du Discord \"Skript Chat\", qui est le Discord officiel de Skript. Vous pourrez y demander de l'aide en anglais, que ce soit sur Skript ou sur des addons.",
          ],
        ], [
          [
            ':speech_balloon: Forum SkriptMC : https://skript-mc.fr',
            "Forum français de Skript-MC. Vous pourrez y demander des Skript, de l'aide Skript, Java ou avec vos serveurs, discuter avec des membres de la communauté ou mettre en ligne vos skript !",
          ], [
            ':computer: GitHub de Skript : https://bit.ly/2W0EJrU',
            "GitHub officiel de la fork Skript de Bensku. C'est actuellement la seule fork de Skript toujours mise à jour.",
          ],
        ],
      ],
    },
  },
};

export const move = {
  settings: {
    aliases: ['move', 'movemessage'],
    clientPermissons: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS | permissions.MANAGE_MESSAGES,
    userPermissions: hasActiveMemberRole,
  },
  description: {
    name: 'Déplacer un message',
    content: "Permet de déplacer un message d'un salon d'aide à un autre, si le salon d'aide est déjà occupé ou n'est pas adapté à la commande par exemple.",
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
    moveInfos: "{EXECUTOR} à déplacé un message de {TARGET_MEMBER}, depuis {SOURCE_CHANNEL} vers {TARGET_CHANNEL}. Raison du déplacement : {REASON}\nEn cas d'erreur, réagissez avec {EMOJI} pour supprimer ce re-post.",
    emergency: "Une erreur s'est produite lors du déplacement de ton message dans les salons d'aide. Il se peut que ton message est était totalement supprimé, alors le voici, si tu veux le reposter :)",
  },
};

export const ping = {
  settings: {
    aliases: ['ping', 'ms'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: null,
  },
  description: {
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
  description: {
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
