import { Injectable, OnModuleDestroy } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';
import { WEATHER_LOG_FILE_PATH } from './weather-logger.config';

@Injectable()
export class WeatherLogger implements OnModuleDestroy {
  private readonly stream: fs.WriteStream;

  constructor() {
    const logDir = path.dirname(WEATHER_LOG_FILE_PATH);
    if (!fs.existsSync(logDir)) {
      fs.mkdirSync(logDir, { recursive: true });
    }

    this.stream = fs.createWriteStream(WEATHER_LOG_FILE_PATH, { flags: 'a' });
  }

  log(provider: string, message: string): void {
    const timestamp = new Date().toISOString();
    const fullMessage = `[${timestamp}] ${provider} - ${message}\n`;
    this.stream.write(fullMessage);
  }

  onModuleDestroy() {
    this.stream.end();
  }
}
