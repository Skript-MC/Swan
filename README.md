# Skript-mc-Bot

"commandes": {
		"aide": {
			"syntaxe": "(aide|help)",
			"description": "Affiche la liste des commandes.",
			"exemple": "aide",
			"embed": {
				"couleur": "#4286f4"
			},
			"executable_par": []
		},
		"musique": {
			"jouer": {
				"syntaxe": "musique (play|joue) <lien>",
				"description": [
					"Joue une musique dans un channel à partir d'un lien YouTube. Si une musique est déjà jouée,",
					"alors la musique que vous avez demandé sera ajouté à la file d'attente."
				],
				"exemple": "musique joue https://www.youtube.com/watch?v=BTF_ZbxLDbQ",
				"embed": {
					"couleur": "#6aedc1"
				},
				"executable_par": []
			},
			"actuelle": {
				"syntaxe": "musique (actuelle|maintenant|jouée)",
				"description": "Affiche la musique qui est en train d'être jouée.",
				"exemple": "musique joue https://www.youtube.com/watch?v=BTF_ZbxLDbQ",
				"embed": {
					"couleur": "#6aedc1"
				},
				"executable_par": []
			}
		}
	},