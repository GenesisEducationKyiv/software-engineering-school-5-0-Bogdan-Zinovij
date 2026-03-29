import { Module } from '@nestjs/common';
import { LoggerPort } from './domain/logger.port';
import { AppLogger } from './infrastructure/logger.service';
import { LokiLogger } from './infrastructure/loki-logger.service';

const useLoki = process.env.LOGGER_DRIVER === 'loki';

@Module({
  providers: [
    AppLogger,
    LokiLogger,
    {
      provide: LoggerPort,
      useClass: useLoki ? LokiLogger : AppLogger,
    },
  ],
  exports: [LoggerPort],
})
export class LoggerModule {}
