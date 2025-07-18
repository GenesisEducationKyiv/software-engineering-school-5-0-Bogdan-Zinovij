import * as Joi from 'joi';

export const validationSchema = Joi.object({
  POSTGRES_HOST: Joi.string().required(),
  POSTGRES_PORT: Joi.string().pattern(/^\d+$/).required(),
  POSTGRES_USER: Joi.string().required(),
  POSTGRES_PASSWORD: Joi.string().required(),
  POSTGRES_DB: Joi.string().required(),

  WEATHER_API_BASE_URL: Joi.string().uri().required(),
  WEATHER_API_KEY: Joi.string().required(),

  OPENWEATHER_API_BASE_URL: Joi.string().uri().required(),
  OPENWEATHER_API_KEY: Joi.string().required(),

  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.string().pattern(/^\d+$/).required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_SENDER_NAME: Joi.string().optional(),
  SMTP_SENDER_EMAIL: Joi.string().email().required(),

  REDIS_HOST: Joi.string().required(),
  REDIS_PORT: Joi.string().pattern(/^\d+$/).required(),
  REDIS_TTL: Joi.string().pattern(/^\d+$/).required(),
});
