/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
import { createProxyMiddleware } from 'http-proxy-middleware';

export function setupProxy(app: any) {
  app.use(
    '/weather',
    createProxyMiddleware({
      target: process.env.WEATHER_SERVICE_URL,
      changeOrigin: true,
    }),
  );

  app.use(
    '/subscription',
    createProxyMiddleware({
      target: process.env.SUBSCRIPTION_SERVICE_URL,
      changeOrigin: true,
    }),
  );
}
