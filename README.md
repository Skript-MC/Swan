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

 - [ ] Faire la partie musicale:
    - Système de playlist:
        - [ ] Création de playlist
        - [ ] Suppression de playlist
        - [ ] Sauvegarde de playlist
        - [ ] Ajout de titres dans la playlist
    - Système de blindtest:
        - [ ] Pouvoir lancer un blindtest à partir d'une playlist (youtube ou personnel)
 - [x] Faire la partie modération:
    - [x] .warn [pseudo] [raison]
    - [x] .mute [pseudo] [temps] [raison] (donne le rôle "bâillonné")
    - [x] .ban [pseudo] [temps] [raison] (créé un canal qui va attribuer la permission au staff de voir et de parler avec le gars en question dans une catégorie spéciale + lui donne le rôle sous-fifre)
    - [x] Pour chaque interaction de modération faut que ça laisse un log dans un canal configurable
