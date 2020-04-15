import chalk from 'chalk';
import { padNumber } from '../utils';

const verbose = process.env.NODE_ENV === 'development';

class Logger {
  constructor() {
    this.currentStep = 0;
  }

  log(msg) {
    console.log(chalk.blue('[Swan] LOG:    ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.white(msg));
  }

  debug(msg) {
    if (verbose) {
      console.log(chalk.blue('[Swan] DEBUG:  ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.cyan(msg));
    }
  }

  warn(msg) {
    console.warn(chalk.blue('[Swan] WARN:   ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.yellow(`⚠ ${msg}`));
  }

  error(msg) {
    console.log(chalk.blue('[Swan] ERROR:  ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.red('✖ Error:'));
    console.error(msg);
  }

  success(msg) {
    console.log(chalk.blue('[Swan] SUCESS: ') + chalk.italic.gray(`(${padNumber(new Date(Date.now()).getHours())}:${padNumber(new Date(Date.now()).getMinutes())}) `) + chalk.green(`✔️ ${msg}`));
  }

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
