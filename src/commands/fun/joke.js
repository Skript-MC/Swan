import Command from '../../components/Command';
import { config } from '../../main';

const jokes = [
    '**Un mec rentre dans un café.**\nEt plouf !',
    '**Pourquoi les crocos sont en prison ?**\nCar les crocos dealent',
    '**Quelle mamie fait peur aux voleurs ?**\nMamie Traillette',
    '**Quel est l\'aliment le plus hilarant ?**\nLe riz',
    '**Pourquoi est-ce que le lapin est bleu ?**\nParce qu’on lapin',
    '**D\'où viennent les gens les plus dangereux ?**\nD’Angers',
    '**Comment est-ce que les abeilles communiquent entre elles ?**\nPar e-miel',
    '**Quel est l\'arbre préféré des chômeurs ?**\nLe bouleau',
    '**Pourquoi est-ce que les moutons aiment le chewing-gum?**\nParce que c’est bon pour la laine',
    '**Que dit une noisette quand elle tombe à l\'eau ?**\nJe me noix',
    '**Quel fruit est assez fort pour couper des arbres?**\nLe ci-tron',
    '**Quel est le jambon que tout le monde déteste ?**\nLe sale ami',
    '**C\'est l\'histoire d\'un papier qui tombe à l\'eau.**\nIl crie « Au secours, j\'ai pas pied ! »',
    '**Que fait une fraise sur un cheval ?**\nTagada Tagada',
    '**Tu connais la blague de la chaise ?**\nElle est tellement longue',
    '**Tu connais l\'histoire de la chaise ?**\nElle est pliante',
    '**Comment appelle-t-on une catapulte à salade ?**\nUn lance-roquette',
    '**Comment appelle-t-on une bagarre entre une carotte et un petits pois ?**\nUn bon duel',
    '**Tu connais l\'histoire du lit vertical ?**\nElle est à dormir debout.',
    '**Tu veux une blague à deux balles ?**\nPan. Pan.',
    '**C\'est l\'histoire d\'un Schtroumpfs qui court, qui court... Et il tombe.**\nIl s\'est fait un bleu',
    '**Tu connais la blague du p\'tit déj\' ?**\nPas de bol',
    '**Tu connais la blague de l\'armoire ?**\nElle est pas commode',
    '**Quel super héros donne le plus vite l\'heure ?**\nSpeed heure man',
    '**La vitamine C ne dira rien.**\nMais elle le sais.',
    '**Qu’est ce que ça veut dire : « I don’t know » ?**\n« Je sais pas »',
    '**Quelle est la femelle du hamster ?**\nL\'Amsterdam',
    '**Que dit un oignon quand il se cogne ?**\nAïe',
    '**Quel est le comble pour un marin ?**\nAvoir le nez qui coule',
    '**Quel est le sport le plus silencieux ?**\nLe para-chuuuut',
    '**Pourquoi ne faut-il jamais raconter d\'histoires drôles à un ballon ?**\nParce qu\'il pourrait éclater (de rire)',
    '**Quel est l\'animal le plus à la mode ?**\nLa taupe modèle',
    '**Comment appelle t-on une fleur qui prend sa graine à moitié ?**\nUne migraine',
    '**J\'ai fait une blague au magasin**\nMais elle a pas supermarché',
    '**Pourquoi est-ce si difficile de conduire dans le Nord ?**\nParce que les voitures arrêtent pas de caler',
    '**Qu\'est-ce qu\'un tennisman adore faire ?**\nRendre des services',
    '**Pourquoi est-ce que les livres ont-ils toujours chaud ?**\nParce qu\'ils ont une couverture',
    '**Que se passe-t-il quand 2 poissons s\'énervent ?**\nLe thon monte',
    '**Que dit une imprimante dans l\'eau ?**\nJ\'ai papier',
    '**Pourquoi est-ce que les bières sont toujours stressées ?**\nParce qu\'elles ont la pression',
    '**Pourquoi est-ce que les éoliennes n\'ont pas de copain ?**\nParce qu’elles se prennent toujours des vents',
    '**Qu\'est ce qu\'un cadeau qui s\'en va ?**\nUne surprise party',
    '**Comment savoir qu\'un rat est content ?**\nIl souris',
    '**Que fait un geek quand il a peur ?**\nIl URL',
    '**Qu\'est-ce qui est pire que le vent ?**\nUn vampire',
    '**Que dit une mère à son fils geek quand le dîner est servi ?**\nAlt Tab',
    '**Quelle est la meilleure heure pour écouter de la musique ?**\n10h',
    '**Que fait un geek quand il descend du métro ?**\nIl libère la RAM',
    '**Quel est l\'animal le plus connecté ?**\nLe porc USB',
    '**Que fait un jardinier quand il ment ?**\nIl raconte des salades',
    '**Quel est le crustacé le plus léger de la mer ?**\nLa palourde',
];

class Joke extends Command {
    constructor() {
        super('Joke');
        this.regex = /(joke|blague|rire)/gimu;
        this.usage = 'joke';
        this.examples.push('joke');
    }

    async execute(message, _args) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        const embed = new Discord.RichEmbed()
            .setColor(config.colors.default)
            .setTimestamp()
            .setDescription(joke)
            .setFooter(`Executé par ${message.author.username}`);
        message.channel.send(embed);
    }
}

export default Joke;
