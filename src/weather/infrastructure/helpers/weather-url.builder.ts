export function buildOpenWeatherMapUrl(
  baseUrl: string,
  apiKey: string,
  city: string,
): string {
  return `${baseUrl}?q=${encodeURIComponent(city)}&appid=${apiKey}&units=metric`;
}

export function buildWeatherApiUrl(
  baseUrl: string,
  apiKey: string,
  city: string,
): string {
  return `${baseUrl}?key=${apiKey}&q=${encodeURIComponent(city)}&aqi=no`;
}
