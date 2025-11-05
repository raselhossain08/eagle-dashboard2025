import { z } from 'zod';

export const createRoleSchema = z.object({
  name: z.string().min(1, 'Role name is required').regex(/^[a-z_]+$/, 'Role name must be lowercase with underscores'),
  displayName: z.string().min(1, 'Display name is required'),
  level: z.number().min(1).max(7),
  description: z.string().optional(),
  permissions: z.array(z.string()),
  isActive: z.boolean().default(true),
  color: z.string().regex(/^#[0-9A-F]{6}$/i, 'Invalid color format'),
  icon: z.string().min(1, 'Icon is required'),
  email: z.string().email('Invalid email').optional().or(z.literal('')),
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal(''))
});

export const updateRoleSchema = createRoleSchema.omit({ name: true }).extend({
  password: z.string().min(6, 'Password must be at least 6 characters').optional().or(z.literal(''))
});

export const createUserSchema = z.object({
  firstName: z.string().min(1, 'First name is required'),
  lastName: z.string().min(1, 'Last name is required'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  confirmPassword: z.string().min(1, 'Please confirm password'),
  phone: z.string().optional(),
  discordUsername: z.string().optional(),
  isActive: z.boolean().default(true),
  isEmailVerified: z.boolean().default(false),
  address: z.object({
    country: z.string().optional(),
    streetAddress: z.string().optional(),
    flatSuiteUnit: z.string().optional(),
    townCity: z.string().optional(),
    stateCounty: z.string().optional(),
    postcodeZip: z.string().optional()
  }).optional()
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

export type CreateRoleInput = z.infer<typeof createRoleSchema>;
export type UpdateRoleInput = z.infer<typeof updateRoleSchema>;
export type CreateUserInput = z.infer<typeof createUserSchema>;