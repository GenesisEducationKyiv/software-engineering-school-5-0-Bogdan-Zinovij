import * as Joi from 'joi';

export const validationSchema = Joi.object({
  SMTP_HOST: Joi.string().required(),
  SMTP_PORT: Joi.string().pattern(/^\d+$/).required(),
  SMTP_USER: Joi.string().required(),
  SMTP_PASSWORD: Joi.string().required(),
  SMTP_SENDER_NAME: Joi.string().optional(),
  SMTP_SENDER_EMAIL: Joi.string().email().required(),
});
