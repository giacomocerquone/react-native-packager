import chalk from "chalk";

const logTypes: any = {
  warning: (text: string) => chalk.yellowBright(`\n[! Warning]\n${text}`),
  error: (text: string) => chalk.red(`\n[X Error]\n${text}`),
  info: (text: string) => chalk.green(`\n[V Info]\n${text}`)
};

function log(message: string, type: "info" | "warning" | "error") {
  console.log(logTypes[type](message));
}

export function info(message: string) {
  return log(message, "info");
}

export function warning(message: string) {
  return log(message, "warning");
}

export function error(message: string) {
  return log(message, "error");
}
