'use client';

import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as AuthUser } from '../../../types/api';
import { useUpdateProfile } from '../../users/hooks/useUsers';
import { updateProfileSchema, UpdateProfileInput } from '../../users/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  User,
  Lock,
  Key,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  Loader2,
} from 'lucide-react';
import { getErrorMessage } from '../../../lib/api-error';

interface UserProfileSettingsProps {
  user: AuthUser;
  onUserUpdated?: (updated: AuthUser) => void;
}

export function UserProfileSettings({ user, onUserUpdated }: UserProfileSettingsProps) {
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const updateProfileMutation = useUpdateProfile();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
    setValue: setValueProfile,
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

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    setProfileSuccess(null);
    setProfileError(null);

    const payload: {
      firstName: string;
      lastName: string;
      currentPassword?: string;
      newPassword?: string;
    } = {
      firstName: data.firstName,
      lastName: data.lastName,
    };

    if (isChangingPassword && data.newPassword) {
      payload.currentPassword = data.currentPassword;
      payload.newPassword = data.newPassword;
    }

    try {
      const res = await updateProfileMutation.mutateAsync(payload);
      setProfileSuccess('Profile details and credentials updated successfully.');
      setIsChangingPassword(false);
      resetProfile({
        firstName: data.firstName,
        lastName: data.lastName,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      if (res && onUserUpdated) {
        onUserUpdated(res);
      }
    } catch (err: any) {
      setProfileError(getErrorMessage(err, 'Failed to update personal profile.'));
    }
  };

  return (
    <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
      <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Personal Information & Security
            </CardTitle>
            <CardDescription className="text-xs">
              Update your identity details and change account login password.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form onSubmit={handleProfileSubmit(onProfileSubmit)}>
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Status feedback alerts */}
          {profileError && (
            <div className="flex items-center space-x-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {/* Account Overview Pill */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Registered Email
              </span>
              <p className="text-xs font-semibold text-foreground font-mono break-all">{user.email}</p>
            </div>
            <div className="flex items-center space-x-2 pt-1 sm:pt-0">
              <Badge
                className={
                  user.role === 'ADMIN'
                    ? user.branchId
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono text-[10px] font-bold'
                      : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-mono text-[10px] font-bold'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px] font-bold'
                }
              >
                {user.role === 'ADMIN'
                  ? user.branchId
                    ? 'Branch Manager (Sub-Admin)'
                    : 'Main Administrator'
                  : 'Cashier (Apprentice)'}
              </Badge>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Name Details */}
          <div className="space-y-3 pt-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <span>Name Identification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="settings-firstName" className="text-xs font-semibold text-muted-foreground">
                  First Name
                </Label>
                <Input
                  id="settings-firstName"
                  {...registerProfile('firstName')}
                  className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                />
                {profileErrors.firstName && <p className="text-[11px] text-rose-500">{profileErrors.firstName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-lastName" className="text-xs font-semibold text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="settings-lastName"
                  {...registerProfile('lastName')}
                  className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                />
                {profileErrors.lastName && <p className="text-[11px] text-rose-500">{profileErrors.lastName.message}</p>}
              </div>
            </div>
          </div>

          {/* Security & Password Change */}
          <div className="space-y-3.5 pt-4 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Security & Password</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isChangingPassword
                    ? 'Enter your current password and choose a secure new password.'
                    : 'Update your account sign-in password anytime.'}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isChangingPassword) {
                    setValueProfile('currentPassword', '');
                    setValueProfile('newPassword', '');
                    setValueProfile('confirmPassword', '');
                  }
                  setIsChangingPassword((prev) => !prev);
                }}
                className="h-8 rounded-xl text-xs font-semibold px-3 border-border hover:bg-secondary cursor-pointer shrink-0 self-start sm:self-auto"
              >
                {isChangingPassword ? (
                  <>
                    <X className="h-3.5 w-3.5 mr-1" />
                    <span>Cancel Password Change</span>
                  </>
                ) : (
                  <>
                    <Key className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    <span>Change Password</span>
                  </>
                )}
              </Button>
            </div>

            {isChangingPassword && (
              <div className="space-y-3.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="settings-currentPassword" className="text-xs font-semibold text-muted-foreground">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="settings-currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Required to set a new password"
                      {...registerProfile('currentPassword')}
                      className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {profileErrors.currentPassword && <p className="text-[11px] text-rose-500">{profileErrors.currentPassword.message}</p>}
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-newPassword" className="text-xs font-semibold text-muted-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="settings-newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 characters"
                        {...registerProfile('newPassword')}
                        className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {profileErrors.newPassword && <p className="text-[11px] text-rose-500">{profileErrors.newPassword.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="settings-confirmPassword" className="text-xs font-semibold text-muted-foreground">
                      Confirm New Password
                    </Label>
                    <Input
                      id="settings-confirmPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      {...registerProfile('confirmPassword')}
                      className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                    />
                    {profileErrors.confirmPassword && <p className="text-[11px] text-rose-500">{profileErrors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-6 border-t border-border/80 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end">
          <Button
            type="submit"
            disabled={isProfileSubmitting || updateProfileMutation.isPending}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-6 text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            {isProfileSubmitting || updateProfileMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

