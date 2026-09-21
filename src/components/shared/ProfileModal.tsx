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
import { User, Shield, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
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
      const payload = {
        firstName: data.firstName,
        lastName: data.lastName,
      };

      const updatedUser = await updateProfileMutation.mutateAsync(payload);
      updateCurrentUser(updatedUser);
      setSuccessMsg('Profile details updated successfully!');
      
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
      <DialogContent className="max-w-md bg-card border-border shadow-2xl rounded-2xl p-6">
        <DialogHeader className="space-y-1 pb-2 border-b border-border">
          <div className="flex items-center space-x-2 text-foreground">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <User className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold font-heading">Personal Profile</DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground">
                Manage your user account details and credentials.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 pt-2">
          <div className="space-y-4">
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
