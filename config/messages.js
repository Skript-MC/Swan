export default {
  global: {
    oops: process.env.NODE_ENV === 'production'
      ? ":warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée.\n> (Cc: <@188341077902753794>, <@191495299884122112>)"
      : ":warning: Oups... Quelque chose s'est mal passé en réalisant cette action. Il se peut qu'elle ne se soit pas complètement terminée, voire pas commencée. Veuillez contacter un des développeurs de Swan en le mentionnant (noftaly ou Romain).",
    notAllowed: "Tu n'as pas la permission de faire cela :frowning:",
    insufficientClientPermissions: "Je n'ai pas les permissions Discord nécessaires pour exécuter la commande {COMMAND}. (Permissions manquantes : {PERMISSIONS})",
    memberTooPowerful: 'Je ne peux pas effectuer cette action pour ce membre ! Il doit avoir des permissions supérieures ou égales aux tiennes.',
    dmAreClosed: "Je ne peux pas t'envoyer les informations car tes messages privés sont restreint ! Pense bien a les activer :)",
    unknownName: 'Pseudo Inconnu',
    noReason: 'Aucune raison spécifiée.',
  },
  miscellaneous: {
    noDocLink: "Tu ne peux pas poster ce lien ! Si la documentation de Skript-MC est incomplète, demande l'accès en écriture (à Vengelis) afin d'améliorer la documentation. Voici ton message, si tu souhaites le récupérer : ```\n{MESSAGE}\n```",
    noSpam: "Merci d'éviter les messages inutiles dans le salon des snippets. Ton message ne contient aucun bloc de code... Comment veux-tu partager ton script sans bloc de code ? Si tu ne sais pas comment faire, regarde ici : <https://support.discord.com/hc/fr/articles/210298617>.",
    invalidMessage: 'Votre message ne respecte pas le règlement du salon {CHANNEL}, il a donc été supprimé. Vous pouvez réessayer, ou contacter un Modérateur Discord pour en savoir plus.',
    ghostPingSingular: ':warning: {MENTIONS}, tu as été ghost-ping par {MEMBER}. :innocent:',
    ghostPingPlural: ':warning: {MENTIONS}, vous avez été ghost-ping par {MEMBER}. :innocent:',
    renamed: "Bienvenue sur le serveur Discord de Skript-MC !\nTon pseudonyme contenait des caractères spéciaux, donc je me suis permis de te les retirer (voire de te renommer complètement), pour que ce soit plus simple de te mentionner. J'espère que mes modifications te plairont.\nSi malheureusement ce n'est pas le cas, tu peux demander à un Modérateur Discord (pseudonymes vert clair) pour être renommé.",
    renameList: ['Quiche', 'Licorne', 'Tarte', 'Arachnoïde', 'Boulet', 'Banjo', 'Saperlipopette', 'Bizu', 'Tarentule'],
  },
  prompt: {
    footer: '\n*Tapez "retour" pour annuler cette commande.*',
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
    banExplanation: "Bonjour {MEMBER}. Tu as été banni(e) par les modérateurs. Tu peux essayer de t'expliquer avec eux.\nSi tu quittes ce discord, tu seras banni(e) automatiquement, à vie. Cette conversation est sauvegardée.\n\n**Raison :** {REASON}.\n**Durée :** {DURATION}.\n**Expire :** {EXPIRATION}.",
    reasons: {
      leaveBan: "Déconnexion du Discord lors d'un banissement (automatique)",
      autoBan: 'Inactivité après un bannissement (automatique)',
      autoRevoke: 'Sanction expirée (automatique)',
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
