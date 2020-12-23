# Module de modération de Swan

Le module de modération de Swan consiste en une grosse partie du bot. Voici comment il fonctionne.

## Contenu

- [Liste des sanctions](#liste-des-sanctions)
  - [Informations diverses](#informations-diverses)
    - [Drapeau](#drapeau)
    - [Utilisateur](#utilisateur)
    - [Durée](#durée)
    - [Rôles](#rôles)
  - [Bannissement](#bannissement)
    - [Description](#description)
    - [Mise à jour](#mise-à-jour)
      - [Durée](#durée-1)
      - [Annulation](#annulation)
    - [Précisions](#précisions)
    - [Commande](#commande)
  - [Mute](#mute)
    - [Description](#description-1)
    - [Mise à jour](#mise-à-jour-1)
      - [Durée](#durée-2)
      - [Annulation](#annulation-1)
    - [Précisions](#précisions-1)
    - [Commande](#commande-1)
  - [Kick](#kick)
    - [Description](#description-2)
    - [Commande](#commande-2)
  - [Warn](#warn)
    - [Description](#description-3)
    - [Mise à jour (Annulation)](#mise-à-jour-annulation)
    - [Précisions](#précisions-2)
    - [Commande](#commande-3)
- [Fonctionnement et organisation du code](#fonctionnement-et-organisation-du-code)
- [Organisation des bases de données](#organisation-des-bases-de-données)
  - [ConvictedUsers](#convictedusers)
  - [Sanctions](#sanctions)


## Liste des sanctions

### Informations diverses

#### Drapeau

Un drapeau (*flag* en anglais) est une option qui peut être spécifiée **n'importe où** dans une commande. Il est précédé de deux tirets
`--` s'il contient plusieurs lettres, sinon un seul tiret : `-`.

#### Utilisateur

Quand dans une commande il est écrit d'entrer un utilisateur, vous pouvez soit le mentionner, soit entrer son pseudo, soit entrer son identifiant discord (clique droit > copier l'identifiant. Cela requiert d'avoir activé le mode développeur).

#### Durée

Les durées des sanctions peuvent être écrites en français ou en anglais. Elles doivent être construites de la manière suivante : `<nombre><unité>`.
Plusieurs associations de nombres et d'unités peuvent être mises à la suite, mais il ne faut jamais d'espace. Exemple : `<nombre><unité><nombre><unité>`.
L'unité est le type de durée (années, mois, semaines, jours, heures, minutes, secondes).
Voici les unités possibles :
- Années : `years`, `year`, `y`, `annees`, `années`, `annee`, `année`, `ans`, `an`, `a`
- Mois : `months`, `month`, `mois`, `mo`
- Semaines : `weeks`, `week`, `w`, `semaines`, `semaine`, `sem`
- Jours : `days`, `day`, `d`, `jours`, `jour`, `j`
- Heures : `hours`, `hour`, `heures`, `heure`, `hrs`, `hr`, `h`
- Minutes : `minutes`, `minute`, `mins`, `min`, `m`
- Secondes : `seconds`, `second`, `secondes`, `seconde`, `secs`, `sec`, `s`

Voici un exemple de durée valide : `1mo3j10mins` pour 1 mois, 3 jours, et 10 minutes

#### Rôles

Toutes les commandes de modération sont exécutables par les personnes ayant le rôle "Staff". Cependant, les modérateurs forum ont une restriction de durée : il ne peuvent pas sanctionner pour une durée de plus de 2 jours.


### Bannissement

#### Description

Il y a deux types distincts de bannissements : les bannissements temporaires, qui isolent le membre dans un salon pour banni,
et les bannissements permanents, nommés `hard ban` dans le code, qui consistent en des bannissements natifs du Discord.

#### Mise à jour

##### Durée

Pour mettre à jour la durée d'un bannissement, il faut simplement ré-exécuter la commande de bannissement en spécifiant l'utilisateur.
S'il n'est pas banni, alors cela va créer le bannissement, sinon, s'il est déjà banni, cela va mettre à jour la durée en la **remplaçant**
par la durée spécifiée. La raison entrée sera alors le motif pour avoir mis à jour la durée.

##### Annulation

Pour annuler le bannissement d'un membre, il faut utiliser la commande `.unban` (ou `.deban`), suivi de l'utilisateur. Vous pouvez aussi, optionnellement, ajouter une raison pour ce dé-bannissement.
Cette commande fonctionne aussi bien pour les bannissements permanants et temporaires, seulement vous ne pourrez pas mentionner l'utilisateur pour les bannissements permanants car il n'est pas présent sur le Discord.

Modèle : `.unban <@mention | pseudo | ID> [raison]`

#### Précisions

- Si pendant un bannissement temporaire l'utilisateur quitte le discord, il sera automatiquement banni de manière permanante.
- Immédiatement après l'expiration d'un bannissement temporaire, le salon privé sera supprimé. Un historique des messages sera envoyé sous forme de fichier texte (`.txt`) dans le salon des logs de modération.

#### Commande

La commande pour bannir un utilisateur est le `.ban` ou encore `.sdb`. S'en suit l'utilisateur à bannir, puis la durée pour un
bannissement temporaire (salon des bannis), ou `perma` ou `def` pour un bannissement permanant. Enfin, il faut entrer la raison du bannissement.

Cette commande accepte aussi un drapeau, le drapeau `--autoban` (ou encore `--auto-ban` et `-a`). Avec ce drapeau, si la personne n'a écrit
aucun message dans son salon privé à la fin de la sanction, il sera banni définitivement, au lieu d'être simplement débanni.

Voici donc le modèle d'une commande : `.ban <@mention | pseudo | ID> <durée> <raison> [--autoban]`
Et voici des exemples d'utilisation :\
`.ban @WeeskyBDW 3j --autoban t'es paumé !`\
`.ban 1h @Vengelis La vie est dure...`


### Mute

#### Description

Un mute empêche un membre de pouvoir écrire des messages dans les salons d'aide.

#### Mise à jour

##### Durée

Pour mettre à jour la durée d'un mute, il faut simplement ré-exécuter la commande de mute en spécifiant l'utilisateur. S'il n'est pas mute,
alors cela va créer le mute, sinon, s'il est déjà mute, cela va mettre à jour la durée en la **remplaçant** par la durée spécifiée.
La raison entrée sera alors le motif pour avoir mis à jour la durée.

##### Annulation

Pour annuler le mute d'un membre, il faut utiliser la commande `.unmute` (ou `.demute`), suivi de l'utilisateur. Vous pouvez aussi, optionnellement, ajouter une raison pour ce dé-mute.

Modèle : `.unmute <@mention | pseudo | ID> [raison]`

#### Précisions

- Il est important de noter que les mutes ne fonctionnent que dans la catégorie de salon "Aide".
- Si un membre quitte le discord en étant mute, puis qu'il le rejoint est que le bot est hors-ligne, alors il n'aura plus son rôle "Mute" et pourra continuer à envoyer des messages, même si le bot revient en ligne.

#### Commande

La commande est le `.mute`. S'en suit l'utilisateur à rendre muet. Il faut ensuite spécifier la durée pour le mute, et enfin, la raison du mute.

Voici donc le modèle d'une commande : `.mute <@mention | pseudo | ID> <durée> <raison>`
Et voici des exemples d'utilisation : `.mute @Xamez chuuuut`


### Kick

#### Description

Un kick permet d'expulser un membre du discord. Il peut ensuite la rejoindre via une invitation.

#### Commande

La commande est le `.kick`. S'en suit l'utilisateur à expulser. Il faut ensuite préciser la raison de l'expulsion.

Voici donc le modèle d'une commande : `.kick <@mention | pseudo | ID> <raison>`
Et voici des exemples d'utilisation : `.mute @GonPVP Tu es un espion.....`


### Warn

#### Description

Un warn permet de donner un avertissement à un membre. Au bout de deux avertissements, le membre sera automatiquement banni.

#### Mise à jour (Annulation)

Vous pouvez annuler l'avertissement d'un membre en utilisant la commande `.removewarn` (ou `.remove-warn`, `.remove_warn`, `.unwarn` et `.dewarn`).
Il faut ensuite ajouter l'utilisateur auquel il faut retirer un avertissement, ce sera toujours le dernier avertissement du membre qui sera annulé.
Enfin, vous pouvez, optionnellement, ajouter une raison pour annuler cet avertissement.

Modèle : `.removewarn <@mention | pseudo | ID> [raison]`

#### Précisions

- Après 2 avertissements, le membre sera automatiquement banni pendant 4 jours.
- Un avertissement expire au bout d'un mois.

#### Commande

La commande est le `.warn`. S'en suit l'utilisateur à avertir, et la raison de l'avertissement.

Voici donc le modèle d'une commande : `.warn <@mention | pseudo | ID> <raison>`
Et voici des exemples d'utilisation : `.warn @Rémi Il faut penser à respecter le modèle d'aide !`


## Fonctionnement et organisation du code

Chaque sanction est une action qui hérite de la classe `ModerationAction`. Il faut donner un paramètre un objet `ModerationData`, qui contient les informations relatives à la sanction.
Il faut ensuite appeler la méthode `commit()` de l'action, pour lancer l'action.
Si une erreur se produit lors du code, elle sera ajoutée à la classe `ModerationError` attachée à l'action.
Diverses fonctions utilitaires relatives à la modération se trouvent dans la classe `ModerationHelper`.
Chaque action a, avec elle, une propriété instance de la classe `ActionUpdateInformations@ , qui contient des informations, notamment pour savoir si cette action est une mise à jour.

## Organisation des bases de données

Les sanctions sont réparties en 2 bases de données :
- `ConvictedUsers` : contient la liste des membres ayant ou ayant eu des sanctions.
- `Sanctions` : contient la liste de toutes les sanctions terminées ou non, et des informations les concernant.

### ConvictedUsers

Voici à quoi ressemble un schema de la base de données ConvictedUsers :
```json
{
  "memberId": {
    "type": "String",
    "required": true,
    "unique": true,
  },
  "lastBanId": {
    "type": "String",
    "default": null,
  },
  "lastMuteId": {
    "type": "String",
    "default": null,
  },
  "currentWarnCount": {
    "type": "Number",
    "required": true,
    "default": 0,
  },
}
```

- `lastBanId` est l'ID du bannissement actuellement en cours, ou `null` si aucun n'est en cours.
- `lastMuteId` est l'ID du mute actuellement en cours, ou `null` si aucun n'est en cours.
- `currentWarnCount` est le nombre d'avertissement en cours. Il se remettra à 0 dès que l'utilisateur a dépassé la limite d'avertissements avant bannissement.

### Sanctions

Voici à quoi ressemble un schema de la base de données Sanctions :
```json
{
  "memberId": {
    "type": "String",
    "required": true
  },
  "user": {
    "type": "ObjectId",
    "required": true,
    "ref": "ConvictedUser",
    "autopopulate": true
  },
  "type": {
    "type": "String",
    "required": true,
    "enum": "SANCTIONS.TYPES"
  },
  "moderator": {
    "type": "String",
    "required": true
  },
  "start": {
    "type": "Number",
    "required": true,
    "default": "Date.now()"
  },
  "duration": {
    "type": "Number"
  },
  "finish": {
    "type": "Number"
  },
  "reason": {
    "type": "String",
    "required": true
  },
  "revoked": {
    "type": "Boolean",
    "required": true,
    "default": false
  },
  "id": {
    "type": "String",
    "required": true,
    "default": "nanoid(8)"
  },
  "informations": {
    "hasSentMessage": {
      "type": "Boolean"
    }
  },
  "updates": [{
    "date": {
      "type": "Number",
      "required": true,
      "default": "Date.now()"
    },
    "moderator": {
      "type": "String",
      "required": true
    },
    "type": {
      "type": "String",
      "required": true,
      "enum": "SANCTIONS.UPDATES"
    },
    "valueBefore": {
      "type": "Number"
    },
    "valueAfter": {
      "type": "Number"
    },
    "reason": {
      "type": "String",
      "required": true
    }
  }]
}
```

- `user` est une référence à l'objet de l'utilisateur correspondant dans la base de données `ConvictedUsers`.
- `type` est le type de la sanction, qui peut être un des suivants : `hardban`, `ban`, `mute`, `warn`, `kick`.
- `moderator` est l'ID Discord du modérateur qui a donné la sanction.
- `start` est le timestamp de création de la sanction.
- `duration` est la durée, en millisecondes, de la sanction.
- `finish` est le timestamp auquel la sanction se terminera.
- `reason` est la raison de la sanction.
- `revoked` indique si la sanction est terminée (révoquée) ou non.
- `id`, à ne pas confondre avec l'id MongoDB `_id`, est l'identifiant unique de la sanction (8 caractères).
- `informations` est un objet comprenant diverses informations concernant la sanction :
  - `hasSentMessage` est un boolean qui ne sera définit que si la sanction est un ban. Il indique si l'utilisateur a envoyé des messages en étant banni (pour le drapeau `--autoban`).
- `updates` est un array contenant les modifications (mises à jour) de la sanction. Il y a un objet par modification, qui contient les propriétés suivantes :
  - `date` est le timestamp de création de la modification.
  - `moderator` est l'ID Discord du modérateur qui a fait la modification.
  - `type` est le type de modification, qui peut être un des suivants :
    - `revoked` si la modification est une annulation.
    - `duration` si la modification concerne la durée.
  - `valueBefore` est la valeur avant la modification. Pour le moment, ça ne peut être que la durée, donc ce sera un nombre.
  - `valueBefore` est la valeur après la modification. Pour le moment, ça ne peut être que la durée, donc ce sera un nombre.
  - `reason` est la raison pour laquelle la modification a été faite.
