import { WeatherLogger } from './weather.logger';
import * as fs from 'fs';
import * as path from 'path';

jest.mock('fs');

describe('WeatherLogger', () => {
  let logger: WeatherLogger;
  let mockWriteStream: { write: jest.Mock; end: jest.Mock };

  beforeEach(() => {
    mockWriteStream = {
      write: jest.fn(),
      end: jest.fn(),
    };

    (fs.existsSync as jest.Mock).mockReturnValue(true);
    (fs.createWriteStream as jest.Mock).mockReturnValue(mockWriteStream);

    logger = new WeatherLogger();
  });

  it('should write formatted log message', () => {
    const provider = 'test-provider';
    const message = 'test log';

    logger.log(provider, message);

    expect(mockWriteStream.write).toHaveBeenCalledWith(
      expect.stringMatching(/\[.*\] test-provider - test log\n/),
    );
  });

  it('should end stream on destroy', () => {
    logger.onModuleDestroy();
    expect(mockWriteStream.end).toHaveBeenCalled();
  });

  it('should create logs directory if it does not exist', () => {
    (fs.existsSync as jest.Mock).mockReturnValue(false);
    const mkdirSpy = jest.spyOn(fs, 'mkdirSync');

    new WeatherLogger();

    expect(mkdirSpy).toHaveBeenCalledWith(path.resolve(process.cwd(), 'logs'), {
      recursive: true,
    });
  });
});
