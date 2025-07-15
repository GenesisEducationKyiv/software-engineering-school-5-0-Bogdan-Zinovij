export abstract class MetricsService {
  abstract incWeatherCacheHit(): void;
  abstract incWeatherCacheMiss(): void;
}
