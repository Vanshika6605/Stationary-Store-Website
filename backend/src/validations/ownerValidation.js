const { z } = require('zod');

const updateOwnerPasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(16, 'New password cannot exceed 16 characters')
    .regex(/[A-Z]/, 'New password must include at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'New password must include at least one special character')
});

module.exports = {
  updateOwnerPasswordSchema
};
