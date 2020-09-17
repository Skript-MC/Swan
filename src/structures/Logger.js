import chalk from 'chalk';
import { padNumber } from '../utils';

class Logger {
  // TODO: Use private method notation once this is correctly implemented into babel/ESLint.
  // We currently have to install numerous plugins and dependencies.
  _getTime() {
    const now = new Date(Date.now());
    return `${padNumber(now.getDate())}/${padNumber(now.getMonth() + 1)} ${padNumber(now.getHours())}:${padNumber(now.getMinutes())}`;
  }

  info(message) {
    console.log(
      chalk.cyan('Swan:'),
      chalk.bold.blue('LOG    '),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.white(message),
    );
  }

  success(message) {
    console.log(
      chalk.cyan('Swan:'),
      chalk.bold.blue('SUCCESS'),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.green(`✓ ${message}`),
    );
  }

  warn(message) {
    console.warn(
      chalk.cyan('Swan:'),
      chalk.bold.blue('WARN   '),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.yellow(`⚠ ${message}`),
    );
  }

  error(message) {
    console.error(
      chalk.cyan('Swan:'),
      chalk.bold.blue('ERROR  '),
      chalk.italic.gray(`(${this._getTime()})`),
      chalk.red(`✖ ${message}`),
    );
  }

  detail(message) {
    const messages = message.split('\n');
    console.group();
    for (const msg of messages)
      console.debug(chalk.cyan(`↳ ${msg}`));
    console.groupEnd();
  }
}

export default Logger;
