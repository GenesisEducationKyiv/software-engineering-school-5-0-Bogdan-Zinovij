export type OpenWeatherMapResponse = {
  main: {
    temp: number;
    humidity: number;
  };
  weather: {
    description: string;
  }[];
};
