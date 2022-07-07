import type { TaskOptions } from '@/app/structures/tasks/Task';

export const addReactionsInIdeaChannel = {
  settings: {
    description: 'Ajoute les réactions aux nouveaux messages envoyés dans le salon des snippets',
    category: 'messageCreate',
  } as TaskOptions,
};

export const antiSpamSnippetsChannel = {
  settings: {
    description: 'Vérifie que les nouveaux messages envoyés dans le salon des snippets ne sont pas des spams, qu\'ils contiennent bien du code',
    category: 'messageCreate',
  } as TaskOptions,
};

export const handleSuggestion = {
  settings: {
    description: 'Envoie une requête aux suggestions de Skript-MC pour créer de nouvelles suggestions',
    category: 'messageCreate',
  } as TaskOptions,
};

export const quoteLinkedMessage = {
  settings: {
    description: 'Vérifie si le message contient un lien d\'un autre message, et se charge d\'envoyer un embed avec le contenu du message lié',
    category: 'messageCreate',
  } as TaskOptions,
};

export const updateMemberIfBanned = {
  settings: {
    description: 'Met à jour le membre en indiquant qu\'il a envoyé un message dans son salon du banni',
    category: 'messageCreate',
  } as TaskOptions,
};
