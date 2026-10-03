'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  useTenantDetails,
  useUpdateTenantStatus,
  useUpdateTenantPlan,
  useUpdateBusinessSettings,
  useAdminUpdateUser,
  useAdminResetPassword,
  useAdminToggleUserSuspend,
} from '../../../../../features/admin/hooks/useTenants';
import { usePermission } from '../../../../../features/auth/hooks/usePermission';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../../components/ui/dialog';
import { Label } from '../../../../../components/ui/label';
import { Input } from '../../../../../components/ui/input';
import { Pagination } from '../../../../../components/ui/pagination';
import { useModal } from '../../../../../components/ui/modal-provider';
import { PlanType, BillingMode } from '../../../../../types/api';
import {
  ArrowLeft,
  Building2,
  Users,
  FileText,
  TrendingUp,
  CreditCard,
  Globe,
  Sliders,
  Sparkles,
  Layers,
  BarChart3,
  ShieldAlert,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Eye,
  Check,
  Search,
  Activity,
  Edit,
  Key,
  Shield,
  Crown,
  UserCheck,
  UserX,
  Clock,
  DollarSign,
  X,
} from 'lucide-react';

export default function TenantDetailPage() {
  const params = useParams();
  const router = useRouter();
  const tenantId = (params?.id as string) || '';
  const { isSuperAdmin, isLoading: isAuthLoading } = usePermission();
  const modal = useModal();

  const { data: tenantData, isLoading, isError, error, refetch, isFetching } = useTenantDetails(tenantId);
  const updateStatusMutation = useUpdateTenantStatus();
  const updatePlanMutation = useUpdateTenantPlan();
  const updateSettingsMutation = useUpdateBusinessSettings();
  const adminUpdateUserMutation = useAdminUpdateUser();
  const adminResetPasswordMutation = useAdminResetPassword();
  const adminToggleSuspendMutation = useAdminToggleUserSuspend();

  // Active Tab
  const [activeTab, setActiveTab] = useState<'users' | 'invoices' | 'settings' | 'logs'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');

  // Pagination states
  const [staffPage, setStaffPage] = useState(1);
  const staffPageSize = 5;

  const [invoicePage, setInvoicePage] = useState(1);
  const invoicePageSize = 10;

  const [logPage, setLogPage] = useState(1);
  const logPageSize = 10;

  // Reset pagination on search
  useEffect(() => {
    setStaffPage(1);
  }, [userSearch]);

  useEffect(() => {
    setInvoicePage(1);
  }, [invoiceSearch]);

  // Invoice Details Modal
  const [viewingInvoice, setViewingInvoice] = useState<any | null>(null);

  // Edit Workspace Profile & Settings Modal
  const [isEditSettingsOpen, setIsEditSettingsOpen] = useState(false);
  const [settingsBizName, setSettingsBizName] = useState('');
  const [settingsAddress, setSettingsAddress] = useState('');
  const [settingsPhone, setSettingsPhone] = useState('');
  const [settingsEmail, setSettingsEmail] = useState('');
  const [settingsTin, setSettingsTin] = useState('');
  const [settingsCac, setSettingsCac] = useState('');
  const [settingsPrefix, setSettingsPrefix] = useState('');
  const [settingsVat, setSettingsVat] = useState(7.5);
  const [settingsWht, setSettingsWht] = useState(2.0);
  const [settingsError, setSettingsError] = useState<string | null>(null);

  const openEditSettingsModal = () => {
    if (!tenantData?.business) return;
    setSettingsBizName(tenantData.business.businessName || '');
    setSettingsAddress(tenantData.business.address || '');
    setSettingsPhone(tenantData.business.phone || '');
    setSettingsEmail(tenantData.business.email || '');
    setSettingsTin(tenantData.business.tin || '');
    setSettingsCac(tenantData.business.cacOrRegNumber || '');
    setSettingsPrefix(tenantData.business.receiptPrefix || 'INV');
    setSettingsVat(Number(tenantData.business.defaultVatPercentage ?? 7.5));
    setSettingsWht(Number(tenantData.business.defaultWhtPercentage ?? 2.0));
    setSettingsError(null);
    setIsEditSettingsOpen(true);
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSettingsError(null);
    try {
      await updateSettingsMutation.mutateAsync({
        id: tenantId,
        data: {
          businessName: settingsBizName.trim(),
          address: settingsAddress.trim(),
          phone: settingsPhone.trim(),
          email: settingsEmail.trim().toLowerCase(),
          tin: settingsTin.trim(),
          cacOrRegNumber: settingsCac.trim(),
          receiptPrefix: settingsPrefix.trim().toUpperCase(),
          defaultVatPercentage: Number(settingsVat),
          defaultWhtPercentage: Number(settingsWht),
        },
      });
      setIsEditSettingsOpen(false);
      refetch();
      modal.alert('Workspace Updated', 'Business profile and tax configurations have been saved successfully.', 'success');
    } catch (err: any) {
      setSettingsError(err?.response?.data?.message || err.message || 'Failed to update business profile.');
    }
  };

  // Edit Staff / Admin User Modal
  const [editingUser, setEditingUser] = useState<any | null>(null);
  const [userFirstName, setUserFirstName] = useState('');
  const [userLastName, setUserLastName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [userRole, setUserRole] = useState<'ADMIN' | 'APPRENTICE'>('APPRENTICE');
  const [userNewPassword, setUserNewPassword] = useState('');
  const [userModalError, setUserModalError] = useState<string | null>(null);

  const openEditUserModal = (user: any) => {
    setEditingUser(user);
    setUserFirstName(user.firstName || '');
    setUserLastName(user.lastName || '');
    setUserEmail(user.email || '');
    setUserRole(user.role === 'ADMIN' ? 'ADMIN' : 'APPRENTICE');
    setUserNewPassword('');
    setUserModalError(null);
  };

  const handleSaveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    setUserModalError(null);
    try {
      await adminUpdateUserMutation.mutateAsync({
        id: editingUser.id,
        data: {
          firstName: userFirstName.trim(),
          lastName: userLastName.trim(),
          email: userEmail.trim().toLowerCase(),
          role: userRole,
          ...(userNewPassword ? { newPassword: userNewPassword } : {}),
        },
      });
      setEditingUser(null);
      refetch();
      modal.alert('User Updated', `${userFirstName} ${userLastName}'s profile and role have been successfully updated.`, 'success');
    } catch (err: any) {
      setUserModalError(err?.response?.data?.message || err.message || 'Failed to update user.');
    }
  };

  // Quick Password Reset Modal
  const [resettingUser, setResettingUser] = useState<any | null>(null);
  const [newPasswordInput, setNewPasswordInput] = useState('');
  const [confirmPasswordInput, setConfirmPasswordInput] = useState('');
  const [resetError, setResetError] = useState<string | null>(null);

  const openResetPasswordModal = (user: any) => {
    setResettingUser(user);
    setNewPasswordInput('');
    setConfirmPasswordInput('');
    setResetError(null);
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resettingUser) return;
    if (newPasswordInput.length < 6) {
      setResetError('Password must be at least 6 characters.');
      return;
    }
    if (newPasswordInput !== confirmPasswordInput) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetError(null);
    try {
      await adminResetPasswordMutation.mutateAsync({
        id: resettingUser.id,
        newPassword: newPasswordInput,
      });
      setResettingUser(null);
      refetch();
      modal.alert('Password Changed', `New password successfully set for ${resettingUser.firstName} ${resettingUser.lastName}.`, 'success');
    } catch (err: any) {
      setResetError(err?.response?.data?.message || err.message || 'Failed to reset password.');
    }
  };

  // Toggle user suspension
  const handleToggleUserSuspend = async (user: any) => {
    const isSuspended = user.isSuspended;
    const action = isSuspended ? 'Reactivate' : 'Suspend';
    const confirmed = await modal.confirm(
      `${action} ${user.firstName} ${user.lastName}?`,
      isSuspended
        ? 'Reactivating this user will restore their authorization to access cashier desks and submit invoices.'
        : 'Suspending this user will revoke active sessions and prevent further login until reactivated.',
      action
    );
    if (confirmed) {
      try {
        await adminToggleSuspendMutation.mutateAsync(user.id);
        refetch();
        modal.alert('User Status Updated', `${user.firstName} ${user.lastName} is now ${isSuspended ? 'Active' : 'Suspended'}.`, 'success');
      } catch (err: any) {
        modal.alert('Action Failed', err?.response?.data?.message || err.message || 'Failed to update user status.', 'error');
      }
    }
  };

  // Config Modal State
  const [isConfigOpen, setIsConfigOpen] = useState(false);
  const [editPlan, setEditPlan] = useState<PlanType>('STARTER');
  const [editBillingMode, setEditBillingMode] = useState<BillingMode>('SUBSCRIPTION');
  const [editStaffQuota, setEditStaffQuota] = useState(2);
  const [editCustomDomain, setEditCustomDomain] = useState(false);
  const [editMultipleBranches, setEditMultipleBranches] = useState(false);
  const [editAdvancedReports, setEditAdvancedReports] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const openConfigModal = () => {
    if (!tenantData?.subscription) return;
    setEditPlan(tenantData.subscription.plan || 'STARTER');
    setEditBillingMode(tenantData.subscription.billingMode || 'SUBSCRIPTION');
    setEditStaffQuota(tenantData.subscription.maxStaffCount || 2);
    setEditCustomDomain(tenantData.subscription.hasCustomDomain || false);
    setEditMultipleBranches(tenantData.subscription.hasMultipleBranches || false);
    setEditAdvancedReports(tenantData.subscription.hasAdvancedReports || false);
    setConfigError(null);
    setIsConfigOpen(true);
  };

  const handlePlanSelect = (plan: PlanType) => {
    setEditPlan(plan);
    if (plan === 'STARTER') {
      setEditStaffQuota(2);
      setEditCustomDomain(false);
      setEditMultipleBranches(false);
      setEditAdvancedReports(false);
    } else if (plan === 'BUSINESS') {
      setEditStaffQuota(4);
      setEditCustomDomain(false);
      setEditMultipleBranches(true);
      setEditAdvancedReports(true);
    } else if (plan === 'ENTERPRISE') {
      setEditStaffQuota(10);
      setEditCustomDomain(true);
      setEditMultipleBranches(true);
      setEditAdvancedReports(true);
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setConfigError(null);
    try {
      await updatePlanMutation.mutateAsync({
        businessId: tenantId,
        data: {
          plan: editPlan,
          billingMode: editBillingMode,
          maxStaffCount: Number(editStaffQuota),
          hasCustomDomain: editCustomDomain,
          hasMultipleBranches: editMultipleBranches,
          hasAdvancedReports: editAdvancedReports,
        },
      });
      setIsConfigOpen(false);
      refetch();
      modal.alert('Configuration Updated', 'Tenant subscription and feature toggles successfully updated.', 'success');
    } catch (err: any) {
      setConfigError(err?.response?.data?.message || err.message || 'Failed to update tenant plan.');
    }
  };

  const handleToggleStatus = async () => {
    if (!tenantData) return;
    const isSuspended = tenantData.business.onboardingStatus === 'SUSPENDED';
    const nextStatus = isSuspended ? 'ACTIVE' : 'SUSPENDED';
    const actionLabel = isSuspended ? 'Reactivate' : 'Suspend';

    const confirmed = await modal.confirm(
      `${actionLabel} ${tenantData.business.businessName}`,
      isSuspended
        ? 'Reactivating this organization will restore login access and allow all associated staff to resume billing operations.'
        : 'Suspension will immediately revoke all active staff sessions and completely block login access for all users under this organization until reactivated.',
      actionLabel
    );

    if (confirmed) {
      try {
        await updateStatusMutation.mutateAsync({
          id: tenantId,
          onboardingStatus: nextStatus,
        });
        refetch();
        modal.alert(
          `Organization ${nextStatus === 'ACTIVE' ? 'Reactivated' : 'Suspended'}`,
          `Status for ${tenantData.business.businessName} updated to ${nextStatus}.`,
          nextStatus === 'ACTIVE' ? 'success' : 'info'
        );
      } catch (err: any) {
        modal.alert('Action Failed', err?.response?.data?.message || err.message || 'Failed to update status.', 'error');
      }
    }
  };

  const formatCurrency = (amount: number) => {
    return `₦${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-8 w-64 rounded-xl" />
        </div>
        <Skeleton className="h-32 w-full rounded-2xl" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
          <Skeleton className="h-24 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !tenantData) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto my-12 bg-card border border-border rounded-2xl shadow-sm">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-base text-foreground">Organization Not Found</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Could not retrieve business details.'}
          </p>
        </div>
        <Link href="/admin/tenants">
          <Button variant="outline" size="sm" className="rounded-xl">
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            Back to All Tenants
          </Button>
        </Link>
      </div>
    );
  }

  const { business, subscription, domains, stats, users, recentInvoices, recentLogs } = tenantData;
  const isSuspended = business.onboardingStatus === 'SUSPENDED';
  const plan = subscription?.plan || 'STARTER';
  const billingMode = subscription?.billingMode || 'SUBSCRIPTION';
  const maxStaff = subscription?.maxStaffCount || 2;
  const tenantStaffUsers = (users || []).filter((u) => u.role !== 'SUPER_ADMIN');
  const staffUsagePercent = Math.min(100, Math.round((tenantStaffUsers.length / maxStaff) * 100));

  const filteredUsers = tenantStaffUsers.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredInvoices = recentInvoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

  // Paginated Slices
  const paginatedUsers = filteredUsers.slice((staffPage - 1) * staffPageSize, staffPage * staffPageSize);
  const userTotalPages = Math.ceil(filteredUsers.length / staffPageSize) || 1;

  const paginatedInvoices = filteredInvoices.slice((invoicePage - 1) * invoicePageSize, invoicePage * invoicePageSize);
  const invoiceTotalPages = Math.ceil(filteredInvoices.length / invoicePageSize) || 1;

  const paginatedLogs = recentLogs.slice((logPage - 1) * logPageSize, logPage * logPageSize);
  const logTotalPages = Math.ceil(recentLogs.length / logPageSize) || 1;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* ========================================================= */}
      {/* TOP NAVIGATION & BREADCRUMBS                              */}
      {/* ========================================================= */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-border/60">
        <div className="flex items-center space-x-3">
          <Link href="/admin/tenants">
            <Button variant="outline" size="icon" className="h-9 w-9 rounded-full shadow-sm hover:bg-secondary">
              <ArrowLeft className="h-4 w-4 text-foreground" />
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <Link href="/admin/tenants" className="text-xs text-muted-foreground hover:text-foreground font-medium">
                Tenants
              </Link>
              <span className="text-xs text-muted-foreground">/</span>
              <span className="text-xs font-semibold text-foreground">{business.businessName}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {business.businessName}
            </h1>
          </div>
        </div>

        {/* Global Action CTAs */}
        <div className="flex items-center flex-wrap gap-2">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isFetching}
            className="h-9 rounded-xl text-xs border-border hover:bg-secondary flex items-center space-x-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-emerald-500' : 'text-muted-foreground'}`} />
            <span>Refresh</span>
          </Button>

          <Button
            onClick={openConfigModal}
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-xs border-border hover:bg-secondary flex items-center space-x-1.5"
          >
            <Sliders className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Configure Plan</span>
          </Button>

          <Button
            onClick={handleToggleStatus}
            size="sm"
            className={`h-9 rounded-xl text-xs font-semibold flex items-center space-x-1.5 ${
              isSuspended
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-rose-600 hover:bg-rose-500 text-white'
            }`}
          >
            {isSuspended ? (
              <>
                <CheckCircle2 className="h-3.5 w-3.5" />
                <span>Reactivate Organization</span>
              </>
            ) : (
              <>
                <ShieldAlert className="h-3.5 w-3.5" />
                <span>Suspend Organization</span>
              </>
            )}
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* HERO BANNER & TENANT IDENTITY                             */}
      {/* ========================================================= */}
      <div className="p-6 rounded-2xl bg-card border border-border shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center space-x-4">
          <div className="h-16 w-16 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center font-extrabold text-2xl shadow-sm shrink-0">
            {business.businessName.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2.5 flex-wrap gap-y-1">
              <h2 className="text-xl font-bold text-foreground font-heading">{business.businessName}</h2>
              <Badge
                className={
                  !isSuspended
                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-xs'
                    : 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20 text-xs'
                }
              >
                {business.onboardingStatus}
              </Badge>
              <Badge
                variant="outline"
                className={
                  plan === 'ENTERPRISE'
                    ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 text-xs font-semibold'
                    : plan === 'BUSINESS'
                    ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 text-xs font-semibold'
                    : 'border-border text-foreground text-xs font-semibold'
                }
              >
                {plan} Tier
              </Badge>
              <Badge
                variant="outline"
                className={
                  billingMode === 'COMPLIMENTARY'
                    ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-xs font-semibold'
                    : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs font-semibold'
                }
              >
                {billingMode}
              </Badge>
            </div>
            <div className="flex items-center space-x-4 text-xs text-muted-foreground flex-wrap gap-y-1">
              <span className="font-mono bg-secondary px-2 py-0.5 rounded text-[11px] border border-border">
                {business.slug || 'no-slug'}
              </span>
              <span>•</span>
              <span className="flex items-center space-x-1">
                <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                <span>{business.email}</span>
              </span>
              {business.phone && (
                <>
                  <span>•</span>
                  <span className="flex items-center space-x-1">
                    <Phone className="h-3.5 w-3.5 text-muted-foreground" />
                    <span>{business.phone}</span>
                  </span>
                </>
              )}
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start md:items-end space-y-1 text-xs text-muted-foreground">
          <span className="text-[11px] uppercase tracking-wider font-semibold text-muted-foreground">
            Configured Primary Domain
          </span>
          <p className="text-sm font-mono font-bold text-foreground">
            {domains.find((d) => d.isPrimary)?.domain || `${business.slug}.bolxolve.com`}
          </p>
          <span className="text-[10px]">
            Created {new Date(business.createdAt).toLocaleDateString(undefined, { dateStyle: 'long' })}
          </span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KEY METRICS & PLATFORM HEALTH                             */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Invoiced Volume */}
        <Card className="rounded-2xl border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-semibold">Total Invoiced Volume</p>
            <div className="h-8 w-8 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-heading text-foreground mt-2">
            {formatCurrency(stats.totalInvoiceVolume)}
          </h3>
          <p className="text-[11px] text-muted-foreground mt-1">Aggregated across all customer bills</p>
        </Card>

        {/* Metric 2: Total Invoices */}
        <Card className="rounded-2xl border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-semibold">Invoices Generated</p>
            <div className="h-8 w-8 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
              <FileText className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-heading text-foreground mt-2">{stats.invoiceCount}</h3>
          <p className="text-[11px] text-muted-foreground mt-1">
            Next invoice #{business.receiptPrefix}-{business.nextInvoiceNumber}
          </p>
        </Card>

        {/* Metric 3: Staff Usage vs Quota */}
        <Card className="rounded-2xl border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-semibold">Staff Allocation</p>
            <div className="h-8 w-8 rounded-xl bg-purple-500/10 text-purple-500 flex items-center justify-center">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="flex items-baseline space-x-2 mt-2">
            <h3 className="text-2xl font-bold font-heading text-foreground">{tenantStaffUsers.length}</h3>
            <span className="text-xs text-muted-foreground font-mono">/ {maxStaff} permitted</span>
          </div>
          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden mt-2">
            <div
              className={`h-full rounded-full transition-all ${
                staffUsagePercent >= 100
                  ? 'bg-rose-500'
                  : staffUsagePercent >= 75
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${staffUsagePercent}%` }}
            />
          </div>
        </Card>

        {/* Metric 4: Customers Registered */}
        <Card className="rounded-2xl border-border bg-card shadow-sm p-5">
          <div className="flex items-center justify-between">
            <p className="text-xs text-muted-foreground font-semibold">Unique Customers</p>
            <div className="h-8 w-8 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <h3 className="text-2xl font-bold font-heading text-foreground mt-2">{stats.customerCount}</h3>
          <p className="text-[11px] text-muted-foreground mt-1">Directly attached to billing profile</p>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* MANAGEMENT TABS & DEEP DRILLDOWN                          */}
      {/* ========================================================= */}
      <div className="space-y-4">
        {/* Navigation Pills */}
        <div className="flex items-center space-x-2 border-b border-border pb-3 overflow-x-auto text-xs">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'users'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Staff & Cashiers ({tenantStaffUsers.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('invoices')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'invoices'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <FileText className="h-4 w-4" />
            <span>Recent Invoices ({recentInvoices.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'settings'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>Workspace Profile & Settings</span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl font-semibold flex items-center space-x-2 transition-all ${
              activeTab === 'logs'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'bg-card text-muted-foreground hover:bg-secondary hover:text-foreground'
            }`}
          >
            <Activity className="h-4 w-4" />
            <span>Tenant Audit Trail ({recentLogs.length})</span>
          </button>
        </div>

        {/* TAB 1: USERS & CASHIERS */}
        {activeTab === 'users' && (
          <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border py-4 px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Staff & Cashier Desks
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Manage team access, promote/change administrators, reset passwords, or suspend specific cashiers.
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search staff name or email..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/30 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="py-3 px-6">Member & Email</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4 text-right">Joined</th>
                      <th className="py-3 px-6 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="py-8 text-center text-muted-foreground">
                          No staff accounts found matching your filter.
                        </td>
                      </tr>
                    ) : (
                      paginatedUsers.map((u) => {
                        const isAdminUser = u.role === 'ADMIN';

                        return (
                          <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                            <td className="py-3 px-6">
                              <div className="flex items-center space-x-3">
                                <div className={`h-8 w-8 rounded-full flex items-center justify-center font-bold shrink-0 ${
                                  isAdminUser ? 'bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30' : 'bg-secondary text-foreground'
                                }`}>
                                  {isAdminUser ? <Crown className="h-4 w-4" /> : u.firstName.charAt(0)}
                                </div>
                                <div>
                                  <p className="font-bold text-foreground flex items-center space-x-1.5">
                                    <span>{u.firstName} {u.lastName}</span>
                                    {isAdminUser && (
                                      <Badge variant="outline" className="text-[9px] bg-emerald-500/10 text-emerald-600 border-emerald-500/30 py-0 px-1.5">
                                        Primary Admin
                                      </Badge>
                                    )}
                                  </p>
                                  <p className="text-[11px] text-muted-foreground font-mono">{u.email}</p>
                                </div>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={
                                  isAdminUser
                                    ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px] font-semibold'
                                    : 'border-border text-foreground text-[10px]'
                                }
                              >
                                {isAdminUser ? 'Administrator' : 'Cashier / Apprentice'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-center">
                              <Badge
                                className={
                                  !u.isSuspended
                                    ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]'
                                    : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px]'
                                }
                              >
                                {u.isSuspended ? 'Suspended' : 'Active'}
                              </Badge>
                            </td>
                            <td className="py-3 px-4 text-right font-mono text-muted-foreground text-[11px]">
                              {new Date(u.createdAt).toLocaleDateString()}
                            </td>
                            <td className="py-3 px-6 text-right">
                              <div className="flex items-center justify-end space-x-1.5">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openEditUserModal(u)}
                                  className="h-7 px-2 text-[11px] rounded-lg border-border hover:bg-secondary"
                                  title="Edit staff details, change role, or designate as administrator"
                                >
                                  <Edit className="h-3 w-3 mr-1 text-muted-foreground" />
                                  <span>Edit</span>
                                </Button>

                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => openResetPasswordModal(u)}
                                  className="h-7 px-2 text-[11px] rounded-lg border-border hover:bg-secondary"
                                  title="Change password for this user"
                                >
                                  <Key className="h-3 w-3 mr-1 text-amber-500" />
                                  <span>Password</span>
                                </Button>

                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleToggleUserSuspend(u)}
                                  className={`h-7 px-2 text-[11px] rounded-lg ${
                                    u.isSuspended
                                      ? 'text-emerald-500 hover:bg-emerald-500/10'
                                      : 'text-rose-500 hover:bg-rose-500/10'
                                  }`}
                                  title={u.isSuspended ? 'Reactivate user account' : 'Suspend user account'}
                                >
                                  {u.isSuspended ? (
                                    <span className="flex items-center"><UserCheck className="h-3 w-3 mr-1" /> Activate</span>
                                  ) : (
                                    <span className="flex items-center"><UserX className="h-3 w-3 mr-1" /> Suspend</span>
                                  )}
                                </Button>
                              </div>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>

              {/* Staff Pagination */}
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={staffPage}
                  totalPages={userTotalPages}
                  onPageChange={setStaffPage}
                  totalItems={filteredUsers.length}
                  itemsPerPage={staffPageSize}
                  itemName="staff accounts"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 2: INVOICES */}
        {activeTab === 'invoices' && (
          <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border py-4 px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Recent Billing Ledger
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Click any invoice row to view full transaction breakdown, line items, and audit details.
                  </CardDescription>
                </div>
                <div className="relative w-full sm:w-64">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                  <input
                    type="text"
                    placeholder="Search invoice # or customer..."
                    value={invoiceSearch}
                    onChange={(e) => setInvoiceSearch(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-secondary/30 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                    <tr>
                      <th className="py-3 px-6">Invoice #</th>
                      <th className="py-3 px-4">Customer Name</th>
                      <th className="py-3 px-4 text-right">Amount (₦)</th>
                      <th className="py-3 px-4 text-center">Status</th>
                      <th className="py-3 px-4">Issued By</th>
                      <th className="py-3 px-6 text-right">Date</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-muted-foreground">
                          No invoices found for this organization.
                        </td>
                      </tr>
                    ) : (
                      paginatedInvoices.map((inv) => (
                        <tr
                          key={inv.id}
                          onClick={() => setViewingInvoice(inv)}
                          className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                        >
                          <td className="py-3 px-6 font-mono font-bold text-emerald-600 dark:text-emerald-400 group-hover:underline">
                            #{inv.invoiceNumber}
                          </td>
                          <td className="py-3 px-4">
                            <p className="font-semibold text-foreground">{inv.customerName}</p>
                            {inv.customerPhone && (
                              <p className="text-[10px] text-muted-foreground font-mono">{inv.customerPhone}</p>
                            )}
                          </td>
                          <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                            {formatCurrency(inv.total)}
                          </td>
                          <td className="py-3 px-4 text-center">
                            <Badge
                              variant="outline"
                              className={
                                inv.status === 'FINALIZED'
                                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]'
                                  : 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px]'
                              }
                            >
                              {inv.status}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-muted-foreground">
                            {inv.creator ? `${inv.creator.firstName} ${inv.creator.lastName}` : 'System'}
                          </td>
                          <td className="py-3 px-6 text-right font-mono text-muted-foreground text-[11px]">
                            {new Date(inv.createdAt).toLocaleDateString()}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={(e) => {
                                e.stopPropagation();
                                setViewingInvoice(inv);
                              }}
                              className="h-7 w-7 p-0 rounded-lg text-muted-foreground group-hover:text-emerald-500"
                              title="View Invoice Details"
                            >
                              <Eye className="h-3.5 w-3.5" />
                            </Button>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              {/* Invoices Pagination */}
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={invoicePage}
                  totalPages={invoiceTotalPages}
                  onPageChange={setInvoicePage}
                  totalItems={filteredInvoices.length}
                  itemsPerPage={invoicePageSize}
                  itemName="invoices"
                />
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: SETTINGS & DOMAINS */}
        {activeTab === 'settings' && (
          <div className="space-y-6">
            <div className="flex justify-end">
              <Button
                onClick={openEditSettingsModal}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-9 px-4 shadow-sm flex items-center space-x-1.5"
              >
                <Edit className="h-3.5 w-3.5 mr-1" />
                <span>Edit Workspace Profile & Settings</span>
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center space-x-2">
                    <Building2 className="h-4 w-4 text-emerald-500" />
                    <span>Depot Contact & Legal Info</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs">
                  <div>
                    <span className="text-muted-foreground font-semibold">Business Workspace Name</span>
                    <p className="font-bold text-foreground text-sm mt-0.5">{business.businessName}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground font-semibold">Physical Depot Address</span>
                    <p className="font-medium text-foreground mt-0.5">{business.address || 'Not specified'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-muted-foreground font-semibold">Official Phone</span>
                      <p className="font-medium text-foreground mt-0.5">{business.phone || 'Not specified'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold">Official Email</span>
                      <p className="font-medium text-foreground mt-0.5">{business.email}</p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4 pt-2 border-t border-border">
                    <div>
                      <span className="text-muted-foreground font-semibold">TIN (Tax Identification)</span>
                      <p className="font-mono text-foreground mt-0.5">{business.tin || 'Not provided'}</p>
                    </div>
                    <div>
                      <span className="text-muted-foreground font-semibold">RC / CAC Registration</span>
                      <p className="font-mono text-foreground mt-0.5">{business.cacOrRegNumber || 'Not provided'}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="rounded-2xl border-border bg-card shadow-sm">
                <CardHeader className="py-4 px-6 border-b border-border flex flex-row items-center justify-between">
                  <CardTitle className="text-sm font-bold text-foreground flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-blue-500" />
                    <span>Invoice & Tax Configuration</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 space-y-4 text-xs">
                  <div className="grid grid-cols-3 gap-3">
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Prefix</span>
                      <p className="text-base font-bold font-mono text-foreground mt-1">{business.receiptPrefix}</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Default VAT</span>
                      <p className="text-base font-bold font-mono text-foreground mt-1">{business.defaultVatPercentage}%</p>
                    </div>
                    <div className="p-3 rounded-xl bg-secondary/30 border border-border">
                      <span className="text-[10px] text-muted-foreground uppercase font-bold">Default WHT</span>
                      <p className="text-base font-bold font-mono text-foreground mt-1">{business.defaultWhtPercentage}%</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-border space-y-2">
                    <span className="text-muted-foreground font-semibold">Configured Domains</span>
                    {domains.length === 0 ? (
                      <p className="text-xs text-muted-foreground">Default subdomain only: {business.slug}.bolxolve.com</p>
                    ) : (
                      <div className="space-y-1.5">
                        {domains.map((d) => (
                          <div key={d.id} className="p-2.5 rounded-xl bg-secondary/40 border border-border flex items-center justify-between text-xs">
                            <span className="font-mono font-bold text-foreground">{d.domain}</span>
                            <div className="flex items-center space-x-1.5">
                              {d.isCustom && <Badge className="text-[9px] bg-purple-500/10 text-purple-600">Custom Domain</Badge>}
                              {d.isPrimary && <Badge className="text-[9px] bg-emerald-500/10 text-emerald-600">Primary</Badge>}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* TAB 4: AUDIT LOGS */}
        {activeTab === 'logs' && (
          <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border py-4 px-6">
              <CardTitle className="text-base font-bold text-foreground">
                Tenant Audit Trail
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Chronological security events and operational actions within this organization.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-border/60">
                {recentLogs.length === 0 ? (
                  <p className="py-8 text-center text-xs text-muted-foreground">No recent audit logs recorded.</p>
                ) : (
                  paginatedLogs.map((log) => (
                    <div key={log.id} className="p-4 hover:bg-secondary/20 transition-colors flex items-center justify-between text-xs">
                      <div className="space-y-0.5">
                        <div className="flex items-center space-x-2">
                          <Badge variant="outline" className="font-mono text-[10px] border-border">
                            {log.action}
                          </Badge>
                          <span className="font-semibold text-foreground">
                            {log.user ? `${log.user.firstName} ${log.user.lastName}` : 'Platform System'}
                          </span>
                        </div>
                        {log.ipAddress && (
                          <p className="text-[10px] text-muted-foreground font-mono">IP: {log.ipAddress}</p>
                        )}
                      </div>
                      <span className="font-mono text-muted-foreground text-[11px]">
                        {new Date(log.createdAt).toLocaleString()}
                      </span>
                    </div>
                  ))
                )}
              </div>

              {/* Audit Logs Pagination */}
              <div className="p-4 border-t border-border">
                <Pagination
                  currentPage={logPage}
                  totalPages={logTotalPages}
                  onPageChange={setLogPage}
                  totalItems={recentLogs.length}
                  itemsPerPage={logPageSize}
                  itemName="audit events"
                />
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* ========================================================= */}
      {/* INVOICE DETAILS MODAL                                     */}
      {/* ========================================================= */}
      <Dialog open={!!viewingInvoice} onOpenChange={(open) => !open && setViewingInvoice(null)}>
        <DialogContent className="sm:max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl">
          {viewingInvoice && (
            <div className="space-y-6">
              <DialogHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2.5">
                    <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <DialogTitle className="text-lg font-bold text-foreground">
                        Invoice #{viewingInvoice.invoiceNumber}
                      </DialogTitle>
                      <DialogDescription className="text-xs text-muted-foreground">
                        Issued on {new Date(viewingInvoice.createdAt).toLocaleString()}
                      </DialogDescription>
                    </div>
                  </div>
                  <Badge
                    variant="outline"
                    className={
                      viewingInvoice.status === 'FINALIZED'
                        ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-xs font-semibold'
                        : 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-xs font-semibold'
                    }
                  >
                    {viewingInvoice.status}
                  </Badge>
                </div>
              </DialogHeader>

              {/* Customer & Cashier Metadata */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-secondary/30 border border-border text-xs">
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Customer Details</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">{viewingInvoice.customerName}</p>
                  {viewingInvoice.customerPhone && (
                    <p className="text-muted-foreground font-mono mt-0.5">{viewingInvoice.customerPhone}</p>
                  )}
                </div>
                <div>
                  <span className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider">Cashier / Attendant</span>
                  <p className="font-bold text-foreground text-sm mt-0.5">
                    {viewingInvoice.creator ? `${viewingInvoice.creator.firstName} ${viewingInvoice.creator.lastName}` : 'System'}
                  </p>
                  {viewingInvoice.creator?.email && (
                    <p className="text-muted-foreground font-mono mt-0.5">{viewingInvoice.creator.email}</p>
                  )}
                </div>
              </div>

              {/* Line Items Table */}
              <div className="space-y-2">
                <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Line Items</span>
                <div className="rounded-xl border border-border overflow-hidden">
                  <table className="w-full text-xs text-left">
                    <thead className="bg-secondary/40 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                      <tr>
                        <th className="py-2.5 px-4">#</th>
                        <th className="py-2.5 px-4">Description</th>
                        <th className="py-2.5 px-4 text-center">Qty</th>
                        <th className="py-2.5 px-4 text-right">Unit Price (₦)</th>
                        {viewingInvoice.items?.some((i: any) => i.weight) && (
                          <th className="py-2.5 px-4 text-right">Weight</th>
                        )}
                        <th className="py-2.5 px-4 text-right">Total (₦)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {viewingInvoice.items && viewingInvoice.items.length > 0 ? (
                        viewingInvoice.items.map((item: any, idx: number) => (
                          <tr key={item.id || idx} className="hover:bg-secondary/20">
                            <td className="py-2.5 px-4 font-mono text-muted-foreground">{idx + 1}</td>
                            <td className="py-2.5 px-4 font-medium text-foreground">{item.description}</td>
                            <td className="py-2.5 px-4 text-center font-mono">{Number(item.quantity)}</td>
                            <td className="py-2.5 px-4 text-right font-mono">{formatCurrency(item.unitPrice)}</td>
                            {viewingInvoice.items?.some((i: any) => i.weight) && (
                              <td className="py-2.5 px-4 text-right font-mono text-muted-foreground">
                                {item.weight ? `${item.weight} kg` : '—'}
                              </td>
                            )}
                            <td className="py-2.5 px-4 text-right font-mono font-bold text-foreground">
                              {formatCurrency(item.totalPrice)}
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={5} className="py-4 text-center text-muted-foreground">
                            Standard summarized invoice ledger record. Total value: {formatCurrency(viewingInvoice.total)}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Additional Charges if any */}
              {viewingInvoice.charges && viewingInvoice.charges.length > 0 && (
                <div className="space-y-1.5 p-3 rounded-xl bg-secondary/20 border border-border text-xs">
                  <span className="font-semibold text-muted-foreground text-[11px]">Applied Charges:</span>
                  <div className="space-y-1">
                    {viewingInvoice.charges.map((charge: any, idx: number) => (
                      <div key={idx} className="flex justify-between font-mono">
                        <span className="text-foreground">{charge.name}</span>
                        <span className="font-bold text-foreground">{formatCurrency(charge.amount)}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Financial Totals */}
              <div className="p-4 rounded-xl bg-secondary/30 border border-border flex flex-col items-end space-y-1 text-xs">
                <div className="flex justify-between w-full max-w-xs text-muted-foreground">
                  <span>Subtotal:</span>
                  <span className="font-mono text-foreground font-semibold">{formatCurrency(viewingInvoice.subtotal || viewingInvoice.total)}</span>
                </div>
                <div className="flex justify-between w-full max-w-xs pt-1.5 border-t border-border text-sm font-bold text-foreground">
                  <span>Total Amount:</span>
                  <span className="font-mono text-emerald-600 dark:text-emerald-400">{formatCurrency(viewingInvoice.total)}</span>
                </div>
              </div>

              {viewingInvoice.notes && (
                <div className="text-xs p-3 rounded-xl bg-secondary/20 border border-border">
                  <span className="font-semibold text-muted-foreground">Notes:</span>
                  <p className="text-foreground mt-0.5">{viewingInvoice.notes}</p>
                </div>
              )}

              <DialogFooter>
                <Button
                  variant="outline"
                  onClick={() => setViewingInvoice(null)}
                  className="rounded-xl text-xs h-9 px-4"
                >
                  Close
                </Button>
              </DialogFooter>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* EDIT WORKSPACE PROFILE & SETTINGS MODAL                   */}
      {/* ========================================================= */}
      <Dialog open={isEditSettingsOpen} onOpenChange={setIsEditSettingsOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl max-h-[92vh] overflow-y-auto rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border/60">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center space-x-2.5">
              <Building2 className="h-6 w-6 text-emerald-500" />
              <span>Edit Organization Details & Settings</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Update depot contact information, legal identifiers, and default invoicing prefixes.
            </DialogDescription>
          </DialogHeader>

          {settingsError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm font-medium">
              {settingsError}
            </div>
          )}

          <form onSubmit={handleSaveSettings} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Business Workspace Name</Label>
              <Input
                value={settingsBizName}
                onChange={(e) => setSettingsBizName(e.target.value)}
                required
                className="h-11 rounded-xl text-sm px-4 bg-background border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Physical Depot Address</Label>
              <Input
                value={settingsAddress}
                onChange={(e) => setSettingsAddress(e.target.value)}
                required
                className="h-11 rounded-xl text-sm px-4 bg-background border-border"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Official Phone</Label>
                <Input
                  value={settingsPhone}
                  onChange={(e) => setSettingsPhone(e.target.value)}
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Official Email</Label>
                <Input
                  type="email"
                  value={settingsEmail}
                  onChange={(e) => setSettingsEmail(e.target.value)}
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">TIN (Tax ID Number)</Label>
                <Input
                  value={settingsTin}
                  onChange={(e) => setSettingsTin(e.target.value)}
                  placeholder="e.g. 12345678-0001"
                  className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">RC / CAC Registration</Label>
                <Input
                  value={settingsCac}
                  onChange={(e) => setSettingsCac(e.target.value)}
                  placeholder="e.g. RC-123456"
                  className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-border/70">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Receipt Prefix</Label>
                <Input
                  value={settingsPrefix}
                  onChange={(e) => setSettingsPrefix(e.target.value.toUpperCase())}
                  required
                  className="h-11 rounded-xl text-sm font-mono uppercase px-4 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Default VAT %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settingsVat}
                  onChange={(e) => setSettingsVat(parseFloat(e.target.value) || 0)}
                  className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Default WHT %</Label>
                <Input
                  type="number"
                  step="0.01"
                  min="0"
                  max="100"
                  value={settingsWht}
                  onChange={(e) => setSettingsWht(parseFloat(e.target.value) || 0)}
                  className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
                />
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditSettingsOpen(false)}
                className="rounded-xl text-xs font-semibold h-11 px-6 border-border hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updateSettingsMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-11 px-7 shadow-md shadow-emerald-500/20"
              >
                {updateSettingsMutation.isPending ? 'Saving...' : 'Save Workspace Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* EDIT USER & ADMIN ROLE MODAL                              */}
      {/* ========================================================= */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border/60">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center space-x-2.5">
              <Users className="h-6 w-6 text-emerald-500" />
              <span>Edit Staff Member & Role</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Modify account attributes or adjust administrator privileges for this organization.
            </DialogDescription>
          </DialogHeader>

          {userModalError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm font-medium">
              {userModalError}
            </div>
          )}

          <form onSubmit={handleSaveUser} className="space-y-5 pt-2">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">First Name</Label>
                <Input
                  value={userFirstName}
                  onChange={(e) => setUserFirstName(e.target.value)}
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-bold text-foreground">Last Name</Label>
                <Input
                  value={userLastName}
                  onChange={(e) => setUserLastName(e.target.value)}
                  required
                  className="h-11 rounded-xl text-sm px-4 bg-background border-border"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Email Address</Label>
              <Input
                type="email"
                value={userEmail}
                onChange={(e) => setUserEmail(e.target.value)}
                required
                className="h-11 rounded-xl text-sm px-4 bg-background border-border"
              />
            </div>

            <div className="space-y-2.5 pt-3 border-t border-border/70">
              <Label className="text-xs font-bold text-foreground">Organization Role</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div
                  onClick={() => setUserRole('ADMIN')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    userRole === 'ADMIN'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Crown className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-bold text-foreground font-heading">Administrator</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-snug">Full business management, stock, reporting, and staff oversight</p>
                </div>

                <div
                  onClick={() => setUserRole('APPRENTICE')}
                  className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                    userRole === 'APPRENTICE'
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  <div className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-emerald-500" />
                    <span className="text-sm font-bold text-foreground font-heading">Cashier / Apprentice</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-snug">Restricted to POS desk, issuing receipts, and sales generation</p>
                </div>
              </div>
            </div>

            <div className="space-y-1.5 pt-3 border-t border-border/70">
              <Label className="text-xs font-bold text-foreground flex items-center justify-between">
                <span>Set New Password (Optional)</span>
                <span className="text-xs text-muted-foreground font-normal">Leave blank to keep unchanged</span>
              </Label>
              <Input
                type="password"
                value={userNewPassword}
                onChange={(e) => setUserNewPassword(e.target.value)}
                placeholder="At least 6 characters"
                className="h-11 rounded-xl text-sm px-4 bg-background border-border"
              />
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setEditingUser(null)}
                className="rounded-xl text-xs font-semibold h-11 px-6 border-border hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adminUpdateUserMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-11 px-7 shadow-md shadow-emerald-500/20"
              >
                {adminUpdateUserMutation.isPending ? 'Saving...' : 'Save User Changes'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* QUICK RESET PASSWORD MODAL                                */}
      {/* ========================================================= */}
      <Dialog open={!!resettingUser} onOpenChange={(open) => !open && setResettingUser(null)}>
        <DialogContent className="sm:max-w-lg md:max-w-xl rounded-3xl bg-card border border-border p-6 sm:p-8 shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border/60">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center space-x-2.5">
              <Key className="h-6 w-6 text-amber-500" />
              <span>Change Account Password</span>
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Set a new secure password for <strong className="text-foreground">{resettingUser?.firstName} {resettingUser?.lastName}</strong> ({resettingUser?.email}). Active sessions will be invalidated.
            </DialogDescription>
          </DialogHeader>

          {resetError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm font-medium">
              {resetError}
            </div>
          )}

          <form onSubmit={handleResetPassword} className="space-y-5 pt-2">
            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">New Password</Label>
              <Input
                type="password"
                value={newPasswordInput}
                onChange={(e) => setNewPasswordInput(e.target.value)}
                required
                placeholder="Minimum 6 characters"
                className="h-11 rounded-xl text-sm px-4 bg-background border-border"
              />
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-bold text-foreground">Confirm New Password</Label>
              <Input
                type="password"
                value={confirmPasswordInput}
                onChange={(e) => setConfirmPasswordInput(e.target.value)}
                required
                placeholder="Re-enter new password"
                className="h-11 rounded-xl text-sm px-4 bg-background border-border"
              />
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setResettingUser(null)}
                className="rounded-xl text-xs font-semibold h-11 px-6 border-border hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={adminResetPasswordMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-11 px-7 shadow-md shadow-emerald-500/20"
              >
                {adminResetPasswordMutation.isPending ? 'Updating...' : 'Set New Password'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* PLAN CONFIGURATION MODAL                                  */}
      {/* ========================================================= */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-2xl md:max-w-3xl rounded-3xl bg-card border border-border p-6 sm:p-8 max-h-[92vh] overflow-y-auto shadow-2xl">
          <DialogHeader className="space-y-1.5 pb-3 border-b border-border/60">
            <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground">
              Configure Plan & Features for {business.businessName}
            </DialogTitle>
            <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
              Select tier, adjust cashier account quotas, or toggle enterprise capabilities.
            </DialogDescription>
          </DialogHeader>

          {configError && (
            <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/25 text-rose-500 text-sm font-medium">
              {configError}
            </div>
          )}

          <form onSubmit={handleSaveConfig} className="space-y-6 pt-2">
            {/* Tier Select */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-foreground">Subscription Plan Tier</Label>
                <span className="text-xs text-muted-foreground">Select tier package</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {[
                  { id: 'STARTER' as PlanType, name: 'STARTER', desc: 'Up to 2 Staff', features: 'Basic invoicing, no scanner' },
                  { id: 'BUSINESS' as PlanType, name: 'BUSINESS', desc: 'Up to 4 Staff', features: 'AI scanner included' },
                  { id: 'ENTERPRISE' as PlanType, name: 'ENTERPRISE', desc: 'Custom Staff', features: 'All modular features' },
                ].map((tier) => {
                  const isSelected = editPlan === tier.id;
                  return (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => handlePlanSelect(tier.id)}
                      className={`p-4 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                          : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60 hover:text-foreground'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className={`text-sm font-bold tracking-wide ${isSelected ? 'text-emerald-500 font-heading' : 'text-foreground font-heading'}`}>
                          {tier.name}
                        </span>
                        {isSelected && (
                          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                        )}
                      </div>
                      <p className="text-xs font-semibold text-foreground/80 mb-1">{tier.desc}</p>
                      <p className="text-[11px] text-muted-foreground leading-snug">{tier.features}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Commercial Billing Mode */}
            <div className="space-y-2.5">
              <Label className="text-sm font-bold text-foreground">Billing Mode</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setEditBillingMode('SUBSCRIPTION')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    editBillingMode === 'SUBSCRIPTION'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  <p className={`text-sm font-bold ${editBillingMode === 'SUBSCRIPTION' ? 'text-emerald-500' : 'text-foreground'}`}>
                    Paid SaaS Subscription
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Recurring periodic commercial license</p>
                </button>
                <button
                  type="button"
                  onClick={() => setEditBillingMode('COMPLIMENTARY')}
                  className={`p-4 rounded-2xl border text-left transition-all ${
                    editBillingMode === 'COMPLIMENTARY'
                      ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20 shadow-md shadow-emerald-500/10'
                      : 'border-border bg-secondary/30 text-muted-foreground hover:bg-secondary/60'
                  }`}
                >
                  <p className={`text-sm font-bold ${editBillingMode === 'COMPLIMENTARY' ? 'text-emerald-500' : 'text-foreground'}`}>
                    Complimentary Partner
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Sponsored zero-fee partner access</p>
                </button>
              </div>
            </div>

            {/* Staff Quota Input */}
            <div className="space-y-2 p-4 rounded-2xl bg-secondary/20 border border-border">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-bold text-foreground">
                  Max Staff / Cashier Quota
                </Label>
                <span className="text-xs text-muted-foreground">
                  Currently using <strong className="text-foreground font-semibold">{tenantStaffUsers.length}</strong> of <strong className="text-emerald-500 font-semibold">{editStaffQuota}</strong> accounts
                </span>
              </div>
              <Input
                type="number"
                min={tenantStaffUsers.length || 1}
                max={100}
                value={editStaffQuota}
                onChange={(e) => setEditStaffQuota(parseInt(e.target.value) || 2)}
                className="h-11 rounded-xl text-sm font-mono px-4 bg-background border-border"
              />
            </div>

            {/* Feature Toggles */}
            <div className="space-y-3 pt-3 border-t border-border">
              <div>
                <Label className="text-sm font-bold text-foreground">Modular Capabilities</Label>
                <p className="text-xs text-muted-foreground mt-0.5">Toggle advanced modules and enterprise add-ons for this workspace.</p>
              </div>
              <div className="space-y-2.5">
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="pr-4">
                    <span className="text-sm font-semibold text-foreground block">Custom Enterprise Domain Routing</span>
                    <span className="text-xs text-muted-foreground">Allow company to map and route their own custom subdomain / apex domain.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editCustomDomain}
                    onChange={(e) => setEditCustomDomain(e.target.checked)}
                    className="h-5 w-5 rounded-md border-border text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                </label>
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="pr-4">
                    <span className="text-sm font-semibold text-foreground block">Multiple Depot Branches</span>
                    <span className="text-xs text-muted-foreground">Enable multi-location depot operations and decentralized stock management.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editMultipleBranches}
                    onChange={(e) => setEditMultipleBranches(e.target.checked)}
                    className="h-5 w-5 rounded-md border-border text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                </label>
                <label className="flex items-center justify-between p-3.5 rounded-2xl border border-border bg-secondary/30 hover:bg-secondary/50 cursor-pointer transition-colors">
                  <div className="pr-4">
                    <span className="text-sm font-semibold text-foreground block">Advanced Sales Ledger Analytics & AI Reports</span>
                    <span className="text-xs text-muted-foreground">Unlock executive financial reports, cashier audits, and AI receipt scanning.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={editAdvancedReports}
                    onChange={(e) => setEditAdvancedReports(e.target.checked)}
                    className="h-5 w-5 rounded-md border-border text-emerald-600 focus:ring-emerald-500 accent-emerald-600"
                  />
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 flex flex-row items-center justify-end gap-3 border-t border-border/60">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfigOpen(false)}
                className="rounded-xl text-xs font-semibold h-11 px-6 border-border hover:bg-secondary"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePlanMutation.isPending}
                className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold h-11 px-7 shadow-md shadow-emerald-500/20"
              >
                {updatePlanMutation.isPending ? 'Saving...' : 'Apply Configuration'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
