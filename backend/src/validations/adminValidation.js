const { z } = require('zod');

const addUserSchema = z.object({
  name: z.string()
    .min(20, 'Name must be at least 20 characters')
    .max(60, 'Name cannot exceed 60 characters'),
  email: z.string().email('Invalid email address format'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .max(16, 'Password cannot exceed 16 characters')
    .regex(/[A-Z]/, 'Password must include at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'Password must include at least one special character'),
  address: z.string()
    .max(400, 'Address cannot exceed 400 characters')
    .optional(),
  role: z.enum(['ADMIN', 'NORMAL', 'STORE_OWNER'], {
    errorMap: () => ({ message: 'Role must be ADMIN, NORMAL, or STORE_OWNER' })
  })
});

const addStoreSchema = z.object({
  name: z.string()
    .min(1, 'Store name is required')
    .max(60, 'Store name cannot exceed 60 characters'),
  email: z.string().email('Invalid store email format'),
  address: z.string()
    .min(1, 'Address is required')
    .max(400, 'Address cannot exceed 400 characters'),
  ownerId: z.number().int().positive().optional().nullable()
});

module.exports = {
  addUserSchema,
  addStoreSchema
};
