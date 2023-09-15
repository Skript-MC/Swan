import { Identifiers } from '@sapphire/framework';
import { stripIndent } from 'common-tags';

export const global = {
  oops: process.env.NODE_ENV === 'production'
    ? stripIndent`
      :warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée.
      > (Cc: <@188341077902753794>, <@191495299884122112>)`
    : ":warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée.",
  memberTooPowerful: "Je ne peux pas effectuer cette action pour ce membre ! Il se peut qu'il ait des permissions supérieures ou égales aux tiennes.",
  dmAreClosed: "{member}, je ne peux pas t'envoyer les informations car tes messages privés sont restreints ! Pense bien à les activer :)",
  unknownName: 'Pseudo inconnu',
  everyone: 'Tout le monde',
  unknown: (feminine = false): string => `Inconnu${feminine ? 'e' : ''}`,
  noReason: 'Aucune raison spécifiée.',
  impossibleBecauseBanned: "Impossible d'effectuer cette action car le membre est banni.",
} as const;

export const errors = {
  precondition: {
    [Identifiers.PreconditionNotLoading]: 'Attends un peu, le temps que je finisse de me réveiller...',
    [Identifiers.PreconditionRunIn]: ':x: Aïe, cette commande ne peut être utilisée ici :confused:',
    unknownError: "Une pré-condition de commande inconnue t'empêche d'effectuer cette action.",
  },
} as const;

export const miscellaneous = {
  noDescription: 'Aucune description disponible.',
  noSpam: "Merci d'éviter les messages inutiles dans le salon des snippets. Ton message ne contient aucun bloc de code... Comment veux-tu partager ton script sans bloc de code ? Si tu ne sais pas comment faire, regarde ici : <https://support.discord.com/hc/fr/articles/210298617>.",
  wrongUserInteractionReply: 'Tu ne peux pas cliquer sur ces boutons, ils sont réservés à {user}.',
  ghostPingSingular: ':warning: {mentions}, tu as été ghost-ping par {user.username}. :innocent:',
  ghostPingPlural: ':warning: {mentions}, vous avez été ghost-ping par {user.username}. :innocent:',
  greetings: [
    '{member} arrive, faites comme si vous étiez occupés ! :books:',
    "Aujourd'hui, nous accueillons {member} !",
    'On dit bonjour à {member}. *Tous en choeur* Boooonnnjouuuur {member}...',
    'Holà {member} ! Bienvenue !',
    "On t'attendait, {member} ! Prend place.",
    'Bienvenue sur Skript-MC, {member} !',
    '{member} rejoint la fête ;)',
    '{member} est arrivé ! La fête peut commencer ! :partying_face:',
    "Salut {member} ! Le voyage s'est bien passé ?",
    "Félicitations {member} ! Tu as réussi à venir jusqu'ici sans te casser de jambes ;)",
    'Faites place, {member} est parmi nous !',
    "Ne soyez pas timides ! Dites bonjour à {member}, qui vient d'arriver :)",
    '{member} vient de se glisser dans le serveur...',
    'Content de te voir, {member} :)',
    "{member} vient juste d'atterrir...",
    'Acclamez {member} ! Je ne sais pas pourquoi, mais acclamez-le !',
    "Suis-je censé dire bonjour à {member} ? Après tout je ne suis qu'un bot...",
  ],
} as const;

export const prompt = {
  channel: 'Le salon donné est invalide.',
  duration: 'La durée donnée est invalide. Tu peux par exemple entrer `1s` pour 1 seconde, `1min` pour 1 minute et `1j` pour 1 jour. Tu peux également combiner ces durées ensemble : `5j15min300s` ou `1h30` sont par exemple des durées valides.',
  member: "Le membre donné est invalide, il se peut qu'il ne soit pas sur le Discord ou que tu aies fait une faute de frappe. Tu peux le mentionner, entrer son identifiant discord, ou simplement son pseudo.",
  number: 'Le nombre donné est invalide.',
  pollAnswers: 'Le sondage et/ou les réponses données sont invalides.',
  timeout: 'Tu as mis trop de temps à répondre, la commande a été annulée.',
} as const;

