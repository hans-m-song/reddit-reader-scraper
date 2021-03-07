import fs from 'fs/promises';

const COLOR_RESET = '\x1b[0m';

const Level = {
  INF: '\x1b[44m\x1b[37m',
  LOG: '\x1b[47m\x1b[30m',
  WAR: '\x1b[43m\x1b[30m',
  ERR: '\x1b[41m\x1b[37m',
};

export type LogLevel = keyof typeof Level;

export type LogMeta = Record<string, string> | null | undefined;

const dispatch = (
  level: LogLevel,
  message: string,
  meta?: LogMeta,
  ...args: any[]
) => {
  const levelDisplay = [`${Level[level]}%s${COLOR_RESET}`, `[${level}]`];
  const metaDisplay = meta
    ? Object.entries(meta).map(([key, value]) => `[${key} = ${value}]`)
    : [];
  return console.log(...levelDisplay, message, ...metaDisplay, ...args);
};

type LogFn = (message: string, meta?: LogMeta, ...args: any[]) => void;

const info: LogFn = (...args) => dispatch('INF', ...args);
const log: LogFn = (...args) => dispatch('LOG', ...args);
const warning: LogFn = (...args) => dispatch('WAR', ...args);
const error: LogFn = (...args) => dispatch('ERR', ...args);
const file = (location: string, data: Buffer | string) =>
  fs.writeFile(location, data);

export const io = {info, log, warning, error, file};
