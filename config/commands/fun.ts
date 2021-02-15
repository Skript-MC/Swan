import { stripIndent } from 'common-tags';
import { noPermissions, permissions } from '@/conf/configUtils';

export const eightBall = {
  settings: {
    aliases: ['8ball', 'eightball'],
    clientPermissions: permissions.SEND_MESSAGES,
    userPermissions: noPermissions,
  },
  details: {
    name: '8 Ball',
    content: "__Répond à toutes vos questions__, même les plus compliquées ! La légende raconte même qu'il y a déjà eu des bonnes réponses... :shushing_face:",
    usage: '8ball <votre question>',
    examples: ['8ball Dis moi mon beau miroir, suis-je le plus beau ?'],
  },
  messages: {
    promptStart: 'Je suis un bon devin, mais je ne peux pas deviner ta question. :confused: Entre-la en envoyant un message contenant seulement la question :',
    promptRetry: "Cette quetsion n'est pas valide. Entre-la en envoyant un message contenant seulement la question :",
    affirmative: [
      'Oui.',
      'Oui ! 🥳',
      "D'après moi, oui !",
      'Je le pense...',
      "C'est une chose sûre ! 😌",
      "C'est certain.",
      'Sans aucun doute ! 😁',
      'Il me semble...',
      'Pourquoi demander ? La réponse parait évidente ! Oui !',
      "ET C'EST UN OUI !",
      'Affirmatif, chef.',
      'Positif.',
      'BIEN ÉVIDEMMENT',
      'La réponse tient en un mot : oui.',
      'O U I',
      "C'est exact.",
      'Yep',
      'O̰̔͞u̝ͦ̕i̷̲̓',
      "C'est ca.",
      "Mais sources contradictoires m'affirment avec certitude que la réponse est positive. Bravo !",
      ':oui:',
    ],
    negative: [
        'Non.',
        'MDR NON',
        "C'est un non.",
        'Mes sources me confirment que non. 🙂',
        "C'est mieux que tu ne sois pas au courant... 😏",
        'Bien sur que non ! 😱',
        'Je ne suis pas sûr de comprendre...\nDans le doute, je vais dire non. 😅',
        'Question très compliquée...\nMais je dirai non. 😶',
        "Ou... Non ! C'est Non !",
        'Bien sur que non...',
        'Négatif.',
        'Je répondrai par la négation. Rah chui trop fort à ni-oui ni-non !\nTu ne me battras jamais. 😉',
        'Sûrement pas.',
        "Qui pourrait dire que c'est vrai ? C'est évidemment faux.",
        'N͔͑́o̧̰̔n̫̐͜',
        ':non:',
        'N O N',
        'Nopeee.',
        "Mercure est alignée avec Jupiter par Thor, donc selon le théorème d'Einstein et mon interprétation infaillible, la réponse est non.",
        'La réponse tient en seulement 3 lettres, dont 2 sont des "n" et celle du milieu est un "o". *(Ca ne rapporte pas beaucoup de point au scrabble.)*',
        'NoooooN',
    ],
  },
};

export const poll = {
  settings: {
    aliases: ['poll', 'sondage'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: noPermissions,
  },
  details: {
    name: 'Sondage',
    content: 'Permet de __lancer un sondage__ temporaire par lequel on peut répondre par Oui / Non ou par une réponse personnalisée. Ajoute le drapeau `-a` pour indique que le sondage sera anonyme, ~~ou le drapeau `-m` pour autoriser les réponses multiples~~ *(soon)*.',
    usage: 'poll <durée> [-a] [-m] "<sondage>" ["réponse 1"] ["réponse 2"] [...]',
    examples: ['poll 10m "votre sondage" "réponse 1" "réponse 2" "réponse 3" "réponse 4"', 'vote 10m Votre sondage ou on peut répondre uniquement par Oui et Non', 'sondage 10m "votre sondage" -a -m "réponse 1" "réponse 2"'],
  },
  messages: {
    promptStartDuration: 'Il faut ajouter une durée (en anglais ou en francais). Tu peux par exemple entrer `1s` pour 1 seconde, `1min` pour 1 minute et `1j` pour 1 jour. Tu peux également combiner ces durées ensemble : `5j15min300s` est par exemple une durée valide. Entre-la en envoyant un message contenant seulement la durée :',
    promptRetryDuration: "Cette durée n'est pas valide. Tu peux par exemple entrer `1s` pour 1 seconde, `1min` pour 1 minute et `1j` pour 1 jour. Tu peux également combiner ces durées ensemble : `5j15min300s` est par exemple une durée valide. Entre-la en envoyant un message contenant seulement la durée :",
    promptStartContent: "Ajoute un sondage à effectuer ! Si tu souhaites qu'on ne puisse répondre que par oui ou non, alors tu peux simplement marquer ta question. Sinon, écrit ta question entre guillements (`\"`), puis écrit les réponses possibles entre guillement également (`\"`). Par exemple, tu peux faire `.poll 10min \"Voici ma question\" \"Réponse 1\" \"Réponse 2\" \"Réponse 3\"`.",
    promptRetryContent: "Ce sondage n'est pas valide. Entre-le en envoyant un message contenant seulement ta question (et tes réponses si c'est un sondage à réponse multiples) :",
    notEnoughAnswers: "Tu n'as entré qu'une seule réponse. Ré-exécute la commande avec plusieurs réponses !",
    tooManyAnswers: 'Tu as entré trop de réponses. Ré-exécute la commande avec au maximum 18 réponses.',
    answersDisplayYesno: stripIndent`
      :white_check_mark: Oui
      :x: Non
    `,
    answersDisplayCustom: '{reaction} {answer}\n',
    informationAnonymous: 'Ce sondage est anonyme.',
    informationMultiple: 'Plusieurs réponses sont possibles.',
    embed: {
      author: 'Vote de {message.member.displayName}',
      question: 'Question',
      answers: 'Réponses possibles',
      duration: 'Durée',
      durationContent: 'Ce vote dure {formattedDuration} (fini {formattedEnd})',
    },
  },
};
