import chalk from 'chalk';
import { padNumber } from '@/app/utils';

export default {
  _getTime(): string {
    const now = new Date(Date.now());
    return `${padNumber(now.getDate())}/${padNumber(now.getMonth() + 1)} ${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
  },

  /**
   * Logs a message in stdout, with a special formatting and the "LOG" prefix.
   * @param {string} message - The message to log in stdout.
   * @returns void
   */
  info(message: string): void {
    console.log(
      chalk.cyan('Swan:'),
      chalk.bold.blue('LOG    '),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.white(message),
    );
  },

  /**
   * Logs a message in stdout, with a special formatting and the "SUCCESS" prefix.
   * @param {string} message - The message to log in stdout.
   * @returns void
   */
  success(message: string): void {
    console.log(
      chalk.cyan('Swan:'),
      chalk.bold.blue('SUCCESS'),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.green(`✓ ${message}`),
    );
  },

  /**
   * Logs a message in stdout, with a special formatting and the "WARN" prefix.
   * @param {string} message - The message to log in stdout.
   * @returns void
   */
  warn(message: string): void {
    console.warn(
      chalk.cyan('Swan:'),
      chalk.bold.blue('WARN   '),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.yellow(`⚠ ${message}`),
    );
  },

  /**
   * Logs a message in stdout, with a special formatting and the "ERROR" prefix.
   * @param {string} message - The message to log in stdout.
   * @returns void
   */
  error(message?: string): void {
    if (message) {
      console.error(
        chalk.cyan('Swan:'),
        chalk.bold.blue('ERROR  '),
        chalk.italic.gray(`(${this._getTime()})`),
        chalk.red(`✖ ${message}`),
      );
    }
  },

  /**
   * Logs a message in stdout, with aan arrow point from above to the message.
   * @param {string?} message - The message to log in stdout. Defaults to ''.
   * @param {boolean?} neutral - Whether to show the arrow or not. Defaults to false.
   * @returns void
   */
  detail(message = '', neutral = false): void {
    const messages = message.split('\n');
    console.group();
    for (const msg of messages)
      console.debug(chalk.cyan(neutral ? msg : `↳ ${msg}`));
    console.groupEnd();
  },
};
