import { config } from '../main';

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
     * Configuration de la commande (config.messages.commands.la_commande)
     */
    this.config = config.messages.commands[name.toLowerCase().replace(/\s/gmui, '_')];

    /**
     * Nom de la commande
     * @type {string}
     */
    this.name = name;

    /**
     * Longue description de la commande
     * @type {string}
     */
    this.description = (this.config && this.config.description) ? this.config.description : `Commande ${name}`;

    /**
     * Courte description de la commande
     * @type {string}
     */
    this.help = (this.config && this.config.help) ? this.config.help : `Commande ${name}`;

    /**
     * Pattern d'utilisation de la commande
     * @type {string}
     */
    this.usage = (this.config && this.config.usage) ? this.config.usage : name.toLowerCase().replace(/\s/gmui, '_');

    /**
     * Examples d'utilisation de la commande
     * @type {string[]}
     */
    this.examples = (this.config && this.config.examples) ? this.config.examples : [];

    /**
     * Pattern Regex qui déclenche la commande
     * @type {RegExp}
     */
    this.regex = (this.config && this.config.regex) ? this.config.regex : new RegExp(name, 'gimu');

    /**
     * ID des rôles pouvant éxecuter la commande
     * @type {string[]}
     */
    this.permissions = (this.config && this.config.permissions) ? this.config.permissions : [];

    /**
     * ID des channels dans lesquels on doit executer la commande
     * @type {string[]}
     */
    this.requiredChannels = (this.config && this.config.requiredChannels) ? this.config.requiredChannels : [];
    if (config.bot.default_channels.length > 0) {
      for (const channel of config.bot.default_channels) {
        this.requiredChannels.push(channel);
      }
    }

    /**
     * ID des channels dans lesquels on ne peut pas executer la commande
     * @type {string[]}
     */
    this.prohibitedChannels = (this.config && this.config.prohibitedChannels) ? this.config.prohibitedChannels : [];

    /**
     * Catégorie de la commande (= le dossier dans lequel elle se trouve)
     * @type {string}
     */
    this.category = (this.config && this.config.category) ? this.config.category : config.messages.miscellaneous.noCategory;
  }

  /**
   * Fonction qui s'execute lors du chargement du bot
   * @async
   */
  async init() {}

  /**
   * Fonction qui s'execute lorsque l'on fait la commande
   * @param {Message} message - Message qui a déclenché la commande
   * @param {string[]} args - Arguments de la commande.
   * @async
   */
  async execute(message, args) {}
}

export default Command;
