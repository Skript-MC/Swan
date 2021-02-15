export const skriptReleases = {
  releaseAnnouncement: "Une nouvelle version de Skript vient d'être publiée ; vous pouvez la télécharger et consulter les changements ci-dessous.",
  githubEndpoint: '/repos/SkriptLang/Skript/releases',
  dataProvider: 'Données fournies par https://github.com',
  timeDifference: 600_000,
};

export const forumFeed = {
  timeDifference: 600_000,
  dataProvider: 'Automatiquement envoyé depuis Skript-MC',
  baseAxiosParams: {
    params: {
      page: 1, // Fetch the 25 first objects, more is useless
      hidden: 0, // Don't show hidden objects
      sortBy: 'updated', // Sort by updates, also including new contents
      sortDir: 'desc', // Get most recent updates or new contents
    },
    auth: {
      username: process.env.SKRIPTMC_FORUM_TOKEN,
      password: null,
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
