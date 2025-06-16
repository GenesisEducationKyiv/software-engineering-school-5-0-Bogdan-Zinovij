const domain = process.env.APP_DOMAIN ?? 'localhost';
const port = process.env.APP_PORT ?? '3000';

export class SubscriptionEmailLinkHelper {
  static getConfirmLink(token: string): string {
    return `http://${domain}:${port}/subscription/confirm/${token}`;
  }

  static getUnsubscribeLink(token: string): string {
    return `http://${domain}:${port}/subscription/unsubscribe/${token}`;
  }
}
