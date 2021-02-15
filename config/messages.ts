import { stripIndent } from 'common-tags';

export default {
  global: {
    oops: process.env.NODE_ENV === 'production'
      ? stripIndent`
        :warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée.
        > (Cc: <@188341077902753794>, <@191495299884122112>)`
      : ":warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée.",
    notAllowed: "Tu n'as pas la permission de faire cela :frowning:",
    insufficientClientPermissions: "Je n'ai pas les permissions Discord nécessaires pour exécuter la commande {command.details.name}. (Permissions manquantes : {permissions})",
    memberTooPowerful: "Je ne peux pas effectuer cette action pour ce membre ! Il se peut qu'il ait des permissions supérieures ou égales aux tiennes.",
    dmAreClosed: "Je ne peux pas t'envoyer les informations car tes messages privés sont restreints ! Pense bien à les activer :)",
    unknownName: 'Pseudo inconnu',
    unknown: (feminine = false): string => `Inconnu${feminine ? 'e' : ''}`,
    noReason: 'Aucune raison spécifiée.',
    impossibleBecauseBanned: "Impossible d'effectuer cette action car le membre est banni.",
  },
  miscellaneous: {
    noDescription: 'Aucune description disponible.',
    noDocLink: stripIndent`
      Tu ne peux pas poster ce lien ! Si la documentation de Skript-MC est incomplète, demande l'accès en écriture à Vengelis afin de l'améliorer.
      Voici ton message, si tu souhaites le récupérer : \`\`\`
      {content}
      \`\`\`
    `,
    noSpam: "Merci d'éviter les messages inutiles dans le salon des snippets. Ton message ne contient aucun bloc de code... Comment veux-tu partager ton script sans bloc de code ? Si tu ne sais pas comment faire, regarde ici : <https://support.discord.com/hc/fr/articles/210298617>.",
    invalidMessage: 'Ton message ne respecte pas le règlement du salon {message.channel}, il a donc été supprimé. Tu peux réessayer ou contacter un modérateur Discord pour en savoir plus.',
    commandSuggestion: "Je n'ai pas trouvé de commande qui correspond à {command.alias}... :confused: Voulais tu dire {commandList} ?\n:information_source: Clique sur les réactions pour lancer la commande associée.",
    ghostPingSingular: ':warning: {mentions}, tu as été ghost-ping par {member.displayName}. :innocent:',
    ghostPingPlural: ':warning: {mentions}, vous avez été ghost-ping par {member.displayName}. :innocent:',
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
    ],
  },
  prompt: {
    footer: '\n*Tape "retour" pour annuler cette commande.*',
    timeout: 'Temps écoulé !',
    ended: "Tu as fait trop d'erreurs...",
    canceled: 'Commande annulée !',
    cancelWord: 'retour',
    stopWord: 'stop',
  },
  moderation: {
    permanent: 'Définitif',
    never: 'jamais',
    alreadyModerated: "Cet utilisateur est déjà pris en charge par un autre modérateur ! Ta commande n'a pas été exécutée pour éviter les conflits ou les doublons. Sinon, réessaye dans quelques secondes.",
    memberHasClosedDm: "Je ne peux pas envoyer de message privé à ce membre, il n'a donc pas été prévenu de sa sanction. Je vous invite à lui en informer !",
    newCase: 'Nouveau cas ({action.data.sanctionId})',
    banExplanation: stripIndent`
      Bonjour {action.nameString}. Tu as été banni(e) par les modérateurs. Tu peux essayer de t'expliquer avec eux.
      Si tu quittes ce discord, tu seras banni(e) automatiquement, à vie. Cette conversation est sauvegardée.

      **Raison :** {action.data.reason}.
      **Durée :** {duration}.
      **Expire :** {action.expiration}.`,
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
      durationDescription: '\nExpire {action.expiration}',
      privateChannelTitle: ':speech_left: Salon privé',
      banlogTitle: ':scroll: Historique des messages',
      banlogAvailableDescription: 'Disponible ci-dessous',
      banlogUnavailableDescription: 'Indisponible',
    },
    sanctionNames: {
      banUpdate: 'Modification du bannissement',
      ban: 'Bannissement',
      hardban: 'Bannissement définitif',
      muteUpdate: "Modification du mute des salons d'aide",
      mute: "Mute des salons d'aide",
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
  },
  poll: {
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
  },
};