export const moderation = {
  permanent: 'Définitif',
  never: 'jamais',
  alreadyModerated: "Cet utilisateur est déjà pris en charge par un autre modérateur ! Ta commande n'a pas été exécutée pour éviter les conflits ou les doublons. Sinon, réessaye dans quelques secondes.",
  memberHasClosedDm: "Je ne peux pas envoyer de message privé à ce membre, il n'a donc pas été prévenu de sa sanction. Je vous invite à lui en informer !",
  newCase: 'Nouveau cas ({action.data.sanctionId})',
  banExplanation: stripIndent`
    Bonjour {nameString}. Tu as été banni(e) par les modérateurs. Tu peux essayer de t'expliquer avec eux.
    Si tu quittes ce discord, tu seras banni(e) automatiquement, à vie. Cette conversation est sauvegardée.

    **Raison :** {reason}.
    **Durée :** {duration}.
    **Expire :** {expiration}.`,
  durationChange: 'Durée passée de {oldDuration} à {newDuration}',
  reasons: {
    leaveBan: "Déconnexion du Discord lors d'un bannissement (automatique)",
    autoBanInactivity: 'Inactivité après un bannissement (automatique)',
    autoRevoke: 'Sanction expirée (automatique)',
    revokeWarnsLimitExceeded: 'Avertissement révoqué car la limite a été atteinte : le membre a été sanctionné (automatique)',
    autoBanWarnLimitExceeded: "Limite d'avertissement atteinte (automatique)",
  },
  log: {
    userTitle: ':bust_in_silhouette: Utilisateur',
    moderatorTitle: ':cop: Modérateur',
    actionTitle: ':tools: Action',
    reasonTitle: ':label: Raison',
    durationTitle: ':stopwatch: Durée',
    durationDescription: '\nExpire {expiration}',
    banlogTitle: ':scroll: Historique des messages',
    banlogAvailableDescription: 'Disponible ci-dessous',
    banlogUnavailableDescription: 'Indisponible',
  },
  sanctionNames: {
    banUpdate: 'Modification du bannissement',
    tempBan: 'Bannissement temporaire',
    hardban: 'Bannissement définitif',
    muteUpdate: "Modification du mute des salons d'aide",
    mute: 'Mute',
    kick: 'Expulsion',
    warn: 'Avertissement',
    unban: 'Débannissement',
    unmute: 'Démute',
    removeWarn: "Suppression d'avertissement",
  },
  updateNames: {
    revoked: 'Révocation',
    duration: 'Durée',
  },
} as const;

export const poll = {
  alreadyVoted: 'Tu as déjà voté pour ce choix !',
  dmSent: "{member}, je t'ai envoyé plus d'informations en privé !",
  informationsYesNo: stripIndent`
    **Informations sur les sondages :**
    Réagissez par :white_check_mark: pour voter **Oui** à la question posée, ou réagissez par :x: pour voter **Non**.
    Au bout du temps défini, le décompte des votes est fait.
    Si tu enlèves ta réaction, elle sera tout de même comptée. Si tu mets plusieurs réactions, c'est la dernière mise qui sera comptée. Le vote commence lorsque l'embed devient bleu.
    Le créateur du vote peut l'arrêter en cliquant sur le :octagonal_sign:.
  `,
  informationsCustom: stripIndent`
    **Informations sur les sondages :**
    Tu peux réagir avec :one:, :two:, :three: etc. pour voter pour la réponse qui te convient.
    Au bout du temps défini, le décompte des votes est fait.
    Si tu enlèves ta réaction, elle sera tout de même comptée. Si tu mets plusieurs réactions, c'est la dernière mise qui sera comptée. Le vote commence lorsque l'embed devient bleu.
    Le créateur du vote peut l'arrêter en cliquant sur le :octagonal_sign:.
  `,
  resultYesno: stripIndent`
    :white_check_mark: : {yes} oui ({percentageYes}%)
    :x: : {no} non ({percentageNo}%)
  `,
  resultCustomLine: '{reaction} : {amount} {answer} ({percentage}%)\n',
  totalVoters: '\n:bust_in_silhouette: : {totalVoters} votant(s).',
  pollEnded: 'Ce vote est terminé !',
  stopped: '*(arrêté)*',
  results: 'Résultats',
} as const;

export const suggestions = {
  brand: 'Suggestions Skript-MC',
  loginButton: 'Connexion à Skript-MC',
  registeredVote: {
    title: 'Vote enregistré',
    content: 'Votre vote a bien été comptabilisé pour cette suggestion : celle-ci sera prochainement traitée et débattue avec la communauté en tenant compte votre vote.',
  },
  unlinked: {
    title: '🔗 Liaison requise',
    content: 'Il semblerait que votre compte Discord ne corresponde à aucun compte Skript-MC. Pour pouvoir bénéficier des intégrations sur notre serveur Discord, il est nécessaire de lier votre compte Discord à votre compte Skript-MC.\n\nNos lutins vous ont préparé un lien magique : il ne vous suffit plus qu\'à vous connecter à votre compte Skript-MC, et vous bénéficierez des intégrations sur notre serveur Discord.',
  },
  alreadyVoted: {
    title: 'Vote déjà comptabilisé',
    content: "Votre vote a déjà été pris en compte pour cette proposition. Il vous est cependant possible de modifier votre vote en cliquant sur l'autre proposition.",
  },
  selfVote: {
    title: 'Vote non autorisé',
    content: "Vous vous en doutiez, il est impossible de voter pour ou contre une suggestion dont vous êtes l'auteur. Ceci étant dit, bien essayé...",
  },
  error: {
    title: '🤖 Une erreur est survenue',
    content: 'On dirait bien que quelque chose ne fonctionne pas comme il devrait. Réessayez dans quelques instants ou consultez les suggestions directement sur [les suggestions de Skript-MC](https://skript-mc.fr/suggestions).',
  },
  published: {
    title: 'Suggestion publiée',
    content: "Merci pour votre suggestion ! Elle a été publiée sur toutes les plateformes de Skript-MC et la communauté va voter votre suggestion. Elle sera prochainement traitée avec la communauté et l'équipe, et peut-être appliquée (qui sait 👀).",
  },
} as const;
