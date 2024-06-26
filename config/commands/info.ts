import { stripIndent } from 'common-tags';
import { ActivityType } from 'discord.js';

export const addonInfo = {
  settings: {
    command: 'addoninfo',
    description: "Permet d'afficher diverses informations sur un addon choisi.",
  },
  messages: {
    unknownAddon:
      "Désolé, mais je ne trouve pas l'addon `{addon}`... Es-tu sûr qu'il est disponible sur skripttools (<https://skripttools.net/addons?q={addon}>) ?",
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
      footer: 'Données fournies par https://skripttools.net',
    },
  },
} as const;

export const documentation = {
  settings: {
    command: 'doc',
    description: "Permet de chercher une syntaxe de Skript ou d'un addon de la documentation de Skript-MC.",
  },
  messages: {
    unknownSyntax:
      "Désolé, mais je ne trouve pas la syntaxe `{articleId}`... Elle n'existe peut être pas, ou n'est simplement pas répertoriée sur la documentation de Skript-MC (<https://skript-mc.fr/documentation/skript/>).",
    searchResults: "{matchingSyntaxes.length} syntaxes trouvées pour la recherche `{syntax}`. Laquelle t'intéresse ?",
    more: '\n...et {amount} de plus...',
    embed: {
      title: '{article.name} ({article.category} — #{article.id})',
      description: '{article.content}',
      deprecated: ":warning: Cette syntaxe est dépréciée, il ne faut plus l'utiliser !",
      depreactionReplacement: 'Tu peux utiliser [cette syntaxe]({article.deprecationLink}) pour la remplacer.',
      noReplacement: 'Pas de remplacement disponible.',
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
      footer: 'Données fournies par https://skript-mc.fr/api',
    },
  },
} as const;

export const serverInfo = {
  settings: {
    command: 'server',
    description: "Permet d'afficher diverses informations sur un serveur Minecraft, selon son adresse.",
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
      footer: 'Données fournies par https://api.mcsrcstat.us',
    },
    requestFailed: "Aïe, je n'arrive pas à reconnaître cette adresse ou à récupérer ses données...",
    noIp: "Il faut entrer le nom de domaine (`mc.hypixel.net`), pas l'adresse IP !",
  },
} as const;

export const skriptInfo = {
  settings: {
    command: 'skript',
    description: "Permet d'afficher diverses informations sur Skript.",
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
      footer: 'Données fournies par https://github.com',
    },
  },
} as const;

export const userInfo = {
  settings: {
    command: 'userinfo',
    description: "Permet d'afficher diverses informations sur un membre en particulier du Discord.",
  },
  messages: {
    notFound: "Aucun membre n'a été trouvé.",
    embed: {
      title: 'Informations sur {member.user.username}',
      names: {
        title: '❯ Noms',
        content: `
          Nom d'utilisateur : {member.user.tag}
          Pseudo : {member.user.globalName}
          Surnom : {member.displayName}
          Identifiant : \`{member.id}\``,
      },
      created: {
        title: '❯ A créé son compte',
        content: 'le {creation}',
      },
      joined: {
        title: '❯ A rejoint le serveur',
        content: 'le {joined}',
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
          [ActivityType.Playing]: 'Joue à {activity.name}\n',
          [ActivityType.Streaming]: 'Est en live\n',
          [ActivityType.Listening]: 'Écoute (sur {activity.name}) :\n',
          [ActivityType.Watching]: 'Regarde : {activity.name}\n',
          [ActivityType.Custom]: '{activity.name}\n',
          [ActivityType.Competing]: 'En compétition ({activity.name})',
        },
        details: '↳ {activity.details}\n',
        state: '↳ {activity.state}\n',
        timestamps: '↳ A commencé {time}',
        status: {
          online: 'En ligne',
          idle: 'AFK',
          dnd: 'Ne pas déranger',
          offline: 'Hors ligne',
          invisible: 'Hors ligne',
        },
      },
    },
  },
} as const;
