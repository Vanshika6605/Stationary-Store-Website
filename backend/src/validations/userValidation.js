const { z } = require('zod');

const updatePasswordSchema = z.object({
  oldPassword: z.string().min(1, 'Old password is required'),
  newPassword: z.string()
    .min(8, 'New password must be at least 8 characters')
    .max(16, 'New password cannot exceed 16 characters')
    .regex(/[A-Z]/, 'New password must include at least one uppercase letter')
    .regex(/[^A-Za-z0-9]/, 'New password must include at least one special character')
});

const submitRatingSchema = z.object({
  storeId: z.number().int().positive('Valid store ID is required'),
  rating: z.number().int().min(1, 'Rating must be between 1 and 5').max(5, 'Rating must be between 1 and 5')
});

module.exports = {
  updatePasswordSchema,
  submitRatingSchema
};
