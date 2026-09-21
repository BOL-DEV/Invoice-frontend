'use client';

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { updateProfileSchema, UpdateProfileInput } from '../../features/users/schemas';
import { useUpdateProfile } from '../../features/users/hooks/useUsers';
import { useAuth } from '../../features/auth/context/AuthContext';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { User, Lock, Shield, CheckCircle2, AlertCircle, Loader2, Eye, EyeOff } from 'lucide-react';
import { AxiosErrorLike } from '../../types/api';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose }) => {
  const { user, updateCurrentUser } = useAuth();
  const updateProfileMutation = useUpdateProfile();
  
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (isOpen && user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setErrorMsg(null);
      setSuccessMsg(null);
    }
  }, [isOpen, user, reset]);

  const onSubmit = async (data: UpdateProfileInput) => {
    setErrorMsg(null);
    setSuccessMsg(null);
    try {
      const payload: {
        firstName: string;
        lastName: string;
        currentPassword?: string;
        newPassword?: string;
      } = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      if (data.newPassword) {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      const updatedUser = await updateProfileMutation.mutateAsync(payload);
      updateCurrentUser(updatedUser);
      setSuccessMsg('Profile details updated successfully!');
      
      // Clear password fields
      reset({
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      setTimeout(() => {
        setSuccessMsg(null);
      }, 4000);
    } catch (err) {
      const msg = (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to update profile details';
      setErrorMsg(msg);
    }
  };

  if (!user) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-card border-border rounded-2xl p-6 shadow-2xl max-w-lg w-full">
        <form onSubmit={handleSubmit(onSubmit)}>
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex items-center space-x-2.5 font-bold font-heading text-lg">
              <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                <User className="h-4 w-4" />
              </div>
              <span>My Account Profile</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Manage your personal identification details and account security credentials.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-5 max-h-[70vh] overflow-y-auto px-1">
            {/* Feedback Alerts */}
            {errorMsg && (
              <div className="flex items-center space-x-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            {successMsg && (
              <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span>{successMsg}</span>
              </div>
            )}

            {/* Read-Only Account Overview Card */}
            <div className="p-4 rounded-xl bg-secondary/50 border border-border flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">Account Email</span>
                <p className="text-xs font-semibold text-foreground font-mono">{user.email}</p>
              </div>
              <Badge className={user.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono text-[10px] font-bold' : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px] font-bold'}>
                {user.role === 'ADMIN' ? 'Administrator' : 'Cashier'}
              </Badge>
            </div>

            {/* Name Details Section */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                <Shield className="h-3.5 w-3.5" />
                <span>Personal Information</span>
              </h4>

              <div className="grid grid-cols-2 gap-3.5">
                <div className="space-y-1.5">
                  <Label htmlFor="profile-firstName" className="text-xs font-semibold text-muted-foreground">
                    First Name
                  </Label>
                  <Input
                    id="profile-firstName"
                    {...register('firstName')}
                    className="bg-background h-10 rounded-xl text-xs"
                  />
                  {errors.firstName && <p className="text-[11px] text-rose-500">{errors.firstName.message}</p>}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="profile-lastName" className="text-xs font-semibold text-muted-foreground">
                    Last Name
                  </Label>
                  <Input
                    id="profile-lastName"
                    {...register('lastName')}
                    className="bg-background h-10 rounded-xl text-xs"
                  />
                  {errors.lastName && <p className="text-[11px] text-rose-500">{errors.lastName.message}</p>}
                </div>
              </div>
            </div>

            {/* Password Change Section */}
            <div className="space-y-3 pt-2 border-t border-border">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5" />
                  <span>Security & Password</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Leave password fields blank if you do not wish to change your password.
                </p>
              </div>

              {/* Current Password */}
              <div className="space-y-1.5">
                <Label htmlFor="currentPassword" className="text-xs font-semibold text-muted-foreground">
                  Current Password
                </Label>
                <div className="relative">
                  <Input
                    id="currentPassword"
                    type={showCurrentPassword ? 'text' : 'password'}
                    placeholder="Required only when changing password"
                    {...register('currentPassword')}
                    className="bg-background h-10 rounded-xl text-xs pr-10"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCurrentPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  >
                    {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                  </button>
                </div>
                {errors.currentPassword && <p className="text-[11px] text-rose-500">{errors.currentPassword.message}</p>}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                {/* New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="newPassword" className="text-xs font-semibold text-muted-foreground">
                    New Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Min 6 characters"
                      {...register('newPassword')}
                      className="bg-background h-10 rounded-xl text-xs pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowNewPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                    >
                      {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {errors.newPassword && <p className="text-[11px] text-rose-500">{errors.newPassword.message}</p>}
                </div>

                {/* Confirm New Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="confirmPassword" className="text-xs font-semibold text-muted-foreground">
                    Confirm New Password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showNewPassword ? 'text' : 'password'}
                    placeholder="Repeat new password"
                    {...register('confirmPassword')}
                    className="bg-background h-10 rounded-xl text-xs"
                  />
                  {errors.confirmPassword && <p className="text-[11px] text-rose-500">{errors.confirmPassword.message}</p>}
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 gap-2">
            <Button type="button" variant="outline" onClick={onClose} className="rounded-xl h-10 text-xs px-4 cursor-pointer">
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting || updateProfileMutation.isPending}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-xs px-5 shadow-premium font-semibold cursor-pointer"
            >
              {isSubmitting || updateProfileMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Updating...</span>
                </>
              ) : (
                <span>Save Profile Changes</span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
