<p align="center"><img width=400px src="https://skript-mc.fr/assets/images/logo.png"></p>
<h2 align="center">Swan</h2>
<p align="center">
    Swan est un bot développé spécialement pour le serveur <a href="https://discord.com/invite/J3NSGaE">Discord</a> de <a href="https://skript-mc.fr">Skript-MC</a>.
</p>

## 🚀 Installation

- Installez [Node.js](https://nodejs.org/fr/) sur votre machine. Il vous faudra Node.js 22.18 ou supérieur.
- Téléchargez la [dernière version stable](https://github.com/Skript-MC/Swan/releases/latest), ou clonez ce dépôt pour tester les dernières modifications.
- Pensez à avoir une base de donnée MongoDB, le plus simple serait en local.
- Copiez le fichier `.env.example` vers `.env` et remplissez-le.
- Sur le [Portail des développeurs Discord](https://discord.com/developers/applications), activez les options `Server Members Intent` et `Presence Intent` de l'application.
- Exécutez la commande `npm i` pour installer les dépendances nécessaires.
- C'est parti ! Exécutez la commande `npm run dev` *(ou `npm start` en production)* pour démarrer Swan.

## 🔍 Rapport de bug et suggestions

- 🐛 Vous avez aperçu un bug en utilisant Swan ?
- 💡 Vous avez une idée ou une suggestion ?
- 💬 Vous souhaitez nous faire part de quelque chose ?

Vous pouvez vous rendre dans le [menu des issues](https://github.com/Skript-MC/Swan/issues) et en créer une ; nous y jetterons un œil dès que possible !
Si vous n'êtes pas très sûrs de vous, vous pouvez nous en parler sur le [Discord de développement](https://discord.com/njSgX3w).

:warning: Si vous pensez avoir trouvé une faille de sécurité, ou un bug pouvant compromettre Swan, veuillez en faire part en envoyant un message privé sur discord à un des [développeurs](#-Merci).

## 🔨 Développement et contributions

Nos Pull Request (PR) sont ouvertes à toute contribution ! Vous pouvez [créer un fork](https://github.com/Skript-MC/Swan/fork) (= une copie) de ce dépôt et y faire vos modifications. \
Voici quelques informations utiles avant de créer une Pull Request :

- 🔀 Faites vos modifications sur une nouvelle branche ! Ce sera plus simple ensuite pour tenir votre PR à jour.
- 🏷️ Créez votre PR vers la branche `dev` uniquement.
- 📦 Ajoutez le moins de dépendances possible.
- 🚨 Respectez les règles Biome ; vous pouvez vérifier avec la commande `npm run check`.
- ⚡️ Vérifiez qu'aucune vulnérabilité n'est présente ; via la commande `npm audit`.
- ✅ Pensez bien à tester votre nouvelle fonctionnalité, autant que possible !

N'hésitez pas à venir discuter et tester les nouveautés sur notre [Discord de développement](https://discord.com/njSgX3w) !
Vous pouvez trouver des idées de choses à faire en regardant les projets en cours, dans [l'onglet Projects](https://github.com/Skript-MC/Swan/projects), ou en regardant la [liste des Issues](https://github.com/Skript-MC/Swan/issues).

## ℹ️ Informations

Swan est un bot Discord développé en TypeScript (un dérivé de JavaScript avec un typage plus fort). Il utilise la librairie [discord.js](https://npmjs.com/package/discord.js) pour les appels à l'API Discord.
Depuis la version 3, il utilise également le framework [Sapphire](https://www.npmjs.com/package/@sapphire/framework), par-dessus discord.js.
Ce framework sert notamment à gérer les évènements, les commandes et les arguments...

Vous pouvez utiliser le bot pour votre propre serveur à condition de respecter la [License](https://github.com/Skript-MC/Swan/blob/master/LICENSE) (GNU-GPL-v3).

## 📂 Organisation du projet

- **`assets` :** 🏞 Dossier où se trouvent les images utilisées.
- **`dist`** *(pas sur GitHub)* **:** 🏗 Dossier où se trouve le code transpilé de Swan, après avoir lancé `npm run build` (ou `npm start`).
- **`config` :** 📑 Dossier où se trouvent tous les fichiers de configuration de Swan.
- **`src` :** 💻
  - **`commands` :** 💬 Dossier où se trouvent toutes les commandes, rangées dans des sous-dossiers correspondant à leurs catégories.
  - **`inhibitors` :** ⚙️ Fichiers exécutés avant qu'un message soit envoyé au `commandHandler`.
  - **`listeners` :** 👂 Dossier où se trouvent tous les gestionnaires d'évènement, rangés dans des sous-dossiers correspondant aux émetteurs.
  - **`models` :** 🗄 Fichiers des schemas mongoose.
  - **`moderation` :** 🔨 Dossier où se trouvent tous les fichiers concernant la modération, à l'exception des commandes (rangées dans `commands`) et des tâches (rangées dans `tasks`).
  - **`resolvers` :** 🧷 Types customs pour les arguments des commandes.
  - **`structures` :** 📦 Différentes classes utilisées à travers Swan.
  - **`tasks` :** ⏱ Fichiers exécutés périodiquement (appelés des "tâches").
  - **`types` :** 🏷 Fichiers contenant les typings TypeScript nécessaires pour Swan.
  - **`utils` :** 🧰 Dossier contenant différentes fonctions utilitaires.
- **`tools` :** 📄 Petits outils que l'on peut utiliser via `npm run tools:<nom du fichier>`.
- **`typings` :** 🏷 Fichiers contenant les typings TypeScript des librairies externes.

## 🙏 Merci

#### 👥 Développeurs

- [noftaly](https://github.com/noftaly) (noftaly#0359)
- [Romitou](https://github.com/Romitou) (Romitou#9685)

#### 👷 Contributeurs

- [Olyno](https://github.com/Olyno), ancien développeur (Olyno#1234)
- [Aless](https://github.com/BakaAless) (Aless#6161)
- [WeeskyBDW](https://github.com/WeeskyBDW) (WeeskyBDW#6172)
- [Skylyxx](https://github.com/Skylyxx) (Skylyxx#8816)
- [iTrooz](https://github.com/iTrooz) (iTrooz_#2050)
