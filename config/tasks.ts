import type { AxiosRequestConfig } from 'axios';

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
      // TODO: Remove category filter when it'll be possible
      categories: '22,5,20,19,18,17,16,15,14,13,12,11,10,9,8,7,21,6,4,33,3,28,27',
    },
    auth: {
      username: process.env.SKRIPTMC_FORUM_TOKEN,
      password: null as unknown as string,
    },
  } satisfies AxiosRequestConfig,
  endpoints: {
    files: {
      files: '/downloads/files',
      categories: '/downloads/categories',
      comments: '/downloads/comments',
      reviews: '/downloads/reviews',
    },
    forums: {
      forums: '/forums/forums',
      posts: '/forums/posts',
      topics: '/forums/topics',
    },
  },
} as const;

export const presence = {
  messages: [
    '{memberCount} membres 🎉',
    'Bienvenue sur Skript-MC',
    'https://skript-mc.fr',
  ],
};

export const skriptReleases = {
  releaseAnnouncement: "Une nouvelle version de Skript vient d'être publiée ; vous pouvez la télécharger et consulter les changements ci-dessous.",
  dataProvider: 'Données fournies par https://github.com',
  timeDifference: 600_000,
};
