# Documentation de Swan

Cette page regroupe les **48 commandes** disponibles sur Swan.

## Accès rapides

- [8ball](#8ball)
- [Addon Info](#Addon-Info)
- [Addon Pack](#Addon-Pack)
- [Automatic Messages](#Automatic-Messages)
- [Ban](#Ban)
- [Bassboost](#Bassboost)
- [Change Config](#Change-Config)
- [Code](#Code)
- [Discover](#Discover)
- [Error Details](#Error-Details)
- [Ghostping](#Ghostping)
- [Help](#Help)
- [History](#History)
- [Idée](#Idée)
- [Join](#Join)
- [Joke](#Joke)
- [Kick](#Kick)
- [Leave](#Leave)
- [Links](#Links)
- [Loop](#Loop)
- [Mathematiques](#Mathematiques)
- [Move Message](#Move-Message)
- [Mute](#Mute)
- [Now Playing](#Now-Playing)
- [Pause](#Pause)
- [Ping](#Ping)
- [Play](#Play)
- [Player Info](#Player-Info)
- [Poll](#Poll)
- [Purge](#Purge)
- [Queue](#Queue)
- [Ranking](#Ranking)
- [Remove Warn](#Remove-Warn)
- [Rules](#Rules)
- [Server Info](#Server-Info)
- [Shuffle](#Shuffle)
- [Skip](#Skip)
- [Skript Info](#Skript-Info)
- [Statistics](#Statistics)
- [Status](#Status)
- [Stop](#Stop)
- [Tag Role](#Tag-Role)
- [Toggle role notification](#Toggle-role-notification)
- [Unban](#Unban)
- [Unmute](#Unmute)
- [User Info](#User-Info)
- [Volume](#Volume)
- [Warn](#Warn)

## Commandes


### <a name="8ball"></a>8ball

- **Catégorie :** fun
- **Description :** Réponse personnalisée par Oui ou Non à une n'importe quelle question ! Réponse sûre garantie à 7%.
- **Alias :** `8ball`
- **Usage :** `8ball <question>`
- **Exemples :** `8ball suis-je le plus beau ?`


### <a name="Addon-Info"></a>Addon Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un addon, telles que son auteur, sa dernière version, un lien de téléchargement, si l'addon est déprecié, les dépendances...
- **Alias :** `addoninfo`, `addon_info`, `addon-info`
- **Usage :** `addon-info <addon>`
- **Exemples :** `addon-info skquery-lime`, `addoninfo mirror`


### <a name="Addon-Pack"></a>Addon Pack

- **Catégorie :** basic
- **Description :** Envoie un pack d'addon correspondant à une certaine version de Minecraft.
Si vous connaissez une version plus récente d'un addon fonctionnant dans une certaine version de minecraft, n'hésitez pas a contacter les devs ou à vous rendre sur le Discord de développement (lien disponible dans les messages épinglés de #bot).
- **Alias :** `addonpack`, `addon_pack`, `addon-pack`
- **Usage :** `addon-pack <votre version de serveur>`
- **Exemples :** `addon-pack 1.14`


### <a name="Automatic-Messages"></a>Automatic Messages

- **Catégorie :** basic
- **Description :** Envoie un message prédéfini parmis ceux-là : `%s`. Merci de ne pas abuser de cette commande, et de l'exécuter seulement si besoin.
- **Alias :** `automaticmessage`, `automaticmessages`, `automsg`, `auto_msg`, `auto-msg`, `auto`
- **Usage :** `automsg <nom du message>`
- **Exemples :** `automsg asktoask`


### <a name="Ban"></a>Ban

- **Catégorie :** moderation
- **Description :** Applique une restriction du Discord à un membre.
- **Alias :** `ban`, `sdb`
- **Usage :** `ban <@mention | ID> <durée> <raison> [--autoban]`
- **Exemples :** `ban @Uneo7 5j Mouahaha --autoban`, `ban @Vengelis_ def Tu ne reviendras jamais !`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Bassboost"></a>Bassboost

- **Catégorie :** music
- **Description :** Modifie le gain de la musique. La puissance par défault est à 0
- **Alias :** `bassboost`
- **Usage :** `bassboost [<nombre entre 0 et 40>]`
- **Exemples :** `bassboost`, `bassboost 3`, `bassboost default`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Change-Config"></a>Change Config

- **Catégorie :** moderation
- **Description :** Modifier différentes valeurs de la configuration
- **Alias :** `changeconfig`
- **Usage :** `changeconfig <configuration> <valeur>`
- **Exemples :** `changeconfig sshpassword Admin123`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Code"></a>Code

- **Catégorie :** basic
- **Description :** Mettre votre code dans un bloc. Ajoutez le paramètre '-l' pour afficher le numéro des lignes.
- **Alias :** `code`, `balise`
- **Usage :** `code [-l] <votre code>`
- **Exemples :** `code broadcast "Yeah!"`, `code -l on join: message "salut !"`


### <a name="Discover"></a>Discover

- **Catégorie :** basic
- **Description :** Envoie une des nombreuses commandes de Swan afin de les découvrir.
- **Alias :** `discover`, `découvrir`, `decouvrir`
- **Usage :** `discover`
- **Exemples :** `discover`


### <a name="Error-Details"></a>Error Details

- **Catégorie :** basic
- **Description :** Aide à régler les erreurs que vous pouvez avoir lorsque vous faites /sk reload. Attention, cette commande est en BETA, donc le pourcentage de précision n'est pas garanti à 100%. Il se peut aussi que certaines erreur ne soit pas disponibles.
- **Alias :** `errordetail`, `errordetails`, `error_detail`, `error_details`, `error-detail`, `error-details`
- **Usage :** `errordetail <votre erreur>`
- **Exemples :** `errordetail Can't compare 'if arg 1' with a text`


### <a name="Ghostping"></a>Ghostping

- **Catégorie :** moderation
- **Description :** Mentionne un membre sans laisser aucune trace, en toute discrétion.
- **Alias :** `ghostping`, `gp`
- **Usage :** `ghostping @mention`
- **Exemples :** `ghostping @Vengelis_ le FISC`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Help"></a>Help

- **Catégorie :** basic
- **Description :** Envoie la page d'aide de toutes les commandes de Swan, ou donne des informations sur une commande spécifique.
- **Alias :** `help`, `aide`
- **Usage :** `help [<commande | page>]`
- **Exemples :** `help ping`, `help`, `help 4`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="History"></a>History

- **Catégorie :** moderation
- **Description :** Envoie l'historique de toutes les sanctions d'un membre.
- **Alias :** `history`, `historique`
- **Usage :** `history <@mention | ID>`
- **Exemples :** `history @Arno`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Idée"></a>Idée

- **Catégorie :** fun
- **Description :** Envoie une idée de script aléatoire à réaliser parmis celles dans le salon des idées.
- **Alias :** `idée`, `idee`, `idea`
- **Usage :** `idea`
- **Exemples :** `idea`


### <a name="Join"></a>Join

- **Catégorie :** music
- **Description :** Connecte le Swan dans votre salon : il ne doit pas être déjà occupé ou être dans votre salon.
- **Alias :** `join`, `rejoindre`
- **Usage :** `join`
- **Exemples :** `join`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Joke"></a>Joke

- **Catégorie :** fun
- **Description :** Envoie aléatoirement une blague drôle (ou pas).
- **Alias :** `joke`, `blague`, `lol`
- **Usage :** `joke`
- **Exemples :** `joke`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Kick"></a>Kick

- **Catégorie :** moderation
- **Description :** Expulse un membre du serveur Discord.
- **Alias :** `kick`
- **Usage :** `kick <@mention | ID> [<raison>]`
- **Exemples :** `kick @WeeksyBDW C'est pas bien !`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Leave"></a>Leave

- **Catégorie :** music
- **Description :** Déconnecte Swan du salon vocal auquel il est connecté.
- **Alias :** `leave`, `quitter`
- **Usage :** `leave`
- **Exemples :** `leave`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Links"></a>Links

- **Catégorie :** basic
- **Description :** Envoie plusieurs liens importants relatifs à Skript, tels que des documentations, des forums, des liens de téléchargement, des Discords...
- **Alias :** `links`, `liens`, `link`, `lien`
- **Usage :** `link [<la page que vous souhaitez>]`
- **Exemples :** `link 3`


### <a name="Loop"></a>Loop

- **Catégorie :** music
- **Description :** Active ou désactive la répétition d'une musique.
- **Alias :** `loop`, `boucle`, `repeat`
- **Usage :** `loop [music | off]`
- **Exemples :** `loop`, `loop music`, `loop off`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Mathematiques"></a>Mathematiques

- **Catégorie :** basic
- **Description :** Teste une expression mathématique en Skript.
- **Alias :** `math`, `mathematique`, `mathematiques`, `mathématique`, `mathématiques`
- **Usage :** `math <expression mathématique de skript>`
- **Exemples :** `math sqrt(12) + 18 - abs(-13)`


### <a name="Move-Message"></a>Move Message

- **Catégorie :** moderation
- **Description :** Déplace un message vers un salon défini par son identifiant.
- **Alias :** `move`, `MoveMessage`
- **Usage :** `move <#mention salon> <ID message>`
- **Exemples :** `move #skript-2 687032391075889161`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Membre actif` ou supérieur peuvent exécuter cette commande.


### <a name="Mute"></a>Mute

- **Catégorie :** moderation
- **Description :** Rendre muet un membre dans les salons d'aide.
- **Alias :** `mute`
- **Usage :** `mute <@mention | ID> <durée> <raison>`
- **Exemples :** `mute @Olyno 5j Une raison plus ou moins valable`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Now-Playing"></a>Now Playing

- **Catégorie :** music
- **Description :** Envoie des informations sur la musique en cours.
- **Alias :** `np`, `nowplaying`, `now-playing`, `now_playing`
- **Usage :** `nowplaying`
- **Exemples :** `nowplaying`, `np`, `music-info`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Pause"></a>Pause

- **Catégorie :** music
- **Description :** Pause ou reprend la lecture de la musique actuellement lue.
- **Alias :** `pause`, `resume`
- **Usage :** `pause`
- **Exemples :** `pause`, `resume`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Ping"></a>Ping

- **Catégorie :** basic
- **Description :** Envoie la latence entre vous et Swan ainsi que Swan et l'API Discord.
- **Alias :** `ping`, `ms`
- **Usage :** `ping`
- **Exemples :** `ping`


### <a name="Play"></a>Play

- **Catégorie :** music
- **Description :** Joue une musique ou une playlist selon son nom ou son URL YouTube. Ajoute `--first` pour choisir automatiquement le premier résultat si vous cherchez une musique par son nom.
- **Alias :** `play`, `jouer`, `joue`
- **Usage :** `play [<musique [--first] | URL de musique youtube | URL de playlist youtube>]`
- **Exemples :** `play darude sandstorm`, `play gangnamstyle --first`, `play https://youtu.be/y6120QOlsfU`, `play`
- **Informations supplémentaires :**
	- ⚠️ Le temps de réutilisation de cette commande est de `3 secondes`.
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Player-Info"></a>Player Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un certain joueur, que vous avez défini par son pseudo Minecraft.
- **Alias :** `playerinfo`, `player_info`, `player-info`
- **Usage :** `player-info <pseudo>`
- **Exemples :** `player-info noftaly`


### <a name="Poll"></a>Poll

- **Catégorie :** fun
- **Description :** Lance un sondage temporaire par lequel on peut répondre par Oui / Non ou par une réponse personnalisée. Ajouter l'argument `-a` indique que le sondage sera anonyme.
- **Alias :** `poll`, `vote`, `sondage`
- **Usage :** `poll <durée> [-a] "<sondage>" ["réponse 1"] ["réponse 2"] [...]`
- **Exemples :** `poll 10m "votre sondage" "réponse 1" "réponse 2" "réponse 3" "réponse 4"`, `vote 10m votre sondage`, `sondage 10m "votre sondage" -a "réponse 1" "réponse 2" `
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Purge"></a>Purge

- **Catégorie :** moderation
- **Description :** Supprime un nombre de messages determiné dans un salon. La suppresion peut être basée sur un utilisateur en particulier. La limite de suppression est fixée à 100. Par défault, les messages des membres ayant le rôle 'Staff' ne serront pas supprimés, pour aussi les supprimer, utiliser l'argument `-f`
- **Alias :** `purge`
- **Usage :** `purge [<@mention | ID>] <nombre> [<-f>]`
- **Exemples :** `purge 40`, `purge 20 -f`, `purge @utilisateur 20`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Queue"></a>Queue

- **Catégorie :** music
- **Description :** Envoie la liste de toutes les musiques actuellement dans la queue.
- **Alias :** `queue`
- **Usage :** `queue [<remove <index> | clear>]`
- **Exemples :** `queue`, `queue remove 2`, `queue clear`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Ranking"></a>Ranking

- **Catégorie :** basic
- **Description :** Envoie les classements des musiques/blagues les plus likées/dislikées/vues.
- **Alias :** `ranking`, `rank`, `ranks`, `classement`
- **Usage :** `ranking <music-likes/music-dislikes/music-views/joke-likes/joke-dislikes/joke-views>`
- **Exemples :** `classement music-views`, `ranks music-dislikes`, `ranking joke-likes`


### <a name="Remove-Warn"></a>Remove Warn

- **Catégorie :** moderation
- **Description :** Enlève un avertissement à un membre, selon l'ID de l'avertissement.
- **Alias :** `removewarn`, `remwarn`, `deletewarn`, `delwarn`, `unwarn`
- **Usage :** `removewarn <@mention | ID utilisateur> <ID warn> [<raison>]`
- **Exemples :** `removewarn @polymeth nZPiWKem En fait trkl il m'a payé`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Rules"></a>Rules

- **Catégorie :** basic
- **Description :** Envoie les règles des salons d'aide Skript.
- **Alias :** `rule`, `rules`, `règle`, `regle`, `règles`, `regles`
- **Usage :** `rule <règle>`
- **Exemples :** `rule 2`


### <a name="Server-Info"></a>Server Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un certain serveur Minecraft, selon son IP.
- **Alias :** `serverinfo`, `server_info`, `server-info`, `serveurinfo`, `serveur_info`, `serveur-info`
- **Usage :** `serveur-info <IP>`
- **Exemples :** `serveur-info hypixel.net`


### <a name="Shuffle"></a>Shuffle

- **Catégorie :** music
- **Description :** Mélange l'ordre des musiques dans la queue.
- **Alias :** `shuffle`, `mix`, `melanger`, `mélanger`
- **Usage :** `shuffle`
- **Exemples :** `shuffle`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Skip"></a>Skip

- **Catégorie :** music
- **Description :** Passe une ou plusieurs musiques de la queue.
- **Alias :** `skip`, `next`, `passer`, `passe`, `suivant`
- **Usage :** `skip [<nombre>]`
- **Exemples :** `skip`, `skip 3`
- **Informations supplémentaires :**
	- ⚠️ Le temps de réutilisation de cette commande est de `3 secondes`.
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Skript-Info"></a>Skript Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur Skript, telles que sa version actuelle, un lien de téléchargement, les versions de Skript à utiliser selon la version Minecraft...
- **Alias :** `skriptinfo`, `skript-info`, `skript_info`, `skriptinfos`, `skript-infos`, `skript_infos`
- **Usage :** `skript-info`
- **Exemples :** `skriptInfo`
- **Informations supplémentaires :**
	- ⚠️ Le temps de réutilisation de cette commande est de `60 secondes`.


### <a name="Statistics"></a>Statistics

- **Catégorie :** basic
- **Description :** Envoie diverses statistiques sur Swan et le serveur.
- **Alias :** `statistique`, `statistiques`, `statistic`, `statistics`, `stats`, `stat`
- **Usage :** `statistique`
- **Exemples :** `statistique`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Status"></a>Status

- **Catégorie :** moderation
- **Description :** Consulter le status de Swan, ou de l'activer/désactiver.
- **Alias :** `status`, `statut`
- **Usage :** `status [<on/off>]`
- **Exemples :** `status`, `status off`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Gérant, Modérateur Discord` ou supérieur peuvent exécuter cette commande.


### <a name="Stop"></a>Stop

- **Catégorie :** music
- **Description :** Arrête la lecture de la musique actuelle.
- **Alias :** `stop`, `arrêt`, `arret`
- **Usage :** `stop`
- **Exemples :** `stop`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Tag-Role"></a>Tag Role

- **Catégorie :** moderation
- **Description :** Notifie un rôle qui n'est pas mentionnable.
- **Alias :** `tagrole`, `tag-role`, `tag_role`
- **Usage :** `tag-role <rôle>`
- **Exemples :** `tagrole Notifications Évènements`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Toggle-role-notification"></a>Toggle role notification

- **Catégorie :** basic
- **Description :** Ajoute ou retire le rôle Notifications Évènements afin d'être notifié lors d'un message lié aux concours.
- **Alias :** `toggle-notif-role`, `togglenotifrole`, `toggle_notif_role`
- **Usage :** `toggle-notif-role`
- **Exemples :** `toggle-notif-role`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Unban"></a>Unban

- **Catégorie :** moderation
- **Description :** Retire une restriction du Discord à un membre. Ajoutez l'argument `-no-delete` pour ne pas supprimer le salon privé.
- **Alias :** `unban`
- **Usage :** `unban <@mention | ID> [<raison>]`
- **Exemples :** `unban @Acenox Oups je voulais ban qqun d'autre`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="Unmute"></a>Unmute

- **Catégorie :** moderation
- **Description :** Rétabli la parole à un membre dans les salons d'aide.
- **Alias :** `unmute`
- **Usage :** `unmute <@mention | ID> [<raison>]`
- **Exemples :** `unmute @4rno G mété tronpé hé`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.


### <a name="User-Info"></a>User Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un certain membre du Discord Skript-MC, que vous avez défini par son ID ou en le mentionnant (Merci d'éviter de mentionner. Pour récupérer l'ID de quelqu'un, activez le mode développeur (Paramètres > Apparence > Avancé > Mode développeur), puis faites un clic-droit sur son pseudo > Copier l'Identifiant).
- **Alias :** `userinfo`, `user-info`, `user_info`
- **Usage :** `user-info <@mention | ID>`
- **Exemples :** `userinfo @noftaly`, `user-infos 188341077902753794`


### <a name="Volume"></a>Volume

- **Catégorie :** music
- **Description :** Modifie le volume de la musique. Afin d'éviter de gêner les autres utilisateurs, préférez plutôt baisser le volume de Swan en faisant un `clic-droit` dessus, puis en modifiant le curseur `Volume de l'utilisateur`.
- **Alias :** `volume`, `vol`
- **Usage :** `volume [<nombre entre 1 et 10>]`
- **Exemples :** `volume`, `volume 3`
- **Informations supplémentaires :**
	- ⚠️ Cette commande ne peut pas être exécutée dans les salons d'aide.


### <a name="Warn"></a>Warn

- **Catégorie :** moderation
- **Description :** Donne un avertissement à un membre.
- **Alias :** `warn`
- **Usage :** `warn <@mention | ID> <raison>`
- **Exemples :** `warn @polymeth Irrespect du format d'aide`
- **Informations supplémentaires :**
	- ⚠️ Seul les membres ayant le rôle `Staff` ou supérieur peuvent exécuter cette commande.
