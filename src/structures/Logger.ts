import chalk from 'chalk';
import { padNumber } from '@/app/utils';

export default {
  _getTime(): string {
    const now = new Date(Date.now());
    return `${padNumber(now.getDate())}/${padNumber(now.getMonth() + 1)} ${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
  },

  info(message: string): void {
    console.log(
      chalk.cyan('Swan:'),
      chalk.bold.blue('LOG    '),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.white(message),
    );
  },

  success(message: string): void {
    console.log(
      chalk.cyan('Swan:'),
      chalk.bold.blue('SUCCESS'),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.green(`✓ ${message}`),
    );
  },

  warn(message: string): void {
    console.warn(
      chalk.cyan('Swan:'),
      chalk.bold.blue('WARN   '),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.yellow(`⚠ ${message}`),
    );
  },

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

  detail(message = '', neutral = false): void {
    const messages = message.split('\n');
    console.group();
    for (const msg of messages)
      console.debug(chalk.cyan(neutral ? msg : `↳ ${msg}`));
    console.groupEnd();
  },
};
