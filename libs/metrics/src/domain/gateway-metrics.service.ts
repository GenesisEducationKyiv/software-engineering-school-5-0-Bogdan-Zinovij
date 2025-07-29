export abstract class GatewayMetricsService {
  abstract incHttpRequests(
    route: string,
    method: string,
    statusCode: number
  ): void;
}
