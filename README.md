# Skript-mc-Bot

C'est le bot de Skript-MC.

# Installation

 - 0 Installer Nodejs
 - 1 Télécharger l'archive du projet.
 - 2 Extraire le projet
 - 3 Aller dans le répertoir du projet à partir de la console (command prompt pour Windows, shell pour linux, terminal pour macOS)
 - 4 Faire ``npm i`` dans la console 
 - 5 Executer le bot à l'aide de la commande ``npm start``

# Utilisation

Les commandes sont en plusieurs parties:

 - **(obligatoire) name:** Le nom de votre commande.
 - **(obligatoire) description:** La description de votre commande.
 - **(obligatoire) regex:** Votre commande, sous la forme d'un regex.
 - **(obligatoire) examples:** Des exemples d'utilisation de votre commande.
 - **(facultatif) permissions:** Une liste de permissions sous forme de string qui permet à l'utilisateur d'executer la commande si il possède le rôle de la permission. Pour ajouter une (ou plusieurs) permission(s) aux permissions par défaut, vous devez utiliser ``this.permissions.concat(['Vos roles en array']);`` (ou ajouter les role à l'aide de la méthode "setup")
 - **(facultatif) channels:** Une liste de channels/salon de discussion sous forme de string qui permet à l'utilisateur d'executer la commande si il est dans le channel adéquate. Pour ajouter une (ou plusieurs) channel(s) aux channels par défaut, vous devez utiliser ``this.channels.concat(['Les id de vos channels en array']);`` (ou ajouter les id des channels à l'aide de la méthode "setup")
 - **(facultatif) setup:** La partie de votre code qui sera executé pendant le chargement de votre commande, sous la forme d'une fonction (fléchée de préférence).
 - **(obligatoire) execute:** Le code de votre commande, sous la forme d'une fonction (fléchée de préférence).

# Todo

 - [ ] Faire la partie musicale:
    - Système de playlist:
        - [ ] Création de playlist
        - [ ] Suppression de playlist
        - [ ] Sauvegarde de playlist
        - [ ] Ajout de titres dans la playlist
    - Système de blindtest:
        - [ ] Pouvoir lancer un blindtest à partir d'une playlist (youtube ou personnel)
 - [ ] Faire la partie modération:
    - [ ] .warn [pseudo] [raison]
    - [ ] .mute [pseudo] [temps] [raison] (donne le rôle "bâillonné")
    - [ ] .ban [pseudo] [temps] [raison] (créé un canal qui va attribuer la permission au staff de voir et de parler avec le gars en question dans une catégorie spéciale + lui donne le rôle sous-fifre)
    - [ ] Pour chaque interaction de modération faut que ça laisse un log dans un canal configurable

Lorsqu'une partie est finie, mettez y une croix (tel que: ``[x]``)
