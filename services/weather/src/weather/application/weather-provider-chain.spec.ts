/* eslint-disable @typescript-eslint/unbound-method */
import { WeatherProviderChain } from './weather-provider-chain';
import { WeatherProvider } from '../domain/interfaces/weather-provider.interface';
import { WeatherData } from '../domain/types/weather-data.type';

describe('WeatherProviderChain', () => {
  const city = 'Kyiv';
  const mockData: WeatherData = {
    temperature: 25,
    humidity: 60,
    description: 'Sunny',
  };

  it('should return result from first successful provider', async () => {
    const provider1: WeatherProvider = {
      getWeather: jest.fn().mockResolvedValue(mockData),
    };
    const provider2: WeatherProvider = { getWeather: jest.fn() };

    const chain = new WeatherProviderChain([provider1, provider2]);
    const result = await chain.getWeather(city);

    expect(result).toEqual(mockData);
    expect(provider1.getWeather).toHaveBeenCalledWith(city);
    expect(provider2.getWeather).not.toHaveBeenCalled();
  });

  it('should fallback to second provider if first fails', async () => {
    const provider1: WeatherProvider = {
      getWeather: jest.fn().mockRejectedValue(new Error('Fail')),
    };
    const provider2: WeatherProvider = {
      getWeather: jest.fn().mockResolvedValue(mockData),
    };

    const chain = new WeatherProviderChain([provider1, provider2]);
    const result = await chain.getWeather(city);

    expect(result).toEqual(mockData);
    expect(provider1.getWeather).toHaveBeenCalledWith(city);
    expect(provider2.getWeather).toHaveBeenCalledWith(city);
  });

  it('should throw error if all providers fail', async () => {
    const provider1: WeatherProvider = {
      getWeather: jest.fn().mockRejectedValue(new Error('Fail 1')),
    };
    const provider2: WeatherProvider = {
      getWeather: jest.fn().mockRejectedValue(new Error('Fail 2')),
    };

    const chain = new WeatherProviderChain([provider1, provider2]);
    await expect(chain.getWeather(city)).rejects.toThrow('Fail 2');
  });
});
