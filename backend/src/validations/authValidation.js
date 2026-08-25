const { z } = require('zod');

// Enforces the strict rules from the challenge requirements
const registerSchema = z.object({
  name: z.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Invalid email address format'),
  address: z.string()
    .max(400, 'Address cannot exceed 400 characters')
    .optional(),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character')
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address format'),
  password: z.string()
});

module.exports = { registerSchema, loginSchema };