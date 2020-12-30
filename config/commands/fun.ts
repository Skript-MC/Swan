import { stripIndent } from 'common-tags';
import { Permissions } from 'discord.js';

const permissions = Permissions.FLAGS;

// eslint-disable-next-line import/prefer-default-export
export const poll = {
  settings: {
    aliases: ['poll', 'sondage'],
    clientPermissions: permissions.SEND_MESSAGES | permissions.MANAGE_MESSAGES | permissions.ADD_REACTIONS,
    userPermissions: [],
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
