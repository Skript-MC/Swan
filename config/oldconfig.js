		"eightBall": {
			"help": "Répond par Oui ou Non à une question que vous lui posez.",
			"description": "Le bot répondra par Oui ou Non à une n'importe quelle question que vous lui posez ! Réponse sûre garantie à 7%"
		},
		"addonInfo": {
			"help": "Avoir diverses informations sur un addon.",
			"description": "Obtenir diverses informations sur un addon, telles que son auteur, sa dernière version, un lien de téléchargement, si l'addon est déprecié, les dépendances...",
			"addonDoesntExist": "Désolé, mais il est impossible d'accéder à cet addon. Es-tu sur qu'il est disponible sur [skripttools](<https://skripttools.net/addons?q=%s>) ? Il doit être orthographié exactement pareil !",
			"invalidCmd": "Il faut que tu ajoutes le nom d'un addon ! Vérifie qu'il soit disponible sur [skripttools](<https://skripttools.net/>) et orthographie-le de la même manière. Les majuscules n'importes pas.",
			"list": "Liste des addons disponibles : `%s`",
			"embed": {
				"author": ":bust_in_silhouette: Auteur(s)",
				"version": ":gear: Dernière version",
				"download": ":inbox_tray: Lien de téléchargement",
				"sourcecode": ":computer: Code source",
				"depend": ":link: Dépendences obligatoires",
				"softdepend": ":link: Dépendences facultatives",
				"unmaintained": ":warning: Addon abandonné",
				"unmaintained_desc": "Cet addon a été abandonné par son auteur ! Il est fortement conseillé de ne pas l'utiliser."
			}
		},
		"skriptInfo": {
			"help": "Avoir diverses informations sur Skript.",
			"description": "Avoir diverses informations sur Skript, telles que sa version actuelle, un lien de téléchargement, les versions de Skript à utiliser selon la version minecraft...",
			"embed": {
				"author": ":bust_in_silhouette: Auteur(s)",
				"version": ":gear: Dernière version",
				"verInfo": "Information sur les versions de Skript",
				"verInfo_desc": ":black_small_square: Skript requiert Spigot pour fonctionner. Il ne fonctionnera donc pas avec Bukkit. Il est cependant conseillé d'utiliser PaperSpigot, car il vous permettera d'utiliser plus de fonctionnalités de skript.\n\n:black_small_square: La dernière version de skript ne supporte que les dernières versions de Minecraft, de la 1.9 à la 1.13. Cela veut dire que la 1.12.2 est supportée, mais pas la 1.12 par exemple.\n\n:black_small_square: La 1.8.x et antérieur ne sont pas et ne seront jamais supportées. Pour utiliser skript dans ces versions, vous pouvez toutefois utiliser une version plus vieille de skript. Par exemple, pour la 1.8, vous pouvez essayer d'utiliser la [2.2-dev26](https://bit.ly/2KXlrm9), la [2.2-dev27](https://github.com/bensku/Skript/releases/tag/dev27), la [2.2-dev25](https://github.com/bensku/Skript/releases/tag/dev25) ou la [2.2-Fixes V8b](https://bit.ly/2PtY56f). Pour la 1.7 et antérieur, vous pouvez essayer d'utiliser [ces versions](https://bit.ly/2oTdr9C).\n\n:black_small_square: Les dernières versions de Minecraft seront supportées le plus vite possible.",
				"download": ":inbox_tray: Lien de téléchargement",
				"sourcecode": ":computer: Code source"
			}
		},
		"serverInfo": {
			"help": "Afficher des informations sur un serveur.",
			"description": "Afficher diverses informations sur un certain serveur.",
			"embed": {
				"status": "Statut",
				"ip": "Adresse IP",
				"players": "Joueurs",
				"version": "Version",
				"hostname": "Nom d'hôte",
				"software": "Software",
				"plugins": "Plugins",
				"mods": "Mods"
			}
		},
		"playerInfos": {
			"help": "Afficher des informations sur un joueur.",
			"description": "Afficher diverses informations sur un certain joueur, que vous avez définit par son pseudo.",
			"pseudoNotFound": "Ce pseudo n'existe pas ! Il faut que le compte soit premium...",
			"noHistory": "Cet utilisateur n'a jamais changé de pseudo !",
			"embed": {
				"pseudo": "Pseudo actuel",
				"history": "Historique"
			}
		},
		"ticket": {
			"help": "Créer un ticket dans le salon des tickets.",
			"description": "Créer un ticket dans le salon des tickets, selon un modèle d'aide définit."
		},
		"poll": {
			"help": "Lancer un sondage.",
			"description": "Lancer un sondage temporaire par lequel on peut répondre Oui ou Non.",
			"invalidCmd": "Il doit y avoir un problème dans ta commande... Vérifie qu'elle soit construite de cette façon :\n```.sond DURÉE TITRE DESCRIPTION```\n**DURÉE** est composée d'un nombre suivis sans espaces de `s` pour `seconde` ou de `min` pour `minute` ou de `h` pour `heure` ou de `j` pour `jour`.\n**TITRE** est un texte, sans espace. Les \"_\" du titre seront convertis en espaces.\n**DESCRIPTION** est un texte, avec espace. Ce champs est facultatif.\nExemple de commande : ```.sond 10min Mon_titre Mon sondage !```",
			"pollInfos": "**Informations sur les sondages :**\nRéagissez par :white_check_mark: pour voter Oui à la question posée, ou réagissez par :x: pour voter Non. Au bout du temps définit, le décompte des votes est fait. Si vous enlevez votre réaction, elle sera tout de même comptée. Si vous mettez plusieurs réaction, c'est la 1ère mise qui sera comptée. Le vote commence lorsque l'embed devient bleu. Pour arrêter un vote, cliquez sur :octagonal_sign:.",
			"tooLong": "Désolé, mais la durée indiquée pour ce sondage est trop longue. Le maximum autorisé est de 7 jours (%sms)."
		},
		"tagRole": {
			"help": "Permet de notifier un rôle qui n'est pas mentionnable.",
			"description": "Permet de notifier un rôle qui n'est pas mentionnable.",
			"invalidCmd": "Il faut ajouter un rôle a mentionner !",
			"invalidRole": "Désolé, mais le rôle '%s' est introuvable... Êtes-vous sûr de l'avoir orthographié de la même façon ?"
		},