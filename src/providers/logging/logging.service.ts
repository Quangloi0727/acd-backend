import { Injectable } from '@nestjs/common';
import * as winston from 'winston';

winston.config.allColors = {
  error: 'red',
  warn: 'yellow',
  warning: 'darkred',
  info: 'green',
  debug: 'cyan',
};

export const winstonLoggerOptions = {
  level: process.env.LOG_LEVEL || 'debug',
  levels: winston.config.syslog.levels,
  exitOnError: false,
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.timestamp(),
        winston.format.printf((info) => {
          const { timestamp, level, message } = info;

          const marker_name = info.marker ? info.marker.name : 'unknown';
          const name = info.context ? info.context : marker_name;

          const ts = timestamp.slice(0, 19).replace('T', ' ');
          return `${ts} [${level}] [${name}]: ${message}`;
        }),
      ),
    }),
  ],
};

@Injectable()
export class LoggingService {
  private winstonLogger: winston.Logger;

  constructor() {
    this.winstonLogger = winston.createLogger(winstonLoggerOptions);
  }

  async debug(marker: any, message: string, args?: any): Promise<void> {
    if (args) {
      this.winstonLogger.debug(message, { marker, args });
    } else {
      this.winstonLogger.debug(message, { marker });
    }
  }

  async info(marker: any, message: string, args?: any): Promise<void> {
    if (args) {
      this.winstonLogger.info(message, { marker, args });
    } else {
      this.winstonLogger.info(message, { marker });
    }
  }

  async warn(marker: any, message: string, args?: any): Promise<void> {
    if (args) {
      this.winstonLogger.warn(message, { marker, args });
    } else {
      this.winstonLogger.warn(message, { marker });
    }
  }

  async error(marker: any, message: string, args?: any): Promise<void> {
    if (args) {
      this.winstonLogger.error(message, { marker, args });
    } else {
      this.winstonLogger.error(message, { marker });
    }
  }
}
