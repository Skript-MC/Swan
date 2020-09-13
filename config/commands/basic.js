import { Permissions } from 'discord.js';

const permissions = Permissions.FLAGS;

export const help = {
  settings: {
    aliases: ['help', 'aide'],
    clientPermissons: [permissions.SEND_MESSAGES],
    userPermissions: [],
  },
  description: {
    content: 'Affiche la liste des commandes disponible ou des informations précises sur une commande spécifique.',
    usage: 'help [commande]',
    examples: ['help', 'aide ping'],
  },
  messages: {
    commandInfo: {
      description: '❯ Description',
      usage: '❯ Utilisation',
      aliases: '❯ Aliases',
      examples: '❯ Exemples',
      unavailabe: 'Indisponible.',
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
    clientPermissons: [permissions.ADD_REACTIONS, permissions.SEND_MESSAGES],
    userPermissions: [],
  },
  description: {
    content: "Affiche la liste des liens utiles concernant Skript, comme les discords, les documentations, les plateformes de téléchargement d'addon...",
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

export const ping = {
  settings: {
    aliases: ['ping', 'ms'],
    clientPermissons: [permissions.SEND_MESSAGES],
    userPermissions: [],
  },
  description: {
    content: "Permet de savoir la latence du bot et de l'API Discord.",
    usage: 'ping',
  },
  messages: {
    firstMessage: ':incoming_envelope: Calcul en cours...',
    secondMessage: `
      :hourglass: Swan : {SWAN_PING} ms {SWAN_INDICATOR}

      :globe_with_meridians: API Discord : {DISCORD_PING} ms {DISCORD_INDICATOR}
    `,
  },
};
