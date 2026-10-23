import { z } from 'zod';

export const createUserSchema = z.object({
  email: z.string().trim().min(1, 'Email is required').email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  role: z.enum(['ADMIN', 'APPRENTICE']).default('APPRENTICE'),
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  branchId: z.string().optional().nullable().or(z.literal('')),
});

export type CreateUserInput = z.input<typeof createUserSchema>;

export const createBranchWithHeadSchema = z.object({
  branchName: z.string().trim().min(1, 'Branch name is required').max(100),
  branchAddress: z.string().trim().min(1, 'Branch address is required').max(255),
  managerFirstName: z.string().trim().min(1, 'Manager first name is required'),
  managerLastName: z.string().trim().min(1, 'Manager last name is required'),
  managerEmail: z.string().trim().min(1, 'Manager email is required').email('Invalid email address'),
  managerPassword: z.string().min(6, 'Manager password must be at least 6 characters'),
});

export type CreateBranchWithHeadFormInput = z.infer<typeof createBranchWithHeadSchema>;

export const updateProfileSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required'),
  lastName: z.string().trim().min(1, 'Last name is required'),
  currentPassword: z.string().optional(),
  newPassword: z.string().optional(),
  confirmPassword: z.string().optional(),
}).refine((data) => {
  if (data.newPassword && data.newPassword.length < 6) {
    return false;
  }
  return true;
}, {
  message: 'New password must be at least 6 characters',
  path: ['newPassword'],
}).refine((data) => {
  if (data.newPassword && !data.currentPassword) {
    return false;
  }
  return true;
}, {
  message: 'Current password is required to set new password',
  path: ['currentPassword'],
}).refine((data) => {
  if (data.newPassword && data.newPassword !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: 'Passwords do not match',
  path: ['confirmPassword'],
});

export type UpdateProfileInput = z.infer<typeof updateProfileSchema>;
