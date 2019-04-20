# Skript-mc-Bot

C'est le bot de Skript-MC.

# Installation

 - 0 Installer Nodejs
 - 1 Télécharger l'archive du projet.
 - 2 Extraire le projet
 - 3 Aller dans le répertoir du projet à partir de la console (command prompt pour Windows, shell pour linux, terminal pour macOS)
 - 4 Faire ``npm i`` dans la console 
 - 5 Executer le bot à l'aide de la commande ``npm start``

**Bonus:** Vous pouvez améliorer votre qualité de codage à l'aide de ``eslint``, qui, dans Visual Studio Code, se présente sous la forme d'une extension.

# Utilisation

Les commandes sont en plusieurs parties:
 - regex: Votre commande, sous la forme d'un regex.
 - permissions: Une liste de permissions sous forme de string qui permet à l'utilisateur d'executer la commande si il possède le rôle de la permission.
 - execute: Le code de votre commande, sous la forme d'une fonction (fléchée de préférence).


# Todo

 - [ ] Finir le système de vote (command "Poll")
 - [ ] Fixer la commande d'aide (command "Help") (EN COURS: Noftaly)
 - [ ] Faire la partie musicale:
    - Système de playlist:
        - [ ] Création de playlist
        - [ ] Suppression de playlist
        - [ ] Sauvegarde de playlist
        - [ ] Ajout de titres dans la playlist
    - Système de blindtest:
        - [ ] Pouvoir lancer un blindtest à partir d'une playlist (youtube ou personnel)

Lorsqu'une partie est finie, mettez y une croix (tel que: ``[x]``)