# Documentation

Documentation de toutes les commandes de Swan (47)

## Index

- [8ball](####-8ball)
- [Addon Info](####-Addon-Info)
- [Addon Pack](####-Addon-Pack)
- [Automatic Messages](####-Automatic-Messages)
- [Ban](####-Ban)
- [Bassboost](####-Bassboost)
- [Code](####-Code)
- [Discover](####-Discover)
- [Error Details](####-Error-Details)
- [Ghostping](####-Ghostping)
- [Help](####-Help)
- [History](####-History)
- [Join](####-Join)
- [Joke](####-Joke)
- [Kick](####-Kick)
- [Leave](####-Leave)
- [Links](####-Links)
- [Loop](####-Loop)
- [Mathematiques](####-Mathematiques)
- [Move Message](####-Move-Message)
- [Mute](####-Mute)
- [Now Playing](####-Now-Playing)
- [Pause](####-Pause)
- [Ping](####-Ping)
- [Play](####-Play)
- [Player Info](####-Player-Info)
- [Poll](####-Poll)
- [Purge](####-Purge)
- [Queue](####-Queue)
- [Ranking](####-Ranking)
- [Remove Music Restriction](####-Remove-Music-Restriction)
- [Rules](####-Rules)
- [Server Info](####-Server-Info)
- [SetSshPassword](####-SetSshPassword)
- [Shuffle](####-Shuffle)
- [Skip](####-Skip)
- [Skript Info](####-Skript-Info)
- [Statistics](####-Statistics)
- [Status](####-Status)
- [Stop](####-Stop)
- [Tag Role](####-Tag-Role)
- [Toggle role notification](####-Toggle-role-notification)
- [Unban](####-Unban)
- [Unmute](####-Unmute)
- [User Info](####-User-Info)
- [Volume](####-Volume)
- [Warn](####-Warn)

## Commandes

#### 8ball

- **Catégorie :** fun
- **Description :** Réponse personnalisée par Oui ou Non à une n'importe quelle question ! Réponse sûre garantie à 7%.
- **Aliases :** `8ball`
- **Usage :** `8ball <question>`
- **Exemples :** `8ball suis-je le plus beau ?`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Addon Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un addon, telles que son auteur, sa dernière version, un lien de téléchargement, si l'addon est déprecié, les dépendances...
- **Aliases :** `addoninfo` | `addon_info` | `addon-info`
- **Usage :** `addon-info <addon>`
- **Exemples :** `addon-info skquery-lime` | `addoninfo mirror`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Addon Pack

- **Catégorie :** basic
- **Description :** Envoie un pack d'addon correspondant à une certaine version de Minecraft.
Si vous connaissez une version plus récente d'un addon fonctionnant dans une certaine version de minecraft, n'hésitez pas a contacter les devs ou à vous rendre sur le Discord de développement (lien disponible dans les messages épinglés de #bot).
- **Aliases :** `addonpack` | `addon_pack` | `addon-pack`
- **Usage :** `addon-pack <votre version de serveur>`
- **Exemples :** `addon-pack 1.14`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Automatic Messages

- **Catégorie :** basic
- **Description :** Envoie un message prédéfini parmis ceux-là : `%s`. Merci de ne pas abuser de cette commande, et de l'exécuter seulement si besoin.
- **Aliases :** `automaticmessage` | `automatic_message` | `automatic-message` | `automsg` | `auto_msg` | `auto-msg` | `auto`
- **Usage :** `automsg <nom du message>`
- **Exemples :** `automsg asktoask`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Ban

- **Catégorie :** moderation
- **Description :** Applique une restriction du Discord à un membre.
- **Aliases :** `ban` | `sdb`
- **Usage :** `ban <@mention | ID> <durée> [<raison>]`
- **Exemples :** `ban @Uneo7 5j Mouahaha`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Bassboost

- **Catégorie :** music
- **Description :** Modifie le gain de la musique.
- **Aliases :** `bassboost`
- **Usage :** `bassboost [<nombre entre 0 et 40>]`
- **Exemples :** `bassboost` | `bassboost 3`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Code

- **Catégorie :** basic
- **Description :** Mettre votre code dans un bloc. Ajoutez le paramètre '-l' pour afficher le numéro des lignes.
- **Aliases :** `code` | `balise`
- **Usage :** `code [-l] <votre code>`
- **Exemples :** `code broadcast "Yeah!"` | `code -l on join: message "salut !"`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Discover

- **Catégorie :** basic
- **Description :** Envoie une des nombreuses commandes de Swan afin de les découvrir.
- **Aliases :** `discover` | `découvrir` | `decouvrir`
- **Usage :** `discover`
- **Exemples :** `discover`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Error Details

- **Catégorie :** basic
- **Description :** Aide à régler les erreurs que vous pouvez avoir lorsque vous faites /sk reload. Attention, cette commande est en BETA, donc le pourcentage de précision n'est pas garanti à 100%. Il se peut aussi que certaines erreur ne soit pas disponibles.
- **Aliases :** `errordetail` | `errordetails` | `error_detail` | `error_details` | `error-detail` | `error-details`
- **Usage :** `errordetail <votre erreur>`
- **Exemples :** `errordetail Can't compare 'if arg 1' with a text`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Ghostping

- **Catégorie :** moderation
- **Description :** Mentionne un membre sans laisser aucune trace, en toute discrétion.
- **Aliases :** `ghostping` | `gp`
- **Usage :** `ghostping @mention`
- **Exemples :** `ghostping @Vengelis_ le FISC`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Help

- **Catégorie :** basic
- **Description :** Envoie la page d'aide de toutes les commandes de Swan, ou donne des informations sur une commande spécifique.
- **Aliases :** `help` | `aide`
- **Usage :** `help [<commande | page>]`
- **Exemples :** `help ping` | `help` | `help 4`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### History

- **Catégorie :** moderation
- **Description :** Envoie l'historique de toutes les sanctions d'un membre.
- **Aliases :** `history` | `historique`
- **Usage :** `history <@mention | ID>`
- **Exemples :** `history @Arno`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Join

- **Catégorie :** music
- **Description :** Connecte le Swan dans votre salon : il ne doit pas être déjà occupé ou être dans votre salon.
- **Aliases :** `join` | `rejoindre`
- **Usage :** `join`
- **Exemples :** `join`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Joke

- **Catégorie :** fun
- **Description :** Envoie aléatoirement une blague drôle (ou pas).
- **Aliases :** `joke` | `blague` | `lol`
- **Usage :** `joke`
- **Exemples :** `joke`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Kick

- **Catégorie :** moderation
- **Description :** Expulse un membre du serveur Discord.
- **Aliases :** `kick`
- **Usage :** `kick <@mention | ID> [<raison>]`
- **Exemples :** `kick @WeeksyBDW C'est pas bien !`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Leave

- **Catégorie :** music
- **Description :** Déconnecte Swan du salon vocal auquel il est connecté.
- **Aliases :** `leave` | `quitter`
- **Usage :** `leave`
- **Exemples :** `leave`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Links

- **Catégorie :** basic
- **Description :** Envoie plusieurs liens importants relatifs à Skript, tels que des documentations, des forums, des liens de téléchargement, des Discords...
- **Aliases :** `links` | `liens` | `link` | `lien`
- **Usage :** `link [<la page que vous souhaitez>]`
- **Exemples :** `link 3`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Loop

- **Catégorie :** music
- **Description :** Active ou désactive la répétition d'une musique.
- **Aliases :** `loop` | `boucle` | `repeat`
- **Usage :** `loop [music | off]`
- **Exemples :** `loop` | `loop music` | `loop off`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Mathematiques

- **Catégorie :** basic
- **Description :** Teste une expression mathématique en Skript.
- **Aliases :** `math` | `mathematique` | `mathematiques` | `mathématique` | `mathématiques`
- **Usage :** `math <expression mathématique de skript>`
- **Exemples :** `math sqrt(12) + 18 - abs(-13)`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Move Message

- **Catégorie :** moderation
- **Description :** Déplace un message vers un salon défini par son identifiant.
- **Aliases :** `move` | `MoveMessage`
- **Usage :** `move <#mention salon> <ID message>`
- **Exemples :** `move #skript-2 687032391075889161`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Membre Actif
  - Canaux requis / interdits : aucun / aucun

#### Mute

- **Catégorie :** moderation
- **Description :** Rendre muet un membre dans les salons d'aide.
- **Aliases :** `mute`
- **Usage :** `mute <@mention | ID> <durée> [<raison>]`
- **Exemples :** `mute @AlexLew 5j Une raison plus ou moins valable`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Now Playing

- **Catégorie :** music
- **Description :** Envoie des informations sur la musique en cours.
- **Aliases :** `np` | `nowplaying` | `now-playing` | `now_playing`
- **Usage :** `nowplaying`
- **Exemples :** `nowplaying` | `np` | `music-info`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Pause

- **Catégorie :** music
- **Description :** Pause ou reprend la lecture de la musique actuellement lue.
- **Aliases :** `pause` | `resume`
- **Usage :** `pause`
- **Exemples :** `pause` | `resume`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Ping

- **Catégorie :** basic
- **Description :** Envoie la latence entre vous et Swan ainsi que Swan et l'API Discord.
- **Aliases :** `ping` | `ms`
- **Usage :** `ping`
- **Exemples :** `ping`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Play

- **Catégorie :** music
- **Description :** Joue une musique ou une playlist selon son nom ou son URL YouTube. Ajoute `--first` pour choisir automatiquement le premier résultat si vous cherchez une musique par son nom.
- **Aliases :** `play` | `jouer` | `joue`
- **Usage :** `play [<musique [--first] | URL de musique youtube | URL de playlist youtube>]`
- **Exemples :** `play darude sandstorm` | `play gangnamstyle --first` | `play https://youtu.be/y6120QOlsfU` | `play`
- **Cooldown :** 3 secondes
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Player Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un certain joueur, que vous avez défini par son pseudo Minecraft.
- **Aliases :** `playerinfo` | `player_info` | `player-info`
- **Usage :** `player-info <pseudo>`
- **Exemples :** `player-info noftaly`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Poll

- **Catégorie :** fun
- **Description :** Lance un sondage temporaire par lequel on peut répondre par Oui / Non ou par une réponse personnalisée.
- **Aliases :** `poll` | `vote` | `sondage`
- **Usage :** `poll <durée> "<sondage>" ["réponse 1"] ["réponse 2"] [...]`
- **Exemples :** `poll 10m "votre sondage" "réponse 1" "réponse 2" "réponse 3" "réponse 4"` | `poll 10m "votre sondage"`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Purge

- **Catégorie :** moderation
- **Description :** Supprime un nombre de messages determiné dans un salon. La suppresion peut être basée sur un utilisateur en particulier. La limite de suppression est fixée à 100.
- **Aliases :** `purge`
- **Usage :** `purge [<@mention>]`
- **Exemples :** `purge @utilisateur 20`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Queue

- **Catégorie :** music
- **Description :** Envoie la liste de toutes les musiques actuellement dans la queue.
- **Aliases :** `queue`
- **Usage :** `queue [<remove <index> | clear>]`
- **Exemples :** `queue` | `queue remove 2` | `queue clear`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Ranking

- **Catégorie :** basic
- **Description :** Envoie les classements des musiques/blagues les plus likées/dislikées/vues.
- **Aliases :** `ranking` | `rank` | `ranks` | `classement`
- **Usage :** `ranking <music-likes/music-dislikes/music-views/joke-likes/joke-dislikes/joke-views>`
- **Exemples :** `classement music-views` | `ranks music-dislikes` | `ranking joke-likes`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Remove Music Restriction

- **Catégorie :** moderation
- **Description :** Rétabli à un membre l'accès aux commandes musicales.
- **Aliases :** `removemusicrestriction` | `remove-music-restriction` | `remove_music_restriction` | `remmusicrestr` | `rem-music-restr` | `rem_music_restr`
- **Usage :** `removemusicrestriction <@mention | ID> [<raison>]`
- **Exemples :** `removemusicrestr @4rno En fait c'est une bonne musique`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Rules

- **Catégorie :** basic
- **Description :** Envoie les règles des salons d'aide Skript.
- **Aliases :** `rule` | `rules` | `règle` | `regle` | `règles` | `regles`
- **Usage :** `rule <règle>`
- **Exemples :** `rule 2`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Server Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un certain serveur Minecraft, selon son IP.
- **Aliases :** `serverinfo` | `server_info` | `server-info` | `serveurinfo` | `serveur_info` | `serveur-info`
- **Usage :** `serveur-info <IP>`
- **Exemples :** `serveur-info hypixel.net`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### SetSshPassword

- **Catégorie :** fun
- **Description :** Définit le mot de passe de ssh@skript-mc.fr
- **Aliases :** `setssh` | `setsshpassword`
- **Usage :** `setssh <mot de passe>`
- **Exemples :** `setssh Admin123`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Shuffle

- **Catégorie :** music
- **Description :** Mélange l'ordre des musiques dans la queue.
- **Aliases :** `shuffle` | `mix` | `melanger` | `mélanger`
- **Usage :** `shuffle`
- **Exemples :** `shuffle`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Skip

- **Catégorie :** music
- **Description :** Passe une ou plusieurs musiques de la queue.
- **Aliases :** `skip` | `next` | `passer` | `passe` | `suivant`
- **Usage :** `skip [<nombre>]`
- **Exemples :** `skip` | `skip 3`
- **Cooldown :** 3 secondes
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Skript Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur Skript, telles que sa version actuelle, un lien de téléchargement, les versions de Skript à utiliser selon la version Minecraft...
- **Aliases :** `skriptinfo` | `skript-info` | `skript_info` | `skriptinfos` | `skript-infos` | `skript_infos`
- **Usage :** `skript-info`
- **Exemples :** `skriptInfo`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Statistics

- **Catégorie :** basic
- **Description :** Envoie diverses statistiques sur Swan et le serveur.
- **Aliases :** `statistique` | `statistiques` | `statistic` | `statistics` | `stats` | `stat`
- **Usage :** `statistique`
- **Exemples :** `statistique`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Status

- **Catégorie :** moderation
- **Description :** Consulter le status de Swan, ou de l'activer/désactiver.
- **Aliases :** `status` | `statut`
- **Usage :** `status [<on/off>]`
- **Exemples :** `status` | `status off`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Gérant, Modérateur Discord
  - Canaux requis / interdits : aucun / aucun

#### Stop

- **Catégorie :** music
- **Description :** Arrête la lecture de la musique actuelle.
- **Aliases :** `stop` | `arrêt` | `arret`
- **Usage :** `stop`
- **Exemples :** `stop`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Tag Role

- **Catégorie :** moderation
- **Description :** Notifie un rôle qui n'est pas mentionnable.
- **Aliases :** `tagrole` | `tag-role` | `tag_role`
- **Usage :** `tag-role <rôle>`
- **Exemples :** `tagrole Notifications Évènements`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Toggle role notification

- **Catégorie :** basic
- **Description :** Ajoute ou retire le rôle Notifications Évènements afin d'être notifié lors d'un message lié aux concours.
- **Aliases :** `toggle-notif-role` | `togglenotifrole` | `toggle_notif_role`
- **Usage :** `toggle-notif-role`
- **Exemples :** `toggle-notif-role`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Unban

- **Catégorie :** moderation
- **Description :** Retire une restriction du Discord à un membre. Ajoutez l'argument `-no-delete` pour ne pas supprimer le salon privé.
- **Aliases :** `unban`
- **Usage :** `unban <@mention | ID> [<raison>]`
- **Exemples :** `unban @Acenox Oups je voulais ban qqun d'autre`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### Unmute

- **Catégorie :** moderation
- **Description :** Rétabli la parole à un membre dans les salons d'aide.
- **Aliases :** `unmute`
- **Usage :** `unmute <@mention | ID> [<raison>]`
- **Exemples :** `unmute @4rno G mété tronpé hé`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun

#### User Info

- **Catégorie :** info
- **Description :** Envoie diverses informations sur un certain membre du Discord Skript-MC, que vous avez défini par son ID ou en le mentionnant (Merci d'éviter de mentionner. Pour récupérer l'ID de quelqu'un, activez le mode développeur (Paramètres > Apparence > Avancé > Mode développeur), puis faites un clic-droit sur son pseudo > Copier l'Identifiant).
- **Aliases :** `userinfo` | `user-info` | `user_info`
- **Usage :** `user-info <@mention | ID>`
- **Exemples :** `userinfo @noftaly` | `user-infos 188341077902753794`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Volume

- **Catégorie :** music
- **Description :** Modifie le volume de la musique. Afin d'éviter de gêner les autres utilisateurs, préférez plutôt baisser le volume de Swan en faisant un `clic-droit` dessus, puis en modifiant le curseur `Volume de l'utilisateur`.
- **Aliases :** `volume` | `vol`
- **Usage :** `volume [<nombre entre 1 et 10>]`
- **Exemples :** `volume` | `volume 3`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ❌
  - Permission(s) nécéssaire(s) pour éxécuter la commande : aucune
  - Canaux requis / interdits : aucun / aucun

#### Warn

- **Catégorie :** moderation
- **Description :** Donne un avertissement à un membre.
- **Aliases :** `warn`
- **Usage :** `warn <@mention | ID> [<raison>]`
- **Exemples :** `warn @polymeth Langage incorrect`
- **Cooldown :** aucun
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : ✅
  - Permission(s) nécéssaire(s) pour éxécuter la commande : Staff
  - Canaux requis / interdits : aucun / aucun
