import { stripIndent } from 'common-tags';
import { Rules } from '@/app/types';
import { basePreconditions, channelRulesPrecondition } from '@/conf/configUtils';

export const eightBall = {
  settings: {
    name: '8 Ball',
    aliases: ['8ball', 'eightball'],
    description: 'Répond à toutes vos questions, même les plus compliquées ! Réponse sûre garantie à 7%.',
    usage: '8ball <votre question>',
    examples: ['8ball Dis moi mon beau miroir, suis-je le plus beau ?'],
  },
  messages: {
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

export const idea = {
  settings: {
    name: 'Idée',
    aliases: ['idea', 'idée', 'idee'],
    description: "Permet d'envoyer une __idée de script__ aléatoire à réaliser parmi celles dans le salon des idées.",
    usage: 'idée',
    examples: ['idea', 'idée'],
    preconditions: [...basePreconditions, channelRulesPrecondition(Rules.NoHelpChannel)],
  },
  messages: {
    noIdeaFound: "Je n'ai trouvé aucune idée dans le salon !",
    ideaTitle: 'Idée de {name} :',
  },
};

export const joke = {
  settings: {
    name: 'Blague',
    aliases: ['joke', 'blague'],
    description: '__Envoie une blague__ aléatoirement, généralement drôle mais pas forcément.',
    usage: 'joke',
    examples: ['joke', 'blague'],
    preconditions: [...basePreconditions, channelRulesPrecondition(Rules.NoHelpChannel)],
  },
  messages: {
    notFound: "Aucune blague correspondante à votre recherche n'a été trouvée.",
  },
};

export const latex = {
  settings: {
    name: 'Latex',
    aliases: ['latex'],
    description: 'Permet de mettre en forme une équation grâce au moteur mathématique LaTeX.',
    usage: 'latex <equation>',
    examples: ['latex x = \\frac{4}{5}+\\pi\\Omega\\int_{2\\pi}^{\\infty}{5\\left\\(\\\\frac{\\tau+3}{2}\\right\\)d\\omega}'],
  },
  messages: {},
};

export const poll = {
  settings: {
    name: 'Sondage',
    aliases: ['poll', 'sondage'],
    description: 'Permet de __lancer un sondage__ temporaire par lequel on peut répondre par Oui / Non ou par une réponse personnalisée. Ajoute le drapeau `-a` pour indique que le sondage sera anonyme, ~~ou le drapeau `-m` pour autoriser les réponses multiples~~ *(soon)*.',
    usage: 'poll <durée> [-a] [-m] "<sondage>" ["réponse 1"] ["réponse 2"] [...]',
    examples: ['poll 10m "votre sondage" "réponse 1" "réponse 2" "réponse 3" "réponse 4"', 'vote 10m Votre sondage ou on peut répondre uniquement par Oui et Non', 'sondage 10m "votre sondage" -a -m "réponse 1" "réponse 2"'],
  },
  messages: {
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
