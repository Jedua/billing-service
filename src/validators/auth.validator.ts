import { RequestHandler } from 'express';
import Joi from 'joi';

export const registerSchema = Joi.object({
  name: Joi.string().min(2).max(100).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).max(50).required(),
  virwocloudUserId: Joi.number().integer().optional(),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});



export const validateCustomerData: RequestHandler = (req, res, next) => {
  const schema = Joi.object({
    legal_name: Joi.string().required(),
    tax_id: Joi.string().pattern(/^[A-Z&Ñ]{3,4}\d{6}[A-V1-9][0-9A-Z]$/).required(),
    email: Joi.string().email().required(),
    // ... otras validaciones
  });

  const { error } = schema.validate(req.body.customerData);
  if (error) return res.status(400).json({ message: error.details[0].message });
  next();
};