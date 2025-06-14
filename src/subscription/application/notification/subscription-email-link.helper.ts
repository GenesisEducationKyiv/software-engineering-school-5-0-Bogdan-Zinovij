export class SubscriptionEmailLinkHelper {
  static getConfirmLink(domain: string, port: string, token: string): string {
    return `http://${domain}:${port}/subscription/confirm/${token}`;
  }

  static getUnsubscribeLink(
    domain: string,
    port: string,
    token: string,
  ): string {
    return `http://${domain}:${port}/subscription/unsubscribe/${token}`;
  }
}
