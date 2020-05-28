import fs from 'fs';

const template = `\n
### <a name="$anchor"></a>$name\n
- **Catégorie :** $category
- **Description :** $description
- **Alias :** \`$aliases\`
- **Usage :** \`$usage\`
- **Exemples :** \`$examples\`
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
  let header = `# Documentation de Swan\n\nCette page regroupe les **${commands.length} commandes** disponibles sur Swan.\n\n## Accès rapides\n\n`;
  let content = '\n## Commandes\n';

  const cmds = commands.sort((a, b) => a.name.localeCompare(b.name));
  for (const cmd of cmds) {
    header += `- [${cmd.name}]`; // Index name
    header += `(#${cmd.name})\n`.replace(/ +/g, '-'); // Index link

    content += template
      .replace('$name', cmd.name)
      .replace('$anchor', cmd.name.replace(/ +/g, '-'))
      .replace('$category', cmd.category)
      .replace('$description', cmd.description)
      .replace('$aliases', cmd.aliases.join('`, `'))
      .replace('$usage', cmd.usage)
      .replace('$examples', cmd.examples.join('`, `'));
    if (cmd.cooldown || cmd.permissions.join(', ') || cmd.requiredChannels.length || cmd.prohibitedChannels.length || !cmd.enabledInHelpChannels) {
      content += '- **Informations supplémentaires :**\n';
      if (cmd.cooldown) content += `\t- ⚠️ Le temps de réutilisation de cette commande est de \`${cmd.cooldown / 1000} secondes\`.\n`;
      if (!cmd.enabledInHelpChannels) content += '\t- ⚠️ Cette commande ne peut pas être exécutée dans les salons d\'aide.\n';
      if (cmd.permissions.join(', ')) content += `\t- ⚠️ Seul les membres ayant le rôle \`${cmd.permissions.join(', ')}\` ou supérieur peuvent exécuter cette commande.\n`;
      if (cmd.requiredChannels.length) content += `\t- ⚠️ Les canaux requis sont **${cmd.requiredChannels}**.\n`;
      if (cmd.prohibitedChannels.length) content += `\t- ⚠️ Cette commande est interdite dans les salons **${cmd.prohibitedChannels}**.\n`;
    }
  }

  const path = `${__dirname}/../docs/index.md`;
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
