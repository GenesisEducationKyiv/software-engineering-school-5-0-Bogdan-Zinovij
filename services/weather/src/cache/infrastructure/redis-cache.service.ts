import { Injectable } from '@nestjs/common';
import { CacheService } from '../domain/cache.service';
import Redis from 'ioredis';

@Injectable()
export class RedisCacheService implements CacheService {
  private readonly client: Redis;

  constructor() {
    this.client = new Redis({
      host: process.env.REDIS_HOST,
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
    });
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.client.get(key);
    try {
      return val ? (JSON.parse(val) as T) : null;
    } catch (error) {
      console.error(`Error parsing JSON for key ${key}:`, error);
      return null;
    }
  }

  async set<T>(key: string, value: T, ttl: number): Promise<void> {
    await this.client.set(key, JSON.stringify(value), 'EX', ttl);
  }
}
