import { client } from '../main';

/**
 * Représente une commande du bot
 */
class Command {
  /**
   * @param {string} name - Nom de la commande
   * @constructor
   */
  constructor(name) {
    /**
     * Configuration de la commande (client.config.messages.commands.la_commande)
     * @type {Object}
     */
    this.config = client.config.messages.commands[name.toLowerCase().replace(/\s/gimu, '')];

    /**
     * Nom de la commande
     * @type {string}
     */
    this.name = name;

    /**
     * Si la commande est activée
     * @type {boolean}
     */
    this.enabled = this.config?.enabled ?? true;

    /**
     * Si la commande est activée dans les channels d'aide
     * @type {boolean}
     */
    this.enabledInHelpChannels = true;

    /**
     * Longue description de la commande
     * @type {string}
     */
    this.description = this.config?.description ? this.config.description : `Commande ${name}`;

    /**
     * Courte description de la commande
     * @type {string}
     */
    this.help = this.config?.help ? this.config.help : `Commande ${name}`;

    /**
     * Pattern d'utilisation de la commande
     * @type {string}
     */
    this.usage = this.config?.usage ? this.config.usage : name.toLowerCase().replace(/\s/gmui, '_');

    /**
     * Examples d'utilisation de la commande
     * @type {string[]}
     */
    this.examples = this.config?.examples ? this.config.examples : [];

    /**
     * Aliases des commandes.
     * @type {string[]}
     */
    this.aliases = this.config?.aliases ? this.config.aliases : [];

    /**
     * ID des rôles pouvant éxecuter la commande
     * @type {string[]}
     */
    this.permissions = this.config?.permissions ? this.config.permissions : [];

    /**
     * ID des channels dans lesquels on doit executer la commande
     * @type {string[]}
     */
    this.requiredChannels = this.config?.requiredChannels ? this.config.requiredChannels : [];
    if (client.config.bot.defaultChannels.length > 0) {
      for (const channel of client.config.bot.defaultChannels) {
        this.requiredChannels.push(channel);
      }
    }

    /**
     * ID des channels dans lesquels on ne peut pas executer la commande
     * @type {string[]}
     */
    this.prohibitedChannels = this.config?.prohibitedChannels ? this.config.prohibitedChannels : [];

    /**
     * Catégorie de la commande (= le dossier dans lequel elle se trouve)
     * @type {string}
     */
    this.category = this.config?.category ? this.config.category : client.config.messages.miscellaneous.noCategory;

    /**
     * Cooldown de la commande
     * @type {Timestamp}
     */
    this.cooldown = this.config?.cooldown ? this.config.cooldown : 0;

    /**
     * Map des utilisateurs ayant un cooldown sur la commande (utilisateur mappés par leur ID discord)
     * @type {Map<Snowflake, Timestamp>)}
     */
    this.userCooldowns = new Map();
  }

  /**
   * Fonction qui s'execute lorsque l'on fait la commande
   * @param {Client} _client - Client, instancié sur le serveur
   * @param {Message} _message - Message qui a déclenché la commande
   * @param {string[]} _args - Arguments de la commande.
   * @async
   */
  async execute(_client, _message, _args) {} // eslint-disable-line no-empty-function

  static filterCooldown(commands) {
    for (const cmd of commands) {
      for (const [id, lastuse] of cmd.userCooldowns) {
        if (lastuse + cmd.cooldown >= Date.now()) cmd.userCooldowns.delete(id);
      }
    }
  }
}

export default Command;
