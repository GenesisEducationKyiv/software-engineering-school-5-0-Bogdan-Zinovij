import { Module } from "@nestjs/common";
import { LoggerPort } from "./logger.port";
import { AppLogger } from "./logger.service";
import { LokiLogger } from "./loki-logger.service";

const useLoki = process.env.LOGGER_DRIVER === "loki";

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
