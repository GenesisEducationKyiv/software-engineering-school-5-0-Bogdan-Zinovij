import * as Joi from 'joi';

export const validationSchema = Joi.object({
  WEATHER_API_BASE_URL: Joi.string().uri().required(),
  WEATHER_API_KEY: Joi.string().required(),

  OPENWEATHER_API_BASE_URL: Joi.string().uri().required(),
  OPENWEATHER_API_KEY: Joi.string().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.string().pattern(/^\d+$/).required(),
  REDIS_TTL: Joi.string().pattern(/^\d+$/).required(),
});
