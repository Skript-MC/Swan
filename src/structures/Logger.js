import chalk from 'chalk';
import { padNumber } from '../utils';

const verbose = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.currentStep = 0;
  }

  /**
   * Logs a message with a prefix and the date
   * @param {string} msg - The message to log
   */
  log(msg) {
    console.log(chalk.blue('[Swan] LOG:    ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.white(msg));
  }

  /**
   * Logs a message with a prefix and the date, only if in NODE_ENV is "development".
   * @param {string} msg - The message to log
   */
  debug(msg) {
    if (verbose) {
      console.log(chalk.blue('[Swan] DEBUG:  ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.cyan(msg));
    }
  }

  /**
   * Shows a warning with a prefix and the date
   * @param {string} msg - The message to log
   */
  warn(msg) {
    console.warn(chalk.blue('[Swan] WARN:   ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.yellow(`⚠ ${msg}`));
  }

  /**
   * Shows an error with a prefix and the date
   * @param {string} msg - The message to log
   */
  error(msg) {
    console.log(chalk.blue('[Swan] ERROR:  ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.red('✖ Error:'));
    console.error(msg);
  }

  /**
   * Shows a success message with a prefix and the date
   * @param {string} msg - The message to log
   */
  success(msg) {
    console.log(chalk.blue('[Swan] SUCESS: ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.green(`✔️ ${msg}`));
  }

  /**
   * Shows a success message, with a prefix, the date and the step number (automatically increments)
   * @param {string} msg - The message to log
   * @param {boolean} important - If the message is important (if it should be bold). Defaults to false.
   */
  step(msg, important = false) {
    this.currentStep++;
    if (important) {
      console.log(chalk.blue('[Swan] LOG:    ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.bold.green(`(${this.currentStep}) ${msg}`));
    } else {
      console.log(chalk.blue('[Swan] LOG:    ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.green(`(${this.currentStep}) ${msg}`));
    }
  }
}

export default Logger;
