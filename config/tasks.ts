export const forumFeed = {
  timeDifference: 600_000,
  dataProvider: 'Automatiquement envoyé depuis Skript-MC',
  embed: {
    title: '💬 {topic.title}',
    categoryTitle: 'Catégorie',
    versionTitle: 'Version',
    ratingTitle: 'Notation',
    noRating: 'Aucune notation',
    update: '📥 Mise à jour de {resource.title}',
    post: '📥 Publication de {resource.title}',
  },
  baseAxiosParams: {
    params: {
      page: 1, // Fetch the first page
      perPage: 5, // Fetch the 5 first objects, more is useless
      hidden: 0, // Don't show hidden objects
      sortBy: 'updated', // Sort by updates, also including new contents
      sortDir: 'desc', // Get most recent updates or new contents
    },
    auth: {
      username: process.env.SKRIPTMC_FORUM_TOKEN,
      password: null as string, // 'null as string' because if it is not null, then we want it to be a string.
    },
  },
  endpoints: {
    files: {
      files: 'downloads/files',
      categories: 'downloads/categories',
      comments: 'downloads/comments',
      reviews: 'downloads/reviews',
    },
    forums: {
      forums: 'forums/forums',
      posts: 'forums/posts',
      topics: 'forums/topics',
    },
  },
};

export const helpChannels = {
  extra: {
    inactivityTime: 1_200_000,
    limitMessages: 1,
  },
  basic: {
    inactivityTime: 300_000,
    limitMessages: 5,
  },
  unlockMessage: ":white_check_mark: Les salons d'aide principaux étant actuellement fortement utilisés, ce salon a automatiquement été débloqué.",
  lockMessage: ":chart_with_downwards_trend: Ce salon est désormais inactif, il a donc automatiquement été fermé.\nSi vous avez besoin d'aide, n'hésitez pas à utiliser les salons {channels}.",
};

export const presence = {
  messages: [
    '{memberCount} membres 🎉',
    '{prefix}aide | Skript-MC',
  ],
};

export const skriptReleases = {
  releaseAnnouncement: "Une nouvelle version de Skript vient d'être publiée ; vous pouvez la télécharger et consulter les changements ci-dessous.",
  githubEndpoint: '/repos/SkriptLang/Skript/releases',
  dataProvider: 'Données fournies par https://github.com',
  timeDifference: 600_000,
};
