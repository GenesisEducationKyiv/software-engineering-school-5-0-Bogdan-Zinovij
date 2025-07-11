const API_GATEWAY_URL = process.env.API_GATEWAY_URL ?? 'http:/localhost:3000';

export class SubscriptionEmailLinkHelper {
  static getConfirmLink(token: string): string {
    return `${API_GATEWAY_URL}/subscription/confirm/${token}`;
  }

  static getUnsubscribeLink(token: string): string {
    return `${API_GATEWAY_URL}/subscription/unsubscribe/${token}`;
  }
}
