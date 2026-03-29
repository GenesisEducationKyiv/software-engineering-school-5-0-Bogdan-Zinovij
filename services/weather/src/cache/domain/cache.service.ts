export abstract class CacheService {
  abstract get<T = any>(key: string): Promise<T | null>;
  abstract set<T = any>(
    key: string,
    value: T,
    ttlSeconds: number,
  ): Promise<void>;
}
