/* eslint-disable import/no-cycle */
import fs from 'fs';
import { commands } from '../src/main';
import { success } from '../src/components/Messages';

const template = `
#### $name\n
- **Catégorie :** $category
- **Description :** $description
- **Aliases :** \`$aliases\`
- **Usage :** \`$usage\`
- **Exemples :** \`$examples\`
- **Cooldown :** $cooldown
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : $activeInHelpChannels
  - Permission(s) nécéssaire(s) pour éxécuter la commande : $permissions
  - Canaux requis / interdits : $requiredChannels / $prohibitedChannels
`;

function generateDocs() {
  let header = `# Documentation\n\nDocumentation de toutes les commandes de Swan (${commands.length})\n\n## Index\n\n`;
  let content = '\n## Commandes\n';

  const cmds = commands.sort((a, b) => a.name.localeCompare(b.name));
  for (const cmd of cmds) {
    header += `- [${cmd.name}]`; // Index name
    header += `(#### ${cmd.name})\n`.replace(/ +/g, '-'); // Index link

    content += template
      .replace('$name', cmd.name)
      .replace('$category', cmd.category)
      .replace('$description', cmd.description)
      .replace('$aliases', cmd.aliases.join('` | `'))
      .replace('$usage', cmd.usage)
      .replace('$examples', cmd.examples.join('` | `'))
      .replace('$cooldown', cmd.cooldown === 0 ? 'aucun' : `${cmd.cooldown / 1000} secondes`)
      .replace('$activeInHelpChannels', cmd.activeInHelpChannels ? '✅' : '❌')
      .replace('$permissions', cmd.permissions.join(', ') || 'aucune')
      .replace('$requiredChannels', cmd.requiredChannels.length || 'aucun')
      .replace('$prohibitedChannels', cmd.prohibitedChannels.length || 'aucun');
  }

  const path = `${__dirname}/generated/commands.md`;
  try {
    fs.writeFile(path, header + content, (err) => {
      if (err) return console.error(err);
      success('Documentation updated!');
    });
  } catch (err) {
    return console.error(err);
  }
}

export default generateDocs;
