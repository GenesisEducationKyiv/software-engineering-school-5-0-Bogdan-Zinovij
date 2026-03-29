export class ConfirmationEmailRequestedEvent {
  constructor(
    public email: string,
    public token: string,
  ) {}
}
