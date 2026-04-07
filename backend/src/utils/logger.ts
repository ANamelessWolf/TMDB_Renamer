import winston from 'winston';
import { env } from '../config/env';

const { combine, timestamp, printf, colorize } = winston.format;

const logFormat = printf(({ level, message, timestamp: ts, [Symbol.for('splat')]: splat }) => {
  // Second argument passed to logger.error/warn/info (e.g. a stack trace string)
  const extra = splat?.[0];
  const stackStr = typeof extra === 'string' && extra.includes('\n') ? `\n${extra}` : '';
  return `${ts} [${level}] ${message}${stackStr}`;
});

export const logger = winston.createLogger({
  level: env.logLevel,
  format: combine(
    timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    env.nodeEnv === 'development' ? colorize({ all: true }) : winston.format.uncolorize(),
    logFormat,
  ),
  transports: [
    new winston.transports.Console(),
  ],
});

if (env.nodeEnv !== 'test') {
  logger.info('Logger initialized');
}
