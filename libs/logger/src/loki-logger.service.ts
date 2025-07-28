import { Injectable, Scope } from "@nestjs/common";
import { LoggerPort } from "./logger.port";
import { createLogger, transports, format } from "winston";
import LokiTransport from "winston-loki";

@Injectable({ scope: Scope.TRANSIENT })
export class LokiLogger implements LoggerPort {
  private readonly logger = createLogger({
    level: "info",
    transports: [
      new LokiTransport({
        host: process.env.LOKI_URL ?? "http://localhost:3100",
        labels: { job: "nestjs-service" },
        json: true,
        replaceTimestamp: true,
        interval: 5,
        timeout: 5000,
      }),
      new transports.Console({ format: format.simple() }),
    ],
  });

  info(message: string, context?: string): void {
    this.logger.info(this.formatMessage(message, context));
  }

  debug(message: string, context?: string): void {
    this.logger.debug(this.formatMessage(message, context));
  }

  warn(message: string, context?: string): void {
    this.logger.warn(this.formatMessage(message, context));
  }

  error(message: string, trace?: string, context?: string): void {
    const base = this.formatMessage(message, context);
    this.logger.error(trace ? `${base} - ${trace}` : base);
  }

  private formatMessage(message: string, context?: string): string {
    return context ? `[${context}] ${message}` : message;
  }
}
