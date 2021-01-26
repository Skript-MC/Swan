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
    name: 'Informations sur un add-on',
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

export const documentation = {
  settings: {
    aliases: ['doc', 'docs', 'documentation', 'documentations', 'syntax', 'syntaxinfo'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: [],
  },
  details: {
    name: 'Documentation',
    content: stripIndent`
      Permet de chercher une syntaxe de Skript ou d'un addon dans la [documentation de Skript-MC](https://skript-mc.fr/documentation/skript/).

      Cela va retourner diverses informations sur la syntaxe, comme une description détaillée, des exemples, le pattern, les addons ou la version requise...

      Tu peux affiner tes recherches grâce à deux options (que tu peux combiner) :

        • Utilise \`-a=ton_addon\` (ou \`--addon=ton_addon\`) pour chercher parmi les syntaxes d'un addon en particulier.

        • Utilise \`-c=ta_categorie\` (ou \`--categorie=ta_categorie\`) pour rechercher seulement les syntaxes d'une certaine catégorie (effet, évènement, condition...).`,

    usage: 'documentation <syntaxe> [--addon=un_addon] [--categorie=une_categorie]',
    examples: ['documentation join', 'documentation tablist --cat=effets --addon=skbee'],
  },
  messages: {
    startPrompt: 'Entre des mots clés afin de trouver la syntaxe que tu souhaites chercher.',
    retryPrompt: 'Mots clés sont invalides, ré-envoie des mots-clés afin de trouver la syntaxe que tu souhaites chercher.',
    unknownSyntax: "Désolé, mais je ne trouve pas la syntaxe `{query}`... Elle n'existe peut être pas, ou n'est simplement pas répertoriée sur la documentation de Skript-MC (<https://skript-mc.net/documentation/skript/>).",
    searchResults: "{matchingSyntaxes.length} syntaxes trouvées pour la recherche `{syntax}`. Laquelle t'intéresse ?",
    more: '\n...et {amount} de plus...',
    embed: {
      title: '{syntax.name} ({syntax.category} — #{syntax.id})',
      description: '{syntax.content}',
      deprecated: ":warning: Cette syntaxe est dépréciée, il ne faut plus l'utiliser !",
      depreactionReplacement: 'Tu peux utiliser [cette syntaxe]({syntax.deprecationLink}) pour la remplacer.',
      noDescription: 'Aucune description disponible.',
      version: ':bookmark: À partir de la version',
      addon: ':link: Addon requis',
      pattern: ':notepad_spiral: Pattern',
      patternContent: stripIndent`
        Dans le pattern, les parties entre \`[]\` sont facultatives, et il faut choisir entre un des choix proposés par ce genre de motif : \`(choix 1| choix 2|choix 3)\`. Enfin, remplacez \`%type%\` par une donnée ou une variable du type indiqué.
        \`\`\`applescript
        {pattern}
        \`\`\`
      `,
      example: ':books: Exemples',
      exampleContent: stripIndent`
        \`\`\`applescript
        {example}
        \`\`\`
      `,
      footer: 'Exécuté par {member.displayName} | Données fournies par https://skript-mc.fr/api',
    },
  },
};

export const serverInfo = {
  settings: {
    aliases: ['server', 'serveur', 'serverinfo', 'serveurinfo'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Informations sur un serveur',
    content: "Permet d'afficher diverses __informations sur un serveur__ minecraft, selon son nom de domaine.",
    usage: 'serverinfo <nom de domaine>',
    examples: ['skriptinfo hypixel.net'],
  },
  messages: {
    embed: {
      title: 'Informations sur {query}',
      online: 'En ligne',
      offline: 'Hors ligne',
      status: ':satellite: Statut',
      ip: ':label: Adresse IP',
      players: ':busts_in_silhouette: Joueurs en ligne',
      version: ':desktop: Version Minecraft',
      hostname: ":bookmark_tabs: Nom d'hôte",
      software: ':pager: Software',
      plugins: ':toolbox: Plugins',
      mods: ':toolbox: Mods',
      footer: 'Exécuté par {member.displayName} | Données fournies par https://api.mcsrcstat.us',
    },
  },
};

export const skriptInfo = {
  settings: {
    aliases: ['skript', 'skriptinfo'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: [],
  },
  details: {
    name: 'Informations sur Skript',
    content: "Permet d'afficher la __dernière version de Skript__ ainsi que diverses informations sur son installation.",
    usage: 'skriptinfo',
    examples: ['skriptinfo'],
  },
  messages: {
    embed: {
      downloadTitle: '📥 Informations sur les Versions',
      informationsTitle: '📄 Informations sur Skript',
      information: stripIndent`
        :small_blue_diamond: Pour installer Skript, vous pouvez simplement éteindre votre serveur, glisser le plugin dans votre dossier \`/plugins/\`, et redémarrer votre serveur.

        :small_blue_diamond: Skript ne fonctionnera pas avec Bukkit, il faut avoir Spigot ou un dérivé comme PaperSpigot. Ce dernier est fortement conseillé, car il vous permettera d'utiliser plus de fonctionnalitées de Skript.

        :small_blue_diamond: La dernière version de Skript ne supporte que les dernières versions de Minecraft, à partir de la 1.9.

        :small_blue_diamond: Pour utiliser Skript en 1.8.x, vous pouvez essayer d'utiliser [cette version non officielle](<https://github.com/Matocolotoe/Skript-1.8/releases>) qui est une adaptation des dernières versions de Skript. Sinon, vous pouvez utiliser la [2.2-dev27](<https://github.com/bensku/Skript/releases/tag/dev27>) ou la [2.2-dev36](<https://github.com/bensku/Skript/releases/tag/dev36>).

        :small_blue_diamond: Pour les versions 1.7.x et antérieures, vous pouvez essayer d'utiliser [une de ces versions](<https://dev.bukkit.org/projects/skript/files>).
      `,
      versionsWithPrerelease: stripIndent`
        [Dernière version : {latest.tag_name}]({latest.html_url})

        [Dernière version stable : {latestStable.tag_name}]({latestStable.html_url})
      `,
      versionsWithoutPrerelease: '[Dernière version : {latestStable.tag_name}]({latestStable.html_url})',
      footer: 'Exécuté par {member.displayName} | Données fournies par https://github.com',
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
    name: 'Informations sur un utilisateur (discord)',
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
