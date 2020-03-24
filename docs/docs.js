/* eslint-disable import/no-cycle */
import fs from 'fs';

const template = `
#### $name\n
- **Catégorie :** $category
- **Description :** $description
- **Aliases :** \`$aliases\`
- **Usage :** \`$usage\`
- **Exemples :** \`$examples\`
- **Cooldown :** $cooldown
- **Informations supplémentaires :**
  - Activée dans les canaux d'aide : $enabledInHelpChannels
  - Permission(s) nécéssaire(s) pour éxécuter la commande : $permissions
  - Canaux requis / interdits : $requiredChannels / $prohibitedChannels
`;

async function softLoadCommands(path) {
  const commands = await new Promise((resolve, _reject) => {
    fs.readdir(`${__dirname}/../src/${path}`, (err, files) => {
      if (err) throw err;
      const cmds = [];

      for (const file of files) {
        const stat = fs.statSync(`${__dirname}/../src/${path}/${file}`);
        if (stat.isDirectory() || file === '.DS_Store') continue;

        try {
          const Module = require(`${__dirname}/../src/${path}/${file}`).default; // eslint-disable-line global-require, import/no-dynamic-require
          const command = new Module();
          if (command.enabled) {
            command.category = path.replace('commands/', '');
            cmds.push(command);
          }
        } catch (e) {
          console.error(`Unable to load this command: ${file}`);
          throw new Error(e);
        }
      }

      resolve(cmds);
    });
  });
  return commands;
}

async function getAllCommands() {
  const commands = await new Promise((resolve, _reject) => {
    fs.readdir(`${__dirname}/../src/commands`, async (err, files) => {
      if (err) throw err;
      const cmds = [];

      for (const file of files) {
        const stat = fs.statSync(`${__dirname}/../src/commands/${file}`);

        if (stat.isDirectory()) {
          const someCommands = await softLoadCommands(`commands/${file}`);
          for (const cmd of someCommands) cmds.push(cmd);
        }
      }
      resolve(cmds);
    });
  });

  return commands;
}

async function generateDocs() {
  const commands = await getAllCommands();
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
      .replace('$enabledInHelpChannels', cmd.enabledInHelpChannels ? '✅' : '❌')
      .replace('$permissions', cmd.permissions.join(', ') || 'aucune')
      .replace('$requiredChannels', cmd.requiredChannels.length || 'aucun')
      .replace('$prohibitedChannels', cmd.prohibitedChannels.length || 'aucun');
  }

  const path = `${__dirname}/generated/commands.md`;
  try {
    fs.writeFile(path, header + content, (err) => {
      if (err) throw new Error(err);
      console.log('Documentation updated!');
      process.exit(0);
    });
  } catch (err) {
    throw new Error(err);
  }
}

generateDocs();
