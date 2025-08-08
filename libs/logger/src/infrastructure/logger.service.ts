import { Injectable, Scope } from '@nestjs/common';
import { createLogger, format, transports } from 'winston';
import { LoggerPort } from '../domain/logger.port';
import { SampleLogger } from '../utils/sample-logger.util';

const { combine, timestamp, printf, colorize } = format;

const customFormat = printf(({ level, message, timestamp }) => {
  return `[${String(timestamp)}] ${String(level)}: ${String(message)}`;
});

@Injectable({ scope: Scope.TRANSIENT })
export class AppLogger implements LoggerPort {
  private readonly logger = createLogger({
    level: 'debug',
    format: combine(timestamp(), colorize(), customFormat),
    transports: [new transports.Console()],
  });

  private readonly sampleLoggers = new Map<string, SampleLogger>();

  info(message: string, context?: string, sampleRate?: number): void {
    if (sampleRate && !this.shouldSample(message, context, sampleRate)) return;
    this.logger.info(this.formatMessage(message, context));
  }

  debug(message: string, context?: string, sampleRate?: number): void {
    if (sampleRate && !this.shouldSample(message, context, sampleRate)) return;
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

  private shouldSample(
    message: string,
    context = 'default',
    sampleRate: number
  ): boolean {
    const key = `${context}::${message}`;
    if (!this.sampleLoggers.has(key)) {
      this.sampleLoggers.set(key, new SampleLogger(sampleRate));
    }
    return this.sampleLoggers.get(key)!.shouldLog();
  }
}
