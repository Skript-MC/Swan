import type { TaskOptions } from '@/app/structures/tasks/Task';

export const forumFeed = {
  settings: {
    cron: '*/10 * * * *',
    category: 'periodic',
    description: 'Récupère toutes les 10 minutes les derniers sujets du forum et les envoie dans le salon dédié.',
  } as TaskOptions,
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
};

export const moderation = {
  settings: {
    interval: 10_000,
    category: 'periodic',
    description: 'Effectue toutes les 10 secondes des actions de modération internes.',
  } as TaskOptions,
};

export const poll = {
  settings: {
    interval: 10_000,
    description: 'Vérifie toutes les 10 secondes le statut des sondages créés et les met à jour.',
  },
};

export const presence = {
  settings: {
    cron: '* * * * *',
    category: 'periodic',
    description: 'Met à jour toutes les minutes le statut de présence de Swan.',
  } as TaskOptions,
  messages: [
    '{memberCount} membres 🎉',
    '{prefix}aide | Skript-MC',
  ],
};

export const skriptReleases = {
  settings: {
    cron: '*/10 * * * *',
    category: 'periodic',
    immediate: true,
    description: 'Vérifie toutes les 10 minutes les mises à jour disponibles de Skript et envoie un résumé des changements.',
  } as TaskOptions,
  releaseAnnouncement: "Une nouvelle version de Skript vient d'être publiée ; vous pouvez la télécharger et consulter les changements ci-dessous.",
  githubEndpoint: '/repos/SkriptLang/Skript/releases',
  dataProvider: 'Données fournies par https://github.com',
  timeDifference: 600_000,
};

export const suggestions = {
  settings: {
    cron: '*/10 * * * *',
    category: 'periodic',
    description: 'Synchronise toutes les 10 minutes les suggestions de Skript-MC.',
  } as TaskOptions,
};
