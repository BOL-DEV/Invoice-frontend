'use client';

import React, { useEffect, useState, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useBusinessSettings, useUpdateBusinessSettings } from '../../../features/business/hooks/useBusinessSettings';
import { useUpdateProfile } from '../../../features/users/hooks/useUsers';
import { updateProfileSchema, UpdateProfileInput } from '../../../features/users/schemas';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
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
  Globe,
  CreditCard,
  Plus,
  Trash2,
  ExternalLink,
  Sparkles,
  Layers,
  FileText,
  FileSpreadsheet,
  Activity,
  Store,
  Upload,
  Download,
} from 'lucide-react';
import { useModal } from '../../../components/ui/modal-provider';
import { BusinessSettings } from '../../../types/api';
import { getErrorDialog, getErrorMessage } from '../../../lib/api-error';
import { useSubscription, useInitiateSubscriptionPayment, PaymentInitiationResult } from '../../../features/subscriptions/hooks/useSubscription';
import { DynamicBankTransferModal } from '../../../components/subscriptions/DynamicBankTransferModal';
import { InvoiceTemplatePreviewModal } from '../../../components/templates/InvoiceTemplatePreviewModal';

export default function SettingsPage() {
  const { user, updateCurrentUser } = useAuth();
  const { isAdmin, isLoading: isAuthLoading } = usePermission();
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const modal = useModal();

  const [activePaymentData, setActivePaymentData] = useState<PaymentInitiationResult | null>(null);
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const initiatePaymentMutation = useInitiateSubscriptionPayment();

  const getPlanPrice = (plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE', months: number) => {
    const monthlyRates = { STARTER: 10000, BUSINESS: 22000, ENTERPRISE: 44000 };
    const annualRates = { STARTER: 100000, BUSINESS: 220000, ENTERPRISE: 440000 };
    if (months === 12) {
      return { total: annualRates[plan], ratePerMonth: Math.round(annualRates[plan] / 12), isDiscounted: true };
    }
    if (months > 12) {
      const years = Math.floor(months / 12);
      const rem = months % 12;
      const total = (years * annualRates[plan]) + (rem * monthlyRates[plan]);
      return { total, ratePerMonth: Math.round(total / months), isDiscounted: true };
    }
    return { total: monthlyRates[plan] * months, ratePerMonth: monthlyRates[plan], isDiscounted: false };
  };

  const handleStartUpgrade = async (plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE', months: number = selectedMonths) => {
    try {
      const cycle = months === 12 ? 'ANNUAL' : 'MONTHLY';
      const data = await initiatePaymentMutation.mutateAsync({ plan, billingCycle: cycle, months });
      setActivePaymentData(data);
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      const { title, message, variant } = getErrorDialog(err, 'Payment Initiation Failed', 'Failed to generate dynamic virtual bank transfer account.');
      modal.alert(title, message, variant);
    }
  };

  // Active Tab state: 'profile' (all users), 'business' (admin only), or 'subscription' (admin only)
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'subscription' | 'upgrade'>('profile');
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewTemplateId, setPreviewTemplateId] = useState<string>('classic');
  const [isDownloadingSamplePdf, setIsDownloadingSamplePdf] = useState(false);

  const handleDownloadSamplePdf = async () => {
    setIsDownloadingSamplePdf(true);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PRINTING.TEST_PDF,
        {
          templateId: settings?.receiptTemplateId || 'classic',
          businessId: settings?.id,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.download = `${settings?.slug || 'sample'}-invoice.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      modal.alert('Download Error', 'Could not generate sample invoice PDF at this time.', 'error');
    } finally {
      setIsDownloadingSamplePdf(false);
    }
  };

  // Subscription data
  const { data: subDetails, isLoading: isSubLoading, refetch: refetchSub } = useSubscription();
  const subPlan = subDetails?.subscription?.plan || (subDetails as any)?.plan || 'STARTER';
  const subMode = subDetails?.subscription?.billingMode || (subDetails as any)?.billingMode;
  const isComplimentary = subMode === 'COMPLIMENTARY';

  const staffCount = subDetails?.usage?.staffCount ?? (subDetails as any)?.activeStaffCount ?? 0;
  const maxStaffCount = subDetails?.usage?.maxStaffCount ?? subDetails?.subscription?.maxStaffCount ?? (subDetails as any)?.staffLimit ?? (subDetails as any)?.maxStaffCount ?? 3;
  const cashierCount = subDetails?.usage?.cashierCount ?? (subDetails as any)?.cashierCount ?? 0;
  const managerCount = subDetails?.usage?.managerCount ?? (subDetails as any)?.managerCount ?? 0;

  const aiExtractionEnabled = subDetails?.capabilities?.aiExtraction ?? true;
  const customDomainCapability = subDetails?.capabilities?.customDomain ?? subDetails?.subscription?.hasCustomDomain ?? (subDetails as any)?.hasCustomDomain ?? false;
  const multipleBranchesEnabled = subDetails?.capabilities?.multipleBranches ?? subDetails?.subscription?.hasMultipleBranches ?? (subDetails as any)?.hasMultipleBranches ?? false;
  const excelExportEnabled = subDetails?.capabilities?.excelExport ?? (subPlan === 'BUSINESS' || subPlan === 'ENTERPRISE');
  const activityLogsEnabled = subDetails?.capabilities?.activityLogs ?? (subPlan === 'BUSINESS' || subPlan === 'ENTERPRISE');

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
      const msg = getErrorMessage(err, 'Failed to update profile settings. Please verify your current password.');
      setProfileError(msg);
      const { title, message, variant } = getErrorDialog(err, 'Update Failed', 'Failed to update profile settings.');
      modal.alert(title, message, variant);
    }
  };

  // --- Company Settings (Admin Only) ---
  const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError, refetch: refetchSettings } = useBusinessSettings();
  const updateBusinessMutation = useUpdateBusinessSettings(settings?.id || '');
  const [isBusinessSubmitting, setIsBusinessSubmitting] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const logoFileInputRef = React.useRef<HTMLInputElement | null>(null);

  const rawLogo = settings?.logo;
  const hasCustomLogo = Boolean(
    rawLogo &&
    typeof rawLogo === 'string' &&
    (rawLogo.startsWith('/') || rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:image/')) &&
    !rawLogo.startsWith('{')
  );
  const logoSrc = hasCustomLogo
    ? (rawLogo as string)
    : (settings?.slug === 'lao-steel' ? '/laosteel-logo.svg' : '/platform-logo.svg');

  const businessInitials = (settings?.businessName || 'Business')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0].toUpperCase())
    .join('') || 'B';

  const {
    register: registerBusiness,
    handleSubmit: handleBusinessSubmit,
    reset: resetBusiness,
    watch: watchBusiness,
    setValue: setValueBusiness,
  } = useForm<Partial<BusinessSettings>>({
    defaultValues: settings || {},
  });

  useEffect(() => {
    if (settings) {
      resetBusiness(settings);
      if (hasCustomLogo) {
        setLogoPreview(rawLogo as string);
      } else if (settings.slug === 'lao-steel' || settings.businessName?.toLowerCase().includes('lao steel')) {
        setLogoPreview('/laosteel-logo.svg');
      } else {
        setLogoPreview(null);
      }
    }
  }, [settings, resetBusiness, hasCustomLogo, rawLogo]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      modal.alert('Invalid File', 'Please select a valid image file (PNG, JPG, SVG, or WebP).', 'error');
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      modal.alert('Image Too Large', 'Please upload an image smaller than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
      setValueBusiness('logo', base64, { shouldDirty: true });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    setValueBusiness('logo', '', { shouldDirty: true });
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const isValidPhoneNumber = (val: string): boolean => {
    if (!val || typeof val !== 'string') return false;
    const parts = val.split(/[,/]/).map((p) => p.trim()).filter(Boolean);
    if (parts.length === 0) return false;
    for (const part of parts) {
      if (!/^\+?[0-9\s\-()]{7,20}$/.test(part)) return false;
      const digitsOnly = part.replace(/\D/g, '');
      if (digitsOnly.length < 8 || digitsOnly.length > 15) return false;
    }
    return true;
  };

  const hasCustomDomainEnabled = Boolean(
    subDetails?.capabilities?.customDomain ??
    subDetails?.subscription?.hasCustomDomain ??
    settings?.subscription?.hasCustomDomain ??
    false
  );

  // Lao Steel's "Classic Industrial" layout is its dedicated bespoke template
  const isLaoSteelBespoke = Boolean(
    settings?.businessName?.toLowerCase().includes('lao steel') ||
    settings?.slug?.toLowerCase().includes('lao-steel') ||
    settings?.receiptPrefix === 'LSV'
  );

  const customUrl = watchBusiness('customTemplateUrl') || settings?.customTemplateUrl;
  const currentReceiptTemplateId = watchBusiness('receiptTemplateId') || settings?.receiptTemplateId || (isLaoSteelBespoke ? 'classic' : 'modern');

  const onBusinessSubmit = async (data: Partial<BusinessSettings>) => {
    if (data.phone && !isValidPhoneNumber(data.phone)) {
      modal.alert(
        'Invalid Phone Number',
        'Please provide a valid phone number (8 to 15 digits, e.g. +234 803 000 0000 or 0803 000 0000).',
        'error'
      );
      return;
    }

    setIsBusinessSubmitting(true);
    try {
      const payload: any = {
        ...data,
        ...(logoPreview !== null && { logo: logoPreview || '' }),
        defaultVatPercentage: Number(data.defaultVatPercentage) || 0,
        defaultWhtPercentage: Number(data.defaultWhtPercentage) || 0,
        receiptTemplateId: isLaoSteelBespoke ? 'classic' : (currentReceiptTemplateId === 'classic' ? 'modern' : currentReceiptTemplateId || 'modern'),
        customTemplateUrl: null,
      };

      await updateBusinessMutation.mutateAsync(payload);
      modal.alert('Success', 'Business configurations saved successfully', 'success');
    } catch (err) {
      const { title, message, variant } = getErrorDialog(err, 'Update Failed', 'Failed to update configurations');
      modal.alert(title, message, variant);
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
      {isAdmin && !isSuperAdmin && (
        <div className={`p-1 rounded-xl bg-secondary/70 dark:bg-slate-900/80 border border-border/80 grid ${isComplimentary ? 'grid-cols-3 max-w-md' : 'grid-cols-4 max-w-xl'} gap-1 w-full`}>
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
            <span className="truncate">Profile</span>
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
            <span className="truncate">Company</span>
          </button>

          {/* Plan & Quotas Tab (Always visible to all businesses so they can see limits & quotas) */}
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'subscription'
                ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Plan & Quotas</span>
          </button>

          {/* Subscription & Payment Tab (Hidden for complimentary businesses) */}
          {!isComplimentary && (
            <button
              type="button"
              onClick={() => setActiveTab('upgrade')}
              className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'upgrade'
                  ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`}
            >
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Subscription</span>
            </button>
          )}
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
      {activeTab === 'business' && isAdmin && !isSuperAdmin && (
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
                  <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-border p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                    {(logoPreview || hasCustomLogo) ? (
                      <Image src={logoPreview || (rawLogo as string)} alt={settings.businessName || 'Company Logo'} width={32} height={32} className="w-8 h-8 object-contain" />
                    ) : (
                      <div className="h-full w-full rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white font-bold font-heading text-xs flex items-center justify-center">
                        {businessInitials}
                      </div>
                    )}
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
              
              <CardContent className="p-4 sm:p-6 space-y-5">
                {/* Brand Logo Upload Section */}
                <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="flex items-center space-x-4">
                    <div className="relative h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 border border-border p-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group">
                      {(logoPreview || hasCustomLogo) ? (
                        <Image
                          src={logoPreview || (rawLogo as string)}
                          alt={settings.businessName || 'Company Logo'}
                          width={56}
                          height={56}
                          className="w-full h-full object-contain"
                        />
                      ) : (
                        <div className="h-full w-full rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold font-heading text-lg flex items-center justify-center">
                          {businessInitials}
                        </div>
                      )}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">Brand Logo</h4>
                      <p className="text-[11px] text-muted-foreground mt-0.5">
                        Appears across invoice headers, customer receipts, sidebar, and login portal.
                      </p>
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                        Recommended: Transparent PNG, SVG, or WebP (max 2MB)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    <input
                      type="file"
                      ref={logoFileInputRef}
                      accept="image/png,image/jpeg,image/svg+xml,image/webp"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => logoFileInputRef.current?.click()}
                      className="h-8 rounded-xl text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                    >
                      <Upload className="h-3.5 w-3.5 mr-1.5" />
                      Upload Logo
                    </Button>
                    {logoPreview && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={handleRemoveLogo}
                        className="h-8 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>
                </div>

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

                {/* Printable Invoice & Receipt Template Design */}
                <div className="space-y-2 pt-2 border-t border-border/60">
                  <Label className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                    <FileText className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Printable Invoice & Receipt Template</span>
                  </Label>
                  <p className="text-[11px] text-muted-foreground">
                    Select the styling and visual layout used when generating PDF receipts and customer invoices.
                  </p>

                  {/* Single Dedicated Business Invoice Template Card */}
                  <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-br from-secondary/20 via-background to-secondary/10 shadow-sm space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="text-sm font-bold text-foreground">
                            {isLaoSteelBespoke
                              ? 'Lao Steel Bespoke Trade Layout'
                              : 'Modern Corporate Executive Layout'}
                          </h4>
                          <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                            {isLaoSteelBespoke ? 'Lao Steel Bespoke' : 'Standard Active'}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                          {isLaoSteelBespoke
                            ? 'Your authentic Lao Steel industrial styling with green globe emblem, dual company ledger borders, LSV watermark, and guarantee terms is active.'
                            : 'Modern corporate executive layout with clean typography, itemized charges, and structured terms.'}
                        </p>
                      </div>

                      <div className="flex items-center flex-wrap gap-2 shrink-0">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadSamplePdf}
                          disabled={isDownloadingSamplePdf}
                          className="h-8 px-3 text-xs font-semibold rounded-xl border-border/80 hover:bg-secondary/50 flex items-center space-x-1.5 cursor-pointer"
                        >
                          {isDownloadingSamplePdf ? (
                            <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                          ) : (
                            <Download className="h-3.5 w-3.5 text-emerald-500" />
                          )}
                          <span>Download Sample PDF</span>
                        </Button>
                      </div>
                    </div>
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


      {/* ========================================================= */}
      {/* TAB 4: SUBSCRIPTION & DOMAINS (ADMIN ONLY)                 */}
      {/* ========================================================= */}
      {activeTab === 'subscription' && isAdmin && !isSuperAdmin && (
        <div className="space-y-6">
          {/* Plan & Quota Card */}
          <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <ShieldCheck className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      Subscription Plan & Quotas
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Active platform tier, staff limits, and feature capabilities.
                    </CardDescription>
                  </div>
                </div>

                {subDetails?.subscription && (
                  <div className="flex items-center space-x-2">
                    <Badge className="bg-emerald-500 text-white font-mono text-xs px-3 py-1">
                      {subDetails.subscription.plan} PLAN
                    </Badge>
                    {subDetails.subscription.billingMode === 'COMPLIMENTARY' && (
                      <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs">
                        COMPLIMENTARY ACCESS
                      </Badge>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6 space-y-6">
              {isSubLoading ? (
                <div className="flex items-center justify-center p-8">
                  <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
                </div>
              ) : subDetails ? (
                <div className="space-y-6">
                  {/* Quota Usage Bar */}
                  <div className="p-4 rounded-xl border border-border/80 bg-slate-50/60 dark:bg-slate-900/50 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-semibold text-foreground flex items-center space-x-1.5">
                        <User className="h-3.5 w-3.5 text-emerald-500" />
                        <span>Staff Members Allocation</span>
                      </span>
                      <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                        {staffCount} of {maxStaffCount} staff registered
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.min(100, (staffCount / Math.max(1, maxStaffCount)) * 100)}%`,
                        }}
                      />
                    </div>
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-muted-foreground mt-1 gap-1">
                      <p>
                        {subPlan === 'STARTER' && 'Starter plan includes 3 total user accounts (1 business administrator + 2 cashiers). Extra seats: ₦2,000/seat/month.'}
                        {subPlan === 'BUSINESS' && 'Business plan includes 5 total user accounts (1 business administrator + 4 cashiers). Extra seats: ₦2,000/seat/month.'}
                        {subPlan === 'ENTERPRISE' && 'Enterprise plan includes 11 total user accounts (1 business admin + 2 branch managers + 8 cashiers) across 2 branches.'}
                      </p>
                      {(cashierCount > 0 || managerCount > 0) && (
                        <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">
                          Breakdown: {managerCount} branch {managerCount === 1 ? 'manager' : 'managers'}, {cashierCount} {cashierCount === 1 ? 'cashier' : 'cashiers'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Feature Capabilities Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                      <div className={`p-2 rounded-lg shrink-0 ${aiExtractionEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Sparkles className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">AI Document Scanner</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {subPlan === 'STARTER' && '15 scans/month included (Extra pack: ₦5,000 for 100 scans)'}
                          {subPlan === 'BUSINESS' && '150 scans/month included (Extra pack: ₦5,000 for 100 scans)'}
                          {subPlan === 'ENTERPRISE' && '300 scans/month included (Extra pack: ₦5,000 for 100 scans)'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                      <div className={`p-2 rounded-lg shrink-0 ${customDomainCapability ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Globe className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Custom Branded Domain</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {customDomainCapability
                            ? 'Active (Branded Domain Configured)'
                            : 'Available on all tiers as a ₦10,000 add-on'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                      <div className={`p-2 rounded-lg shrink-0 ${multipleBranchesEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Layers className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Multiple Branches</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {multipleBranchesEnabled ? 'Active (2 Branches on Enterprise)' : 'Standard Single Branch (Add-on: ₦5,000/mo)'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                      <div className={`p-2 rounded-lg shrink-0 ${excelExportEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Excel Spreadsheet Export</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {excelExportEnabled ? 'Active (Business & Enterprise)' : 'Locked on Starter Plan (PDF Only)'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                      <div className="p-2 rounded-lg shrink-0 bg-emerald-500/10 text-emerald-500">
                        <CheckCircle2 className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Standard & Advanced Analytics</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {multipleBranchesEnabled ? 'Multi-branch Aggregated Analytics' : 'Standard Full Analytics Report'}
                        </p>
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                      <div className={`p-2 rounded-lg shrink-0 ${activityLogsEnabled ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-400'}`}>
                        <Activity className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="font-semibold text-foreground">Audit & Activity Logs</p>
                        <p className="text-[11px] text-muted-foreground mt-0.5">
                          {activityLogsEnabled ? 'Active (Business & Enterprise)' : 'Locked on Starter Plan'}
                        </p>
                      </div>
                    </div>

                  </div>
                </div>
              ) : null}
            </CardContent>
          </Card>



          {/* Custom Domains Manager - only visible when customDomain capability is toggled ON */}
          {hasCustomDomainEnabled && (
            <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
              <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <Globe className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      Custom Domains
                    </CardTitle>
                    <CardDescription className="text-xs">
                      View active web domains and routing endpoints configured for this business workspace.
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-4 sm:p-6 space-y-4">
                {/* Registered Domains Table (Read-Only) */}
                {(() => {
                  const validDomains = (subDetails?.domains || []).filter(
                    (d) => d.domain && !d.domain.endsWith('.localhost')
                  );
                  return (
                    <div className="space-y-2 pt-2">
                      <div className="flex items-center justify-between">
                        <h4 className="text-xs font-semibold text-foreground">Active Registered Domains</h4>
                        <Badge variant="outline" className="text-[10px] text-muted-foreground border-border font-mono">
                          {validDomains.length} Registered
                        </Badge>
                      </div>
                      <div className="divide-y divide-border/80 border border-border/80 rounded-xl overflow-hidden">
                        {validDomains.length > 0 ? (
                          validDomains.map((d) => (
                            <div key={d.id} className="p-3.5 flex items-center justify-between bg-card text-xs">
                              <div className="flex items-center space-x-2.5">
                                <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                                <span className="font-mono font-medium text-foreground">{d.domain}</span>
                                {d.isPrimary && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5">
                                    Primary Platform Domain
                                  </Badge>
                                )}
                                {d.isCustom && (
                                  <Badge variant="outline" className="text-[10px] py-0 px-2 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5">
                                    Custom Brand Domain
                                  </Badge>
                                )}
                              </div>

                              <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-mono">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                                <span>Connected</span>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="p-6 text-center text-xs text-muted-foreground">
                            No custom domains registered yet. Contact platform administration to attach your branded domain.
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </Card>
          )}
        </div>
      )}



      {/* ========================================================= */}
      {/* TAB 4: SUBSCRIPTION & PAYMENTS (PAID UPGRADE FLOW)        */}
      {/* ========================================================= */}
      {activeTab === 'upgrade' && !isComplimentary && isAdmin && !isSuperAdmin && (
        <div className="space-y-6">
          <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
            <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                    <Sparkles className="h-5 w-5" />
                  </div>
                  <div>
                    <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                      Upgrade or Renew Subscription
                    </CardTitle>
                    <CardDescription className="text-xs">
                      Instant activation via Lenco Dynamic Virtual Bank Transfer with zero onboarding fees.
                    </CardDescription>
                  </div>
                </div>

                {/* Billing Duration Controls */}
                <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
                  {/* Preset Pills */}
                  <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                    {[
                      { label: '1 Mo', months: 1 },
                      { label: '3 Mos', months: 3 },
                      { label: '6 Mos', months: 6 },
                      { label: '1 Year', months: 12, badge: '2 Mos Free' },
                    ].map((preset) => (
                      <button
                        key={preset.months}
                        type="button"
                        onClick={() => setSelectedMonths(preset.months)}
                        className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${
                          selectedMonths === preset.months
                            ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                            : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <span>{preset.label}</span>
                        {preset.badge && (
                          <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                            selectedMonths === preset.months ? 'bg-slate-950/20 text-slate-950' : 'bg-emerald-400/20 text-emerald-300'
                          }`}>
                            {preset.badge}
                          </span>
                        )}
                      </button>
                    ))}
                  </div>

                  {/* Custom Month Stepper */}
                  <div className="inline-flex items-center h-9 px-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white">
                    <span className="text-slate-400 mr-2 text-[11px]">Months:</span>
                    <button
                      type="button"
                      disabled={selectedMonths <= 1}
                      onClick={() => setSelectedMonths((m) => Math.max(1, m - 1))}
                      className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold text-slate-200 transition-colors"
                      title="Decrease months"
                    >
                      -
                    </button>
                    <span className="w-8 text-center font-mono font-bold text-emerald-400 text-xs">
                      {selectedMonths}
                    </span>
                    <button
                      type="button"
                      disabled={selectedMonths >= 36}
                      onClick={() => setSelectedMonths((m) => Math.min(36, m + 1))}
                      className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold text-slate-200 transition-colors"
                      title="Increase months"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Starter Card */}
                {(() => {
                  const pricing = getPlanPrice('STARTER', selectedMonths);
                  return (
                    <div className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                      subPlan === 'STARTER'
                        ? 'border-emerald-500/60 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-border/80 bg-slate-900/40 hover:border-slate-700'
                    }`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                            <h5 className="text-xl font-bold text-white mt-0.5">
                              ₦{pricing.total.toLocaleString()}
                              <span className="text-xs font-normal text-slate-400">
                                {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                              </span>
                            </h5>
                            {pricing.isDiscounted && (
                              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                                Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦20,000)
                              </p>
                            )}
                          </div>
                          {subPlan === 'STARTER' && (
                            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                              Active Tier
                            </Badge>
                          )}
                        </div>

                        <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>3 Users (1 Admin + 2 Cashiers)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>15 AI Scans / Month</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>Thermal & A4 Printable Invoices</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-5">
                        <Button
                          size="sm"
                          disabled={initiatePaymentMutation.isPending}
                          onClick={() => handleStartUpgrade('STARTER', selectedMonths)}
                          className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                        >
                          {subPlan === 'STARTER'
                            ? `Renew Starter (${selectedMonths} ${selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦${pricing.total.toLocaleString()})`
                            : `Select Starter (${selectedMonths} ${selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦${pricing.total.toLocaleString()})`}
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {/* Business Card */}
                {(() => {
                  const pricing = getPlanPrice('BUSINESS', selectedMonths);
                  return (
                    <div className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                      subPlan === 'BUSINESS'
                        ? 'border-emerald-500/60 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-border/80 bg-slate-900/40 hover:border-slate-700'
                    }`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business</span>
                            <h5 className="text-xl font-bold text-white mt-0.5">
                              ₦{pricing.total.toLocaleString()}
                              <span className="text-xs font-normal text-slate-400">
                                {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                              </span>
                            </h5>
                            {pricing.isDiscounted && (
                              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                                Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦44,000)
                              </p>
                            )}
                          </div>
                          {subPlan === 'BUSINESS' ? (
                            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                              Active Tier
                            </Badge>
                          ) : (
                            <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>

                        <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>5 Users (1 Admin + 4 Cashiers)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>150 AI Scans / Month</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>Custom Domain + Excel Export</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-5">
                        <Button
                          size="sm"
                          disabled={initiatePaymentMutation.isPending}
                          onClick={() => handleStartUpgrade('BUSINESS', selectedMonths)}
                          className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                        >
                          {subPlan === 'BUSINESS'
                            ? `Renew Business (${selectedMonths} ${selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦${pricing.total.toLocaleString()})`
                            : `Upgrade to Business (${selectedMonths} ${selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦${pricing.total.toLocaleString()})`}
                        </Button>
                      </div>
                    </div>
                  );
                })()}

                {/* Enterprise Card */}
                {(() => {
                  const pricing = getPlanPrice('ENTERPRISE', selectedMonths);
                  return (
                    <div className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                      subPlan === 'ENTERPRISE'
                        ? 'border-emerald-500/60 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                        : 'border-border/80 bg-slate-900/40 hover:border-slate-700'
                    }`}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise</span>
                            <h5 className="text-xl font-bold text-white mt-0.5">
                              ₦{pricing.total.toLocaleString()}
                              <span className="text-xs font-normal text-slate-400">
                                {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                              </span>
                            </h5>
                            {pricing.isDiscounted && (
                              <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                                Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦88,000)
                              </p>
                            )}
                          </div>
                          {subPlan === 'ENTERPRISE' && (
                            <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                              Active Tier
                            </Badge>
                          )}
                        </div>

                        <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>11 Users (Owner + Sub-admins + 8 Cashiers)</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>300 AI Scans / Month</span>
                          </li>
                          <li className="flex items-center space-x-2">
                            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                            <span>Multi-Branch Real-Time Control & Audits</span>
                          </li>
                        </ul>
                      </div>

                      <div className="pt-5">
                        <Button
                          size="sm"
                          disabled={initiatePaymentMutation.isPending}
                          onClick={() => handleStartUpgrade('ENTERPRISE', selectedMonths)}
                          className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                        >
                          {subPlan === 'ENTERPRISE'
                            ? `Renew Enterprise (${selectedMonths} ${selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦${pricing.total.toLocaleString()})`
                            : `Upgrade to Enterprise (${selectedMonths} ${selectedMonths === 1 ? 'Mo' : 'Mos'} • ₦${pricing.total.toLocaleString()})`}
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Lenco Dynamic Bank Transfer Modal */}
      <DynamicBankTransferModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentData={activePaymentData}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
        }}
      />

      {/* Template Preview Modal */}
      <InvoiceTemplatePreviewModal
        isOpen={isPreviewOpen}
        onClose={() => setIsPreviewOpen(false)}
        templateId={previewTemplateId}
        customTemplateUrl={customUrl || settings?.customTemplateUrl}
        logoUrl={logoPreview || (hasCustomLogo ? (rawLogo as string) : null)}
        tenantId={settings?.id}
        businessName={settings?.businessName}
        tagline={settings?.tagline || undefined}
        address={settings?.address}
        phone={settings?.phone}
        email={settings?.email}
        receiptPrefix={settings?.receiptPrefix}
        tin={settings?.tin || undefined}
        cacOrRegNumber={settings?.cacOrRegNumber || undefined}
        isSuperAdmin={isSuperAdmin}
        onSelectTemplate={(tpl, configJson) => {
          setValueBusiness('receiptTemplateId', tpl, { shouldDirty: true });
          if (configJson) {
            setValueBusiness('customTemplateUrl', configJson, { shouldDirty: true });
          }
          setIsPreviewOpen(false);
        }}
      />
    </div>
  );
}
