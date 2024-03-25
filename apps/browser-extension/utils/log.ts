import chalk from 'chalk';

export const log = (...logs: any[]) => {
    console.info(chalk.blue(logs));
}