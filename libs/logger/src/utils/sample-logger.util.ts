export class SampleLogger {
  private counter = 0;

  constructor(private readonly sampleRate: number) {}

  shouldLog(): boolean {
    this.counter++;
    if (this.counter >= this.sampleRate) {
      this.counter = 0;
      return true;
    }
    return false;
  }
}
