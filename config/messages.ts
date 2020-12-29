import { stripIndent } from 'common-tags';

export default {
  global: {
    oops: process.env.NODE_ENV === 'production'
      ? stripIndent`
        :warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée.
        > (Cc: <@188341077902753794>, <@191495299884122112>)`
      : ":warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée.",
    notAllowed: "Tu n'as pas la permission de faire cela :frowning:",
    insufficientClientPermissions: "Je n'ai pas les permissions Discord nécessaires pour exécuter la commande {COMMAND}. (Permissions manquantes : {PERMISSIONS})",
    memberTooPowerful: "Je ne peux pas effectuer cette action pour ce membre ! Il se peut qu'il ait des permissions supérieures ou égales aux tiennes.",
    dmAreClosed: "Je ne peux pas t'envoyer les informations car tes messages privés sont restreints ! Pense bien à les activer :)",
    unknownName: 'Pseudo inconnu',
    noReason: 'Aucune raison spécifiée.',
    impossibleBecauseBanned: "Impossible d'effectuer cette action car le membre est banni.",
  },
  miscellaneous: {
    noDocLink: stripIndent`
      Tu ne peux pas poster ce lien ! Si la documentation de Skript-MC est incomplète, demande l'accès en écriture à Vengelis afin d'améliorer la documentation.
      Voici ton message, si tu souhaites le récupérer : \`\`\`
      {MESSAGE}
      \`\`\`
    `,
    noSpam: "Merci d'éviter les messages inutiles dans le salon des snippets. Ton message ne contient aucun bloc de code... Comment veux-tu partager ton script sans bloc de code ? Si tu ne sais pas comment faire, regarde ici : <https://support.discord.com/hc/fr/articles/210298617>.",
    invalidMessage: 'Ton message ne respecte pas le règlement du salon {CHANNEL}, il a donc été supprimé. Tu peux réessayer, ou contacter un modérateur Discord pour en savoir plus.',
    ghostPingSingular: ':warning: {MENTIONS}, tu as été ghost-ping par {MEMBER}. :innocent:',
    ghostPingPlural: ':warning: {MENTIONS}, vous avez été ghost-ping par {MEMBER}. :innocent:',
    renamed: stripIndent`
      Ton pseudonyme contenait des caractères spéciaux, donc je me suis permis de te les retirer (voire de te renommer complètement), pour que ce soit plus simple de te mentionner. J'espère que mes modifications te plairont.
      Si malheureusement ce n'est pas le cas, tu peux demander à un modérateur Discord (pseudonymes vert clair) pour être renommé.`,
    renameList: [
      'Arachnoïde',
      'Banjo',
      'Bizu',
      'Boulet',
      'Licorne',
      'Quiche',
      'Saperlipopette',
      'Tarentule',
      'Tarte',
    ],
    greetings: [
      '{MEMBER} arrive, faites comme si vous étiez occupés ! :books:',
      "Aujourd'hui, nous accueillons {MEMBER} !",
      'On dit bonjour à {MEMBER}. *Tous en choeur* Boooonnnjouuuur {MEMBER}...',
      'Holà {MEMBER} ! Bienvenue !',
      "On t'attendait, {MEMBER} ! Prend place.",
      'Bienvenue sur Skript-MC, {MEMBER} !',
      '{MEMBER} rejoint la fête ;)',
      '{MEMBER} est arrivé ! La fête peut commencer ! :partying_face:',
      "Salut {MEMBER} ! Le voyage s'est bien passé ?",
      "Félicitations {MEMBER} ! Tu as réussi à venir jusqu'ici sans te casser de jambes ;)",
      'Faites place, {MEMBER} est parmi nous !',
      "Ne soyez pas timides ! Dites bonjour à {MEMBER}, qui vient d'arriver :)",
      '{MEMBER} vient de se glisser dans le serveur...',
      'Content de te voir, {MEMBER} :)',
      "{MEMBER} vient juste d'attérir...",
    ],
  },
  prompt: {
    footer: '\n*Tape "retour" pour annuler cette commande.*',
    timeout: 'Temps écoulé !',
    ended: "Tu as fait trop d'erreurs....",
    canceled: 'Commande annulée !',
    cancelWord: 'retour',
    stopWord: 'stop',
  },
  moderation: {
    permanent: 'Définitif',
    never: 'jamais',
    memberHasClosedDm: "Je ne peux pas envoyer de message privé à ce membre, il n'a donc pas été prévenu de sa sanction. Je vous invite à l'en lui informer !",
    newCase: 'Nouveau cas ({ID})',
    banExplanation: stripIndent`
      Bonjour {MEMBER}. Tu as été banni(e) par les modérateurs. Tu peux essayer de t'expliquer avec eux.
      Si tu quittes ce discord, tu seras banni(e) automatiquement, à vie. Cette conversation est sauvegardée.

      **Raison :** {REASON}.
      **Durée :** {DURATION}.
      **Expire :** {EXPIRATION}.`,
    durationChange: 'Durée passée de {OLD_DURATION} à {NEW_DURATION}',
    reasons: {
      leaveBan: "Déconnexion du Discord lors d'un banissement (automatique)",
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
      durationDescription: '\nExpire {EXPIRATION}',
      privateChannelTitle: ':speech_left: Salon privé',
    },
    sanctionNames: {
      banUpdate: 'Modification du bannisseemnt',
      ban: 'Bannissement',
      hardban: 'Banissement définitif',
      muteUpdate: "Modification du mute des salons d'aide",
      mute: "Mute des salons d'aide",
      kick: 'Expulsion',
      warn: 'Avertissement',
      unban: 'Débanissement',
      unmute: 'Démute',
      removeWarn: "Suppression d'avertissement",
    },
    updateNames: {
      revoked: 'Révoquation',
      duration: 'Durée',
    },
  },
};
