export abstract class WeatherMetricsService {
  abstract incWeatherCacheHit(): void;
  abstract incWeatherCacheMiss(): void;
}
