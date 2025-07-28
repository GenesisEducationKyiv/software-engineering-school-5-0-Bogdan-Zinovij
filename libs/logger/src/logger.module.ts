import { AppLogger } from "./logger.service";
import { LoggerPort } from "./logger.port";
import { Module } from "@nestjs/common";

@Module({
  providers: [
    {
      provide: LoggerPort,
      useClass: AppLogger,
    },
  ],
  exports: [LoggerPort],
})
export class LoggerModule {}
