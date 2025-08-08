import { Injectable } from '@nestjs/common';
import { CacheService } from '../domain/cache.service';

@Injectable()
export class InMemoryCacheService implements CacheService {
  private store = new Map<string, { value: any; expires: number }>();

  // eslint-disable-next-line @typescript-eslint/require-await
  async get<T>(key: string): Promise<T | null> {
    const record = this.store.get(key);
    if (!record || Date.now() > record.expires) {
      this.store.delete(key);
      return null;
    }

    return record.value as T;
  }

  // eslint-disable-next-line @typescript-eslint/require-await
  async set<T>(key: string, value: T, ttlSeconds: number): Promise<void> {
    const expires = Date.now() + ttlSeconds * 1000;
    this.store.set(key, { value, expires });
  }
}
