# Skript-mc-Bot

Bot discord de Skript-MC.

# Installation

 - 0 Installer [nodejs](https://nodejs.org/fr/)
 - 1 Télécharger l'archive du projet.
 - 2 Extraire le projet
 - 3 Aller dans le répertoir du projet à partir de la console (command prompt pour Windows, shell pour linux, terminal pour macOS)
 - 4 Faire `npm i` dans la console 
 - 5 Renommer `.env.dist` en `.env`, puis y mettre vos tokens d'API
 - 6 Remplissez les champs dans la config
 - 7 Executer le bot à l'aide de la commande `npm start`

# Report des bugs / Suggestions

Si vous avez repéré un bug avec le bot, ou que vous avez une suggestion, alors n'hésitez pas et créez une nouvelle [issue](https://github.com/Skript-MC/Swan/issues) ! Décrivez votre bug ou votre suggestion avec un maximum de précision, ajoutez des screens etc.

# Contribution

Si jamais vous avez des bases en nodejs et que vous avez une idée pour le bot, vous pouvez essayer de la développer ! N'hésiter pas ensuite à faire une PR, qui sera ensuite acceptée ou refusée. Certaines règles s'imposent cependant : éviter d'ajouter trop de dépendence, et utilisez au maximum celles déjà disponibles, respectez les règles eslint, mettez vos clés d'apis/tokens dans le fichier `.env` et non dans le code.

# Todo

__Par ordre de priorité :__
 - [ ] Refaire la commande .doc dès que l'api de la doc skript-mc est dispo
 - [ ] Ajouter système de musique
 - [ ] Gestion d'évènements (blindtests etc)
 - [ ] Commande de réunion `.reunion date heure raison`. Ex : `.reunion 20/05 18h le texte de l'annonce de la reunion`, et ça poste tout les x jours avant la réuninon a x heure un rappel pour la réunion. Puis ça poste un message le jour x et l'heure x.
 - [ ] Hook avec le site, par exemple :
        • Poster un message quand y'a une nouvelle ressource
        • Avoir une commande pour rechercher des posts genre `.forum <section> <forum> recherche` ex: `.forum Skript Aide gui`, avec pourquoi pas un argument `-resolved` pour chercher que parmis les posts résolus
 - [ ] Ajouter un argument dans le .unban pour que le channel ne soit pas supprimé
