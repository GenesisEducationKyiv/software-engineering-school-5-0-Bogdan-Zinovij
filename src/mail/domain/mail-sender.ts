export abstract class MailSender {
  abstract sendMail(params: {
    receiverEmail: string;
    subject: string;
    html: string;
  }): Promise<void>;
}
