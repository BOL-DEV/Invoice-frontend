'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  useTenantDetails,
  useUpdateTenantStatus,
  useUpdateTenantPlan,
} from '../../../../../features/admin/hooks/useTenants';
import { usePermission } from '../../../../../features/auth/hooks/usePermission';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../../../components/ui/card';
import { Button } from '../../../../../components/ui/button';
import { Badge } from '../../../../../components/ui/badge';
import { Skeleton } from '../../../../../components/ui/skeleton';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../../components/ui/dialog';
import { Label } from '../../../../../components/ui/label';
import { Input } from '../../../../../components/ui/input';
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
  RotateCcw,
  RefreshCw,
  Mail,
  Phone,
  MapPin,
  Calendar,
  Lock,
  Eye,
  Check,
  Search,
  ExternalLink,
  Activity,
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

  // Active Tab
  const [activeTab, setActiveTab] = useState<'users' | 'invoices' | 'settings' | 'logs'>('users');
  const [userSearch, setUserSearch] = useState('');
  const [invoiceSearch, setInvoiceSearch] = useState('');

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

  const handleSwitchWorkspace = () => {
    if (!tenantData) return;
    localStorage.setItem('active_business_id', tenantData.business.id);
    modal.alert(
      'Scoped to Workspace',
      `Your Super Admin session is now scoped to ${tenantData.business.businessName}. You can inspect their live ledger or return to platform root anytime.`,
      'success'
    );
    router.push('/');
  };

  const formatCurrency = (amount: number) => {
    return `₦${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isAuthLoading || isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="flex items-center space-x-3">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-6 w-48 rounded-lg" />
        </div>
        <div className="p-8 rounded-2xl bg-card border border-border space-y-4">
          <Skeleton className="h-10 w-72 rounded-xl" />
          <Skeleton className="h-4 w-96 rounded-lg" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-28 rounded-2xl" />
          ))}
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
  const staffUsagePercent = Math.min(100, Math.round((users.length / maxStaff) * 100));

  const filteredUsers = users.filter(
    (u) =>
      u.email.toLowerCase().includes(userSearch.toLowerCase()) ||
      `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase())
  );

  const filteredInvoices = recentInvoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(invoiceSearch.toLowerCase()) ||
      inv.customerName.toLowerCase().includes(invoiceSearch.toLowerCase())
  );

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
            onClick={handleSwitchWorkspace}
            variant="outline"
            size="sm"
            className="h-9 rounded-xl text-xs bg-secondary/50 hover:bg-secondary border-border flex items-center space-x-1.5"
          >
            <ExternalLink className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Enter Workspace</span>
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

            <p className="text-xs text-muted-foreground">
              {business.tagline || 'Commercial Billing & Invoicing Organization Workspace'}
            </p>

            <div className="flex items-center space-x-4 pt-1 text-[11px] text-muted-foreground flex-wrap gap-y-1 font-mono">
              <span className="flex items-center">
                <Globe className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                {business.slug}.invoice.bolxolve.com
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Mail className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                {business.email}
              </span>
              <span>•</span>
              <span className="flex items-center">
                <Calendar className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
                Joined {new Date(business.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>

        {/* Custom Domains pill */}
        {domains && domains.length > 0 && (
          <div className="p-3 rounded-xl bg-secondary/30 border border-border/80 text-xs space-y-1 self-stretch md:self-auto min-w-[200px]">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
              Configured Custom Domains
            </p>
            <div className="space-y-1">
              {domains.map((d) => (
                <div key={d.id} className="flex items-center justify-between text-xs font-mono text-emerald-600 dark:text-emerald-400">
                  <span>{d.domain}</span>
                  {d.isPrimary && <Badge className="text-[9px] bg-emerald-500/20 text-emerald-600">Primary</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ========================================================= */}
      {/* KPI METRIC CARDS                                          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Staff Quota Usage */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Staff Accounts
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3 flex items-baseline justify-between">
              <span className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
                {users.length}
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                / {maxStaff} max quota
              </span>
            </div>
            <div className="mt-2.5 w-full h-1.5 rounded-full bg-secondary overflow-hidden">
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
          </CardContent>
        </Card>

        {/* Card 2: Invoiced Volume */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Invoiced Volume
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold tracking-tight font-heading text-foreground truncate block">
                {formatCurrency(stats.totalInvoiceVolume)}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              Cumulative gross invoiced value
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Invoices Count */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Invoices Generated
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
                {stats.invoiceCount}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              Next invoice #{business.receiptPrefix}-{business.nextInvoiceNumber}
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Customers Count & Tax Setup */}
        <Card className="rounded-2xl border-border bg-card shadow-sm">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Ledger Customers
              </span>
              <div className="h-9 w-9 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
                {stats.customerCount}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              VAT {business.defaultVatPercentage}% • WHT {business.defaultWhtPercentage}%
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* TABBED DRILL-DOWN VIEWS                                   */}
      {/* ========================================================= */}
      <div className="space-y-4">
        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-border/80 pb-2">
          <Button
            variant={activeTab === 'users' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('users')}
            className={`rounded-xl text-xs font-semibold h-9 ${
              activeTab === 'users' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-muted-foreground'
            }`}
          >
            <Users className="h-4 w-4 mr-1.5" />
            <span>Staff & Cashiers ({users.length})</span>
          </Button>

          <Button
            variant={activeTab === 'invoices' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('invoices')}
            className={`rounded-xl text-xs font-semibold h-9 ${
              activeTab === 'invoices' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-muted-foreground'
            }`}
          >
            <FileText className="h-4 w-4 mr-1.5" />
            <span>Recent Invoices ({stats.invoiceCount})</span>
          </Button>

          <Button
            variant={activeTab === 'settings' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('settings')}
            className={`rounded-xl text-xs font-semibold h-9 ${
              activeTab === 'settings' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-muted-foreground'
            }`}
          >
            <Building2 className="h-4 w-4 mr-1.5" />
            <span>Workspace Profile & Settings</span>
          </Button>

          <Button
            variant={activeTab === 'logs' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setActiveTab('logs')}
            className={`rounded-xl text-xs font-semibold h-9 ${
              activeTab === 'logs' ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'text-muted-foreground'
            }`}
          >
            <Activity className="h-4 w-4 mr-1.5" />
            <span>Tenant Audit Trail ({recentLogs.length})</span>
          </Button>
        </div>

        {/* TAB 1: USERS / CASHIERS */}
        {activeTab === 'users' && (
          <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            <CardHeader className="bg-secondary/20 border-b border-border py-4 px-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
                <div>
                  <CardTitle className="text-base font-bold text-foreground">
                    Staff & Cashier Roster
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Personnel authorized to log into this organization's terminal and issue invoices.
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
                      <th className="py-3 px-6">Staff Member</th>
                      <th className="py-3 px-4">Role</th>
                      <th className="py-3 px-4 text-center">Account Status</th>
                      <th className="py-3 px-6 text-right">Registration Date</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredUsers.length === 0 ? (
                      <tr>
                        <td colSpan={4} className="py-8 text-center text-muted-foreground">
                          No staff accounts found.
                        </td>
                      </tr>
                    ) : (
                      filteredUsers.map((u) => (
                        <tr key={u.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-6">
                            <div className="flex items-center space-x-3">
                              <div className="h-8 w-8 rounded-full bg-secondary flex items-center justify-center font-bold text-foreground shrink-0">
                                {u.firstName.charAt(0)}
                              </div>
                              <div>
                                <p className="font-bold text-foreground">
                                  {u.firstName} {u.lastName}
                                </p>
                                <p className="text-[11px] text-muted-foreground font-mono">{u.email}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-3 px-4">
                            <Badge
                              variant="outline"
                              className={
                                u.role === 'ADMIN'
                                  ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]'
                                  : 'border-border text-foreground text-[10px]'
                              }
                            >
                              {u.role === 'ADMIN' ? 'Administrator' : 'Cashier / Apprentice'}
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
                          <td className="py-3 px-6 text-right font-mono text-muted-foreground text-[11px]">
                            {new Date(u.createdAt).toLocaleDateString()}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
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
                    Latest invoices issued by this organization across all cashier desks.
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
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {filteredInvoices.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="py-8 text-center text-muted-foreground">
                          No invoices found for this organization.
                        </td>
                      </tr>
                    ) : (
                      filteredInvoices.map((inv) => (
                        <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                          <td className="py-3 px-6 font-mono font-bold text-emerald-600 dark:text-emerald-400">
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
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {/* TAB 3: SETTINGS & DOMAINS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="rounded-2xl border-border bg-card shadow-sm">
              <CardHeader className="py-4 px-6 border-b border-border">
                <CardTitle className="text-sm font-bold text-foreground flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-emerald-500" />
                  <span>Depot Contact & Legal Info</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs">
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
              <CardHeader className="py-4 px-6 border-b border-border">
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
                    <p className="text-xs text-muted-foreground">Default subdomain only: {business.slug}.invoice.bolxolve.com</p>
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
                  recentLogs.map((log) => (
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
            </CardContent>
          </Card>
        )}
      </div>

      {/* ========================================================= */}
      {/* PLAN CONFIGURATION MODAL                                  */}
      {/* ========================================================= */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="max-w-lg rounded-2xl bg-card border-border">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-foreground">
              Configure Plan & Features for {business.businessName}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              Select tier, adjust cashier account quotas, or toggle enterprise capabilities.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveConfig} className="space-y-4 pt-2">
            {configError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs">
                {configError}
              </div>
            )}

            {/* Plan Tier selection */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Subscription Plan Tier</Label>
              <div className="grid grid-cols-3 gap-2">
                {(['STARTER', 'BUSINESS', 'ENTERPRISE'] as PlanType[]).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => handlePlanSelect(p)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      editPlan === p
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    <div className="text-xs font-bold">{p}</div>
                    <div className="text-[10px] mt-0.5 opacity-80">
                      {p === 'STARTER' ? '2 Staff' : p === 'BUSINESS' ? '4 Staff' : 'Custom'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Billing Mode */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Billing Mode</Label>
              <div className="grid grid-cols-2 gap-2">
                {(['SUBSCRIPTION', 'COMPLIMENTARY'] as BillingMode[]).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setEditBillingMode(m)}
                    className={`p-2.5 rounded-xl border text-center text-xs font-semibold transition-all ${
                      editBillingMode === m
                        ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold'
                        : 'border-border bg-card text-muted-foreground hover:bg-secondary'
                    }`}
                  >
                    {m === 'SUBSCRIPTION' ? 'Paid SaaS Subscription' : 'Complimentary Partner'}
                  </button>
                ))}
              </div>
            </div>

            {/* Max Staff Quota */}
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">Max Staff / Cashier Quota</Label>
              <Input
                type="number"
                min="1"
                max="100"
                value={editStaffQuota}
                onChange={(e) => setEditStaffQuota(parseInt(e.target.value) || 1)}
                className="bg-background h-10 rounded-xl"
              />
              <p className="text-[10px] text-muted-foreground">
                Currently using {users.length} of {editStaffQuota} accounts.
              </p>
            </div>

            {/* Enterprise Feature Toggles */}
            <div className="space-y-2 pt-2 border-t border-border">
              <Label className="text-xs font-semibold">Modular Capabilities</Label>
              <div className="space-y-2">
                <label className="flex items-center space-x-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editCustomDomain}
                    onChange={(e) => setEditCustomDomain(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Custom Enterprise Domain Routing</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editMultipleBranches}
                    onChange={(e) => setEditMultipleBranches(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Multiple Depot Branches</span>
                </label>
                <label className="flex items-center space-x-2.5 text-xs text-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={editAdvancedReports}
                    onChange={(e) => setEditAdvancedReports(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Advanced Sales Ledger Analytics & AI Reports</span>
                </label>
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border gap-2">
              <Button type="button" variant="outline" onClick={() => setIsConfigOpen(false)} className="rounded-xl">
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePlanMutation.isPending}
                className="rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold"
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
