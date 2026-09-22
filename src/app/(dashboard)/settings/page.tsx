'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBusinessSettings, useUpdateBusinessSettings } from '../../../features/business/hooks/useBusinessSettings';
import { useUpdateProfile } from '../../../features/users/hooks/useUsers';
import { updateProfileSchema, UpdateProfileInput } from '../../../features/users/schemas';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Loader2,
  Save,
  Building2,
  User,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Settings as SettingsIcon,
  ShieldCheck,
  Percent,
  Phone,
  Mail,
  MapPin,
  FileCode,
  Tag,
  Hash,
} from 'lucide-react';
import { useModal } from '../../../components/ui/modal-provider';
import { BusinessSettings, AxiosErrorLike } from '../../../types/api';

export default function SettingsPage() {
  const { user, updateCurrentUser } = useAuth();
  const { isAdmin, isLoading: isAuthLoading } = usePermission();
  const modal = useModal();

  // Active Tab state: 'profile' (all users) or 'business' (admin only)
  const [activeTab, setActiveTab] = useState<'profile' | 'business'>('profile');

  // --- Profile & Security Form State ---
  const [profileError, setProfileError] = useState<string | null>(null);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const updateProfileMutation = useUpdateProfile();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    reset: resetProfile,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
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

  // Re-sync form default values when user details finish loading or change
  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
    }
  }, [user, resetProfile]);

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    setProfileError(null);
    setProfileSuccess(null);

    try {
      const payload: { firstName?: string; lastName?: string; currentPassword?: string; newPassword?: string } = {};

      if (data.firstName && data.firstName !== user?.firstName) payload.firstName = data.firstName;
      if (data.lastName && data.lastName !== user?.lastName) payload.lastName = data.lastName;
      if (data.newPassword && data.newPassword.trim() !== '') {
        payload.currentPassword = data.currentPassword;
        payload.newPassword = data.newPassword;
      }

      if (Object.keys(payload).length === 0) {
        setProfileError('No changes were made to your profile or credentials.');
        return;
      }

      const res = await updateProfileMutation.mutateAsync(payload);
      if (res) {
        updateCurrentUser(res);
      }

      setProfileSuccess('Profile details and security preferences updated successfully!');
      resetProfile({
        firstName: res?.firstName || data.firstName || '',
        lastName: res?.lastName || data.lastName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      modal.alert('Success', 'Your profile and security credentials have been updated.', 'success');
    } catch (err) {
      const axiosErr = err as AxiosErrorLike;
      const msg =
        axiosErr.response?.data?.error?.message ||
        axiosErr.message ||
        'Failed to update profile settings. Please verify your current password.';
      setProfileError(msg);
      modal.alert('Update Failed', msg, 'error');
    }
  };

  // --- Company Settings (Admin Only) ---
  const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError, refetch: refetchSettings } = useBusinessSettings();
  const updateBusinessMutation = useUpdateBusinessSettings(settings?.id || '');
  const [isBusinessSubmitting, setIsBusinessSubmitting] = useState(false);

  const {
    register: registerBusiness,
    handleSubmit: handleBusinessSubmit,
    reset: resetBusiness,
  } = useForm<Partial<BusinessSettings>>({
    defaultValues: settings || {},
  });

  useEffect(() => {
    if (settings) {
      resetBusiness(settings);
    }
  }, [settings, resetBusiness]);

  const onBusinessSubmit = async (data: Partial<BusinessSettings>) => {
    setIsBusinessSubmitting(true);
    try {
      const payload = {
        ...data,
        defaultVatPercentage: Number(data.defaultVatPercentage) || 0,
        defaultWhtPercentage: Number(data.defaultWhtPercentage) || 0,
      };
      await updateBusinessMutation.mutateAsync(payload);
      modal.alert('Success', 'Business configurations saved successfully', 'success');
    } catch (err) {
      modal.alert('Update Failed', (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to update configurations', 'error');
    } finally {
      setIsBusinessSubmitting(false);
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-border/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium mb-1">
            <SettingsIcon className="h-3 w-3" />
            <span>Account Preferences</span>
          </div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Settings & Security
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal profile, account credentials, and depot configurations.
          </p>
        </div>
      </div>

      {/* Tabs Selection (Modern Segmented Control) */}
      {isAdmin && (
        <div className="p-1 rounded-xl bg-secondary/70 dark:bg-slate-900/80 border border-border/80 grid grid-cols-2 gap-1 w-full sm:max-w-md">
          <button
            type="button"
            onClick={() => setActiveTab('profile')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <User className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Profile & Security</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('business')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'business'
                ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <Building2 className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Company & Billing</span>
          </button>
        </div>
      )}

      {/* ========================================================= */}
      {/* TAB 1: PERSONAL PROFILE & SECURITY (ALL USERS)            */}
      {/* ========================================================= */}
      {activeTab === 'profile' && user && (
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
                        ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono text-[10px] font-bold'
                        : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px] font-bold'
                    }
                  >
                    {user.role === 'ADMIN' ? 'Administrator' : 'Cashier (Apprentice)'}
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
              <div className="space-y-3 pt-4 border-t border-border/70">
                <div>
                  <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                    <Lock className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Security & Password</span>
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Leave password fields blank if you only wish to change your profile name.
                  </p>
                </div>

                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="settings-currentPassword" className="text-xs font-semibold text-muted-foreground">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="settings-currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Required only when setting a new password"
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
      )}

      {/* ========================================================= */}
      {/* TAB 2: COMPANY PROFILE & BILLING (ADMIN ONLY)             */}
      {/* ========================================================= */}
      {activeTab === 'business' && isAdmin && (
        <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
          {isSettingsLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
              <p className="text-xs text-muted-foreground">Loading configurations...</p>
            </div>
          ) : isSettingsError || !settings ? (
            <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-6 rounded-2xl text-center max-w-md mx-auto my-8 space-y-3">
              <p className="font-semibold text-xs">Failed to fetch company profile settings.</p>
              <Button onClick={() => refetchSettings()} variant="outline" className="border-rose-500/25 hover:bg-rose-500/5 text-rose-600 rounded-xl text-xs px-4 h-9">
                Retry Connection
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBusinessSubmit(onBusinessSubmit)}>
              <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      {settings.businessName || 'Company Profile'}
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Default invoice template and tax rates configuration.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Business Name & Email */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="businessName" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                      <Building2 className="h-3 w-3 text-emerald-500" />
                      <span>Registered Business Name</span>
                    </Label>
                    <Input
                      id="businessName"
                      {...registerBusiness('businessName', { required: true })}
                      className="bg-background border-border/80 focus:border-emerald-500/60 font-medium h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                      <Mail className="h-3 w-3 text-emerald-500" />
                      <span>Billing Email Address</span>
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      {...registerBusiness('email', { required: true })}
                      className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>

                {/* Business Tagline / Subtitle */}
                <div className="space-y-1.5">
                  <Label htmlFor="tagline" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                    <Tag className="h-3 w-3 text-emerald-500" />
                    <span>Business Tagline / Subtitle</span>
                  </Label>
                  <Input
                    id="tagline"
                    placeholder="e.g. Industrial & Building Materials Suppliers"
                    {...registerBusiness('tagline')}
                    className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                  />
                </div>

                {/* Phone & Tax Rates */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5 sm:col-span-1">
                    <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                      <Phone className="h-3 w-3 text-emerald-500" />
                      <span>Contact Phone(s)</span>
                    </Label>
                    <Input
                      id="phone"
                      placeholder="e.g. 08030000000, 08050000000"
                      {...registerBusiness('phone', { required: true })}
                      className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                    />
                    <p className="text-[10px] text-muted-foreground">
                      Separate multiple numbers with commas
                    </p>
                  </div>

                  {/* VAT & WHT in side-by-side subgrid on mobile */}
                  <div className="sm:col-span-2 grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label htmlFor="defaultVatPercentage" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1">
                        <Percent className="h-3 w-3 text-emerald-500" />
                        <span>VAT Rate (%)</span>
                      </Label>
                      <Input
                        id="defaultVatPercentage"
                        type="number"
                        step="0.01"
                        {...registerBusiness('defaultVatPercentage', { required: true })}
                        className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <Label htmlFor="defaultWhtPercentage" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1">
                        <Percent className="h-3 w-3 text-emerald-500" />
                        <span>WHT Rate (%)</span>
                      </Label>
                      <Input
                        id="defaultWhtPercentage"
                        type="number"
                        step="0.01"
                        {...registerBusiness('defaultWhtPercentage', { required: true })}
                        className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
                      />
                    </div>
                  </div>
                </div>

                {/* Physical Office Address */}
                <div className="space-y-1.5">
                  <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                    <MapPin className="h-3 w-3 text-emerald-500" />
                    <span>Physical Office Address</span>
                  </Label>
                  <Input
                    id="address"
                    placeholder="e.g. 12 Industrial Avenue, Ikeja, Lagos"
                    {...registerBusiness('address', { required: true })}
                    className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                  />
                </div>

                {/* Prefix, Registration No, and TIN */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="receiptPrefix" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                      <FileCode className="h-3 w-3 text-emerald-500" />
                      <span>Default Receipt Prefix</span>
                    </Label>
                    <Input
                      id="receiptPrefix"
                      placeholder="e.g. INV"
                      {...registerBusiness('receiptPrefix', { required: true })}
                      className="bg-background border-border/80 focus:border-emerald-500/60 font-mono uppercase h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="cacOrRegNumber" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                      <Hash className="h-3 w-3 text-emerald-500" />
                      <span>Registration / CAC No.</span>
                    </Label>
                    <Input
                      id="cacOrRegNumber"
                      placeholder="e.g. RC-123456 or BN-123456"
                      {...registerBusiness('cacOrRegNumber')}
                      className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="tin" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                      <Hash className="h-3 w-3 text-emerald-500" />
                      <span>Tax ID Number (TIN)</span>
                    </Label>
                    <Input
                      id="tin"
                      placeholder="e.g. 12345678-0001"
                      {...registerBusiness('tin')}
                      className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
                    />
                  </div>
                </div>
              </CardContent>

              <CardFooter className="p-4 sm:p-6 border-t border-border/80 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end">
                <Button
                  type="submit"
                  disabled={isBusinessSubmitting}
                  className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-6 text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
                >
                  {isBusinessSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4" />
                      <span>Save Configurations</span>
                    </>
                  )}
                </Button>
              </CardFooter>
            </form>
          )}
        </Card>
      )}
    </div>
  );
}
