'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  useTenantsList,
  useOnboardTenant,
  useUpdateTenantStatus,
  useUpdateTenantPlan,
} from '../../../../features/admin/hooks/useTenants';
import { usePermission } from '../../../../features/auth/hooks/usePermission';
import { TenantSummary, PlanType, BillingMode, OnboardingStatus } from '../../../../types/api';
import { Button } from '../../../../components/ui/button';
import { Card } from '../../../../components/ui/card';
import { Badge } from '../../../../components/ui/badge';
import { Input } from '../../../../components/ui/input';
import { Label } from '../../../../components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../../components/ui/dialog';
import { Skeleton } from '../../../../components/ui/skeleton';
import { useModal } from '../../../../components/ui/modal-provider';
import { Pagination } from '../../../../components/ui/pagination';
import { getErrorMessage } from '../../../../lib/api-error';
import {
  Building2,
  Plus,
  Search,
  Users,
  CreditCard,
  Globe,
  Sliders,
  Sparkles,
  BarChart3,
  Layers,
  ArrowRight,
  ShieldAlert,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Eye,
  Check,
} from 'lucide-react';

export default function TenantsAdminPage() {
  const router = useRouter();
  const { isSuperAdmin, isLoading: isAuthLoading } = usePermission();
  const modal = useModal();

  // Queries & Mutations
  const { data: tenants, isLoading, isError } = useTenantsList();
  const onboardMutation = useOnboardTenant();
  const updateStatusMutation = useUpdateTenantStatus();
  const updatePlanMutation = useUpdateTenantPlan();

  // Local state
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<'ALL' | 'STARTER' | 'BUSINESS' | 'ENTERPRISE' | 'SUBSCRIPTION' | 'COMPLIMENTARY' | 'SUSPENDED'>('ALL');
  const [isOnboardOpen, setIsOnboardOpen] = useState(false);
  const [selectedTenant, setSelectedTenant] = useState<TenantSummary | null>(null);
  const [isConfigOpen, setIsConfigOpen] = useState(false);

  // Pagination state
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filterCategory]);

  // Onboarding Form State
  const [newBizName, setNewBizName] = useState('');
  const [newBizSlug, setNewBizSlug] = useState('');
  const [newBizAddress, setNewBizAddress] = useState('');
  const [newBizPhone, setNewBizPhone] = useState('');
  const [newBizEmail, setNewBizEmail] = useState('');
  const [newBizReceiptPrefix, setNewBizReceiptPrefix] = useState('INV');
  const [newBizTagline, setNewBizTagline] = useState('');
  const [newBizPlan, setNewBizPlan] = useState<PlanType>('STARTER');
  const [newBizBillingMode, setNewBizBillingMode] = useState<BillingMode>('SUBSCRIPTION');
  const [newBizStaffQuota, setNewBizStaffQuota] = useState(2);
  const [newBizCustomDomain, setNewBizCustomDomain] = useState(false);
  const [newBizMultipleBranches, setNewBizMultipleBranches] = useState(false);
  const [newBizAdvancedReports, setNewBizAdvancedReports] = useState(false);
  const [newAdminFirstName, setNewAdminFirstName] = useState('');
  const [newAdminLastName, setNewAdminLastName] = useState('');
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [newAdminPassword, setNewAdminPassword] = useState('');
  const [onboardError, setOnboardError] = useState<string | null>(null);

  // Edit / Config State
  const [editPlan, setEditPlan] = useState<PlanType>('STARTER');
  const [editBillingMode, setEditBillingMode] = useState<BillingMode>('SUBSCRIPTION');
  const [editStaffQuota, setEditStaffQuota] = useState(2);
  const [editCustomDomain, setEditCustomDomain] = useState(false);
  const [editMultipleBranches, setEditMultipleBranches] = useState(false);
  const [editAdvancedReports, setEditAdvancedReports] = useState(false);
  const [configError, setConfigError] = useState<string | null>(null);

  const resetOnboardForm = () => {
    setNewBizName('');
    setNewBizSlug('');
    setNewBizAddress('');
    setNewBizPhone('');
    setNewBizEmail('');
    setNewBizReceiptPrefix('INV');
    setNewBizTagline('');
    setNewBizPlan('STARTER');
    setNewBizBillingMode('SUBSCRIPTION');
    setNewBizStaffQuota(2);
    setNewBizCustomDomain(false);
    setNewBizMultipleBranches(false);
    setNewBizAdvancedReports(false);
    setNewAdminFirstName('');
    setNewAdminLastName('');
    setNewAdminEmail('');
    setNewAdminPassword('');
    setOnboardError(null);
  };

  const openConfigModal = (tenant: TenantSummary) => {
    setSelectedTenant(tenant);
    setEditPlan(tenant.subscription?.plan || 'STARTER');
    setEditBillingMode(tenant.subscription?.billingMode || 'SUBSCRIPTION');
    setEditStaffQuota(tenant.subscription?.maxStaffCount || 2);
    setEditCustomDomain(Boolean(tenant.subscription?.hasCustomDomain));
    setEditMultipleBranches(Boolean(tenant.subscription?.hasMultipleBranches));
    setEditAdvancedReports(Boolean(tenant.subscription?.hasAdvancedReports));
    setConfigError(null);
    setIsConfigOpen(true);
  };

  const handlePlanChangeInForm = (plan: PlanType) => {
    setNewBizPlan(plan);
    if (plan === 'STARTER') {
      setNewBizStaffQuota(2);
      setNewBizCustomDomain(false);
      setNewBizMultipleBranches(false);
      setNewBizAdvancedReports(false);
    } else if (plan === 'BUSINESS') {
      setNewBizStaffQuota(4);
      setNewBizCustomDomain(false);
      setNewBizMultipleBranches(false);
      setNewBizAdvancedReports(false);
    } else if (plan === 'ENTERPRISE') {
      setNewBizStaffQuota(10);
      setNewBizCustomDomain(true);
      setNewBizAdvancedReports(true);
    }
  };

  const handleEditPlanChange = (plan: PlanType) => {
    setEditPlan(plan);
    if (plan === 'STARTER') {
      setEditStaffQuota(2);
      setEditCustomDomain(false);
      setEditMultipleBranches(false);
      setEditAdvancedReports(false);
    } else if (plan === 'BUSINESS') {
      setEditStaffQuota(4);
      setEditCustomDomain(false);
      setEditMultipleBranches(false);
      setEditAdvancedReports(false);
    } else if (plan === 'ENTERPRISE') {
      if (editStaffQuota < 5) setEditStaffQuota(10);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOnboardError(null);

    if (!newBizName || !newBizSlug || !newBizEmail || !newAdminEmail || !newAdminPassword) {
      setOnboardError('Please fill in all required fields.');
      return;
    }

    try {
      await onboardMutation.mutateAsync({
        businessName: newBizName,
        slug: newBizSlug.toLowerCase().trim(),
        address: newBizAddress || 'Corporate Headquarters',
        phone: newBizPhone || '+234 800 000 0000',
        email: newBizEmail,
        receiptPrefix: newBizReceiptPrefix || 'INV',
        tagline: newBizTagline || undefined,
        plan: newBizPlan,
        billingMode: newBizBillingMode,
        maxStaffCount: Number(newBizStaffQuota),
        hasCustomDomain: newBizCustomDomain,
        hasMultipleBranches: newBizMultipleBranches,
        hasAdvancedReports: newBizAdvancedReports,
        adminFirstName: newAdminFirstName,
        adminLastName: newAdminLastName,
        adminEmail: newAdminEmail,
        adminPassword: newAdminPassword,
      });

      setIsOnboardOpen(false);
      resetOnboardForm();
      await modal.alert(
        'Business Workspace Onboarded',
        `Tenant "${newBizName}" was initialized with plan ${newBizPlan}. Administrator login credentials are ready.`,
        'success'
      );
    } catch (err: any) {
      setOnboardError(getErrorMessage(err));
    }
  };

  const handleConfigSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTenant) return;
    setConfigError(null);

    try {
      await updatePlanMutation.mutateAsync({
        businessId: selectedTenant.id,
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
      await modal.alert(
        'Subscription & Toggles Updated',
        `Configuration for "${selectedTenant.businessName}" updated successfully.`,
        'success'
      );
    } catch (err: any) {
      setConfigError(getErrorMessage(err));
    }
  };



  const handleToggleStatus = async (tenant: TenantSummary) => {
    const isCurrentlyActive = tenant.onboardingStatus === 'ACTIVE';
    const nextStatus: OnboardingStatus = isCurrentlyActive ? 'SUSPENDED' : 'ACTIVE';

    const confirmed = await modal.confirm(
      isCurrentlyActive ? `Suspend Tenant "${tenant.businessName}"?` : `Reactivate Tenant "${tenant.businessName}"?`,
      isCurrentlyActive
        ? 'Suspending this business will immediately block staff and cashiers from issuing invoices until reactivated.'
        : 'Reactivating this business will restore full access for all associated cashiers.',
      isCurrentlyActive ? 'Suspend Tenant' : 'Reactivate'
    );

    if (confirmed) {
      try {
        await updateStatusMutation.mutateAsync({
          id: tenant.id,
          onboardingStatus: nextStatus,
        });
        await modal.alert(
          'Tenant Status Changed',
          `"${tenant.businessName}" is now ${nextStatus}.`,
          'success'
        );
      } catch (err: any) {
        await modal.alert(
          'Update Failed',
          getErrorMessage(err),
          'error'
        );
      }
    }
  };

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-20">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isSuperAdmin) {
    return (
      <div className="max-w-md mx-auto mt-16 p-8 bg-card border border-border rounded-2xl text-center space-y-4 shadow-sm">
        <div className="p-3 bg-amber-500/10 text-amber-500 rounded-2xl w-fit mx-auto">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold font-heading text-foreground">Super Admin Access Only</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          You do not have platform owner privileges to view and configure multi-tenant business subscriptions. Please contact the BOLXolve system administrator.
        </p>
      </div>
    );
  }

  // Filter tenants
  const filteredTenants = tenants?.filter((t) => {
    const q = searchTerm.toLowerCase();
    const matchesQuery = (
      t.businessName.toLowerCase().includes(q) ||
      (t.slug && t.slug.toLowerCase().includes(q)) ||
      t.email.toLowerCase().includes(q)
    );
    if (!matchesQuery) return false;

    if (filterCategory === 'STARTER') return (t.subscription?.plan || 'STARTER') === 'STARTER';
    if (filterCategory === 'BUSINESS') return t.subscription?.plan === 'BUSINESS';
    if (filterCategory === 'ENTERPRISE') return t.subscription?.plan === 'ENTERPRISE';
    if (filterCategory === 'SUBSCRIPTION') return (t.subscription?.billingMode || 'SUBSCRIPTION') === 'SUBSCRIPTION';
    if (filterCategory === 'COMPLIMENTARY') return t.subscription?.billingMode === 'COMPLIMENTARY';
    if (filterCategory === 'SUSPENDED') return t.onboardingStatus === 'SUSPENDED';

    return true;
  }) || [];

  // Metrics
  const totalTenants = tenants?.length || 0;
  const activeSubs = tenants?.filter((t) => t.onboardingStatus === 'ACTIVE').length || 0;
  const suspendedCount = tenants?.filter((t) => t.onboardingStatus === 'SUSPENDED').length || 0;
  const starterCount = tenants?.filter((t) => (t.subscription?.plan || 'STARTER') === 'STARTER').length || 0;
  const businessCount = tenants?.filter((t) => t.subscription?.plan === 'BUSINESS').length || 0;
  const enterpriseCount = tenants?.filter((t) => t.subscription?.plan === 'ENTERPRISE').length || 0;
  const subscriptionCount = tenants?.filter((t) => (t.subscription?.billingMode || 'SUBSCRIPTION') === 'SUBSCRIPTION').length || 0;
  const complimentaryCount = tenants?.filter((t) => t.subscription?.billingMode === 'COMPLIMENTARY').length || 0;
  const totalInvoices = tenants?.reduce((acc, t) => acc + (t.stats?.invoiceCount || 0), 0) || 0;

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
              <Building2 className="h-5 w-5" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight font-heading text-foreground">
              Tenants & Multi-Tenant SaaS
            </h1>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Manage all onboarded business workspaces across BOLXolve Invoice. Configure subscription tiers, modular features, staff limits, and domain registrations.
          </p>
        </div>
        <Link href="/admin/onboard">
          <Button
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-500/20 text-xs font-semibold h-10 px-4"
          >
            <Plus className="h-4 w-4 mr-1.5" />
            Onboard New Business
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-5 border-border bg-card shadow-sm rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-500">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Workspaces</p>
            <h3 className="text-2xl font-bold font-heading text-foreground mt-0.5">{totalTenants}</h3>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-500">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Active Tenants</p>
            <h3 className="text-2xl font-bold font-heading text-foreground mt-0.5">{activeSubs}</h3>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-purple-500/10 text-purple-500">
            <Sparkles className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Enterprise Clients</p>
            <h3 className="text-2xl font-bold font-heading text-foreground mt-0.5">{enterpriseCount}</h3>
          </div>
        </Card>

        <Card className="p-5 border-border bg-card shadow-sm rounded-2xl flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-500">
            <BarChart3 className="h-6 w-6" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground font-medium">Total Invoices Issued</p>
            <h3 className="text-2xl font-bold font-heading text-foreground mt-0.5">{totalInvoices}</h3>
          </div>
        </Card>
      </div>

      {/* Tenants Table Container */}
      <Card className="border-border bg-card shadow-sm rounded-2xl overflow-hidden">
        {/* Search & Filter Bar */}
        <div className="p-5 border-b border-border space-y-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search business name, slug, or email..."
                className="pl-9 h-10 rounded-xl text-xs bg-secondary/50 border-border"
              />
            </div>
            <span className="text-xs text-muted-foreground font-mono">
              Showing {filteredTenants.length} of {totalTenants}
            </span>
          </div>

          {/* Filter Pills */}
          <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 text-xs">
            <button
              type="button"
              onClick={() => setFilterCategory('ALL')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCategory === 'ALL'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              All ({totalTenants})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('STARTER')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCategory === 'STARTER'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Starter ({starterCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('BUSINESS')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCategory === 'BUSINESS'
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Business Tier ({businessCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('ENTERPRISE')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCategory === 'ENTERPRISE'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Enterprise ({enterpriseCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('SUBSCRIPTION')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCategory === 'SUBSCRIPTION'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Subscription ({subscriptionCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('COMPLIMENTARY')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCategory === 'COMPLIMENTARY'
                  ? 'bg-amber-600 text-white shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Complimentary ({complimentaryCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterCategory('SUSPENDED')}
              className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                filterCategory === 'SUSPENDED'
                  ? 'bg-rose-600 text-white shadow-sm'
                  : 'bg-secondary/40 text-muted-foreground hover:bg-secondary hover:text-foreground'
              }`}
            >
              Suspended ({suspendedCount})
            </button>
          </div>
        </div>

        {/* Table Content */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-secondary/40 border-b border-border text-muted-foreground font-semibold uppercase text-[11px] tracking-wider">
              <tr>
                <th className="px-6 py-3.5">Business & Workspace</th>
                <th className="px-6 py-3.5">Subscription Plan</th>
                <th className="px-6 py-3.5">Staff Usage</th>
                <th className="px-6 py-3.5">Capabilities</th>
                <th className="px-6 py-3.5">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><Skeleton className="h-4 w-36 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-24 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-20 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-32 rounded" /></td>
                    <td className="px-6 py-4"><Skeleton className="h-4 w-16 rounded" /></td>
                  </tr>
                ))
              ) : filteredTenants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-muted-foreground">
                    No business tenants found matching your search.
                  </td>
                </tr>
              ) : (
                filteredTenants.slice((page - 1) * pageSize, page * pageSize).map((t) => {
                  const plan = t.subscription?.plan || 'STARTER';
                  const isEnterprise = plan === 'ENTERPRISE';
                  const isBusiness = plan === 'BUSINESS';
                  const isComplimentary = t.subscription?.billingMode === 'COMPLIMENTARY';
                  const userCount = t.stats?.userCount || 0;
                  const maxStaff = t.subscription?.maxStaffCount || 2;
                  const usagePercent = Math.min(100, Math.round((userCount / maxStaff) * 100));

                  return (
                    <tr
                      key={t.id}
                      onClick={() => router.push(`/admin/tenants/${t.id}`)}
                      className="hover:bg-secondary/30 transition-colors cursor-pointer group"
                    >
                      {/* Business & Workspace */}
                      <td className="px-6 py-4">
                        <div className="font-semibold text-foreground text-sm flex items-center space-x-2 group-hover:text-emerald-500 transition-colors">
                          <span>{t.businessName}</span>
                          <ArrowRight className="h-3.5 w-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all text-emerald-500" />
                        </div>
                        <div className="flex items-center space-x-2 mt-1 font-mono text-[11px] text-muted-foreground">
                          <span className="px-1.5 py-0.5 rounded bg-secondary border border-border">
                            {t.slug || 'no-slug'}
                          </span>
                          <span>•</span>
                          <span>{t.email}</span>
                        </div>
                      </td>

                      {/* Subscription Plan & Mode */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <Badge
                            className={`text-xs font-semibold ${
                              isEnterprise
                                ? 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30'
                                : isBusiness
                                ? 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/30'
                                : 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/30'
                            }`}
                          >
                            {plan}
                          </Badge>
                          {isComplimentary ? (
                            <Badge variant="outline" className="text-[10px] bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20">
                              Complimentary
                            </Badge>
                          ) : (
                            <span className="text-[11px] text-muted-foreground font-mono">Paid</span>
                          )}
                        </div>
                      </td>

                      {/* Staff Quota */}
                      <td className="px-6 py-4">
                        <div className="space-y-1 max-w-[140px]">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span>{userCount} staff</span>
                            <span className="text-muted-foreground">limit {maxStaff}</span>
                          </div>
                          <div className="w-full h-1.5 rounded-full bg-secondary overflow-hidden">
                            <div
                              className={`h-full rounded-full transition-all ${
                                usagePercent >= 100
                                  ? 'bg-rose-500'
                                  : usagePercent >= 75
                                  ? 'bg-amber-500'
                                  : 'bg-emerald-500'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </div>
                      </td>

                      {/* Capabilities */}
                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-2">
                          <span
                            title={t.subscription?.hasCustomDomain ? 'Custom Domain Enabled' : 'No Custom Domain'}
                            className={`p-1 rounded ${
                              t.subscription?.hasCustomDomain
                                ? 'bg-emerald-500/10 text-emerald-500'
                                : 'bg-secondary text-muted-foreground/40'
                            }`}
                          >
                            <Globe className="h-3.5 w-3.5" />
                          </span>

                          <span
                            title={plan !== 'STARTER' ? 'AI Extraction Scanner Included' : 'No AI Extraction'}
                            className={`p-1 rounded ${
                              plan !== 'STARTER'
                                ? 'bg-purple-500/10 text-purple-500'
                                : 'bg-secondary text-muted-foreground/40'
                            }`}
                          >
                            <Sparkles className="h-3.5 w-3.5" />
                          </span>

                          <span
                            title={t.subscription?.hasMultipleBranches ? 'Multiple Branches Enabled' : 'Single Branch'}
                            className={`p-1 rounded ${
                              t.subscription?.hasMultipleBranches
                                ? 'bg-blue-500/10 text-blue-500'
                                : 'bg-secondary text-muted-foreground/40'
                            }`}
                          >
                            <Layers className="h-3.5 w-3.5" />
                          </span>

                          <span
                            title={t.subscription?.hasAdvancedReports ? 'Advanced Analytics Included' : 'Standard Analytics'}
                            className={`p-1 rounded ${
                              t.subscription?.hasAdvancedReports
                                ? 'bg-amber-500/10 text-amber-500'
                                : 'bg-secondary text-muted-foreground/40'
                            }`}
                          >
                            <BarChart3 className="h-3.5 w-3.5" />
                          </span>
                        </div>
                      </td>

                      {/* Onboarding Status */}
                      <td className="px-6 py-4">
                        <Badge
                          variant="outline"
                          className={`text-xs ${
                            t.onboardingStatus === 'ACTIVE'
                              ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
                              : t.onboardingStatus === 'SUSPENDED'
                              ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                              : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                          }`}
                        >
                          {t.onboardingStatus}
                        </Badge>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Controls */}
        <div className="p-4 border-t border-border">
          <Pagination
            currentPage={page}
            totalPages={Math.ceil(filteredTenants.length / pageSize) || 1}
            onPageChange={setPage}
            totalItems={filteredTenants.length}
            itemsPerPage={pageSize}
            itemName="businesses"
          />
        </div>
      </Card>

      {/* ========================================================= */}
      {/* ONBOARD NEW TENANT MODAL                                  */}
      {/* ========================================================= */}
      <Dialog open={isOnboardOpen} onOpenChange={setIsOnboardOpen}>
        <DialogContent className="sm:max-w-3xl md:max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl p-6 sm:p-8 bg-card border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold font-heading flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-emerald-500" />
              <span>Onboard New Business Workspace</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Create an isolated tenant workspace with a tailored subscription plan, modular capabilities, and primary administrator account.
            </DialogDescription>
          </DialogHeader>

          {onboardError && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs">
              {onboardError}
            </div>
          )}

          <form onSubmit={handleOnboardSubmit} className="space-y-6">
            {/* Section 1: Business Profile */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                1. Business Identity
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Business Name *</Label>
                  <Input
                    required
                    value={newBizName}
                    onChange={(e) => {
                      setNewBizName(e.target.value);
                      if (!newBizSlug) {
                        setNewBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-'));
                      }
                    }}
                    placeholder="e.g. Apex Global Logistics"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Workspace Slug * (subdomain identifier)</Label>
                  <Input
                    required
                    value={newBizSlug}
                    onChange={(e) => setNewBizSlug(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="e.g. apex-logistics"
                    className="h-9 text-xs font-mono rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Official Email *</Label>
                  <Input
                    type="email"
                    required
                    value={newBizEmail}
                    onChange={(e) => setNewBizEmail(e.target.value)}
                    placeholder="billing@apex.com"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Official Phone *</Label>
                  <Input
                    required
                    value={newBizPhone}
                    onChange={(e) => setNewBizPhone(e.target.value)}
                    placeholder="080 000 0000"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Receipt Prefix</Label>
                  <Input
                    value={newBizReceiptPrefix}
                    onChange={(e) => setNewBizReceiptPrefix(e.target.value.toUpperCase())}
                    placeholder="APX"
                    maxLength={10}
                    className="h-9 text-xs font-mono uppercase rounded-xl"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Business Address *</Label>
                <Input
                  required
                  value={newBizAddress}
                  onChange={(e) => setNewBizAddress(e.target.value)}
                  placeholder="Street Address, City, State"
                  className="h-9 text-xs rounded-xl"
                />
              </div>
            </div>

            {/* Section 2: Subscription Plan & Capabilities */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                2. Subscription Tier & Quotas
              </h4>

              <div className="grid grid-cols-3 gap-2.5">
                {(['STARTER', 'BUSINESS', 'ENTERPRISE'] as PlanType[]).map((plan) => (
                  <button
                    key={plan}
                    type="button"
                    onClick={() => handlePlanChangeInForm(plan)}
                    className={`p-3 rounded-xl border text-left transition-all ${
                      newBizPlan === plan
                        ? 'border-emerald-500 bg-emerald-500/10 shadow-sm'
                        : 'border-border bg-secondary/30 hover:bg-secondary/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-xs text-foreground">{plan}</span>
                      {newBizPlan === plan && <Check className="h-3.5 w-3.5 text-emerald-500" />}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-1">
                      {plan === 'STARTER'
                        ? 'Max 2 staff, standard analytics, manual entry'
                        : plan === 'BUSINESS'
                        ? 'Max 4 staff, AI vision included'
                        : 'Custom quota (>4), modular toggles'}
                    </p>
                  </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div className="space-y-1.5">
                  <Label className="text-xs">Billing Mode</Label>
                  <select
                    value={newBizBillingMode}
                    onChange={(e) => setNewBizBillingMode(e.target.value as BillingMode)}
                    className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs"
                  >
                    <option value="SUBSCRIPTION">Standard Subscription (Paid / Automated)</option>
                    <option value="COMPLIMENTARY">Complimentary Access (Zero Fees / Partnership)</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs">Max Staff Quota (Cashier seats)</Label>
                  <Input
                    type="number"
                    min={1}
                    max={500}
                    disabled={newBizPlan === 'STARTER' || newBizPlan === 'BUSINESS'}
                    value={newBizStaffQuota}
                    onChange={(e) => setNewBizStaffQuota(Number(e.target.value))}
                    className="h-9 text-xs font-mono rounded-xl"
                  />
                  {(newBizPlan === 'STARTER' || newBizPlan === 'BUSINESS') && (
                    <p className="text-[10px] text-muted-foreground">Fixed quota enforced by selected plan.</p>
                  )}
                </div>
              </div>

              {/* Modular Enterprise Toggles */}
              {newBizPlan === 'ENTERPRISE' && (
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 space-y-2">
                  <span className="text-xs font-semibold text-purple-700 dark:text-purple-300">
                    Enterprise Modular Capabilities:
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 pt-1 text-xs">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBizCustomDomain}
                        onChange={(e) => setNewBizCustomDomain(e.target.checked)}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Custom Domain</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBizMultipleBranches}
                        onChange={(e) => setNewBizMultipleBranches(e.target.checked)}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Multi-Branch</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newBizAdvancedReports}
                        onChange={(e) => setNewBizAdvancedReports(e.target.checked)}
                        className="rounded text-emerald-500 focus:ring-emerald-500"
                      />
                      <span>Advanced Reports</span>
                    </label>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Primary Admin Account */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b border-border pb-1">
                3. Primary Tenant Administrator
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">First Name *</Label>
                  <Input
                    required
                    value={newAdminFirstName}
                    onChange={(e) => setNewAdminFirstName(e.target.value)}
                    placeholder="e.g. John"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Last Name *</Label>
                  <Input
                    required
                    value={newAdminLastName}
                    onChange={(e) => setNewAdminLastName(e.target.value)}
                    placeholder="e.g. Doe"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Admin Login Email *</Label>
                  <Input
                    type="email"
                    required
                    value={newAdminEmail}
                    onChange={(e) => setNewAdminEmail(e.target.value)}
                    placeholder="admin@tenant.com"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Admin Initial Password *</Label>
                  <Input
                    type="password"
                    required
                    minLength={6}
                    value={newAdminPassword}
                    onChange={(e) => setNewAdminPassword(e.target.value)}
                    placeholder="••••••••"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsOnboardOpen(false)}
                className="h-9 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={onboardMutation.isPending}
                className="h-9 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {onboardMutation.isPending ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                    Initializing Workspace...
                  </>
                ) : (
                  'Complete Onboarding'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ========================================================= */}
      {/* CONFIGURE TENANT PLAN & ENTERPRISE TOGGLES MODAL           */}
      {/* ========================================================= */}
      <Dialog open={isConfigOpen} onOpenChange={setIsConfigOpen}>
        <DialogContent className="sm:max-w-xl md:max-w-2xl rounded-3xl p-6 sm:p-8 bg-card border border-border shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold font-heading flex items-center space-x-2">
              <Sliders className="h-5 w-5 text-emerald-500" />
              <span>Configure Subscription & Toggles</span>
            </DialogTitle>
            <DialogDescription className="text-xs">
              Updating settings for <strong className="text-foreground">{selectedTenant?.businessName}</strong>.
            </DialogDescription>
          </DialogHeader>

          {configError && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/25 text-rose-600 dark:text-rose-400 text-xs">
              {configError}
            </div>
          )}

          <form onSubmit={handleConfigSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs">Subscription Plan</Label>
              <select
                value={editPlan}
                onChange={(e) => handleEditPlanChange(e.target.value as PlanType)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs font-semibold"
              >
                <option value="STARTER">STARTER (Max 2 Staff, No Custom Domain, No AI Scanner)</option>
                <option value="BUSINESS">BUSINESS (Max 4 Staff, AI Scanner Included, No Custom Domain)</option>
                <option value="ENTERPRISE">ENTERPRISE (Custom Quota, Modular Feature Toggles)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Billing Mode</Label>
              <select
                value={editBillingMode}
                onChange={(e) => setEditBillingMode(e.target.value as BillingMode)}
                className="w-full h-9 rounded-xl border border-border bg-background px-3 text-xs"
              >
                <option value="SUBSCRIPTION">Standard Paid Subscription</option>
                <option value="COMPLIMENTARY">Complimentary Access (Zero Fees)</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs">Max Cashier / Staff Seats</Label>
              <Input
                type="number"
                min={1}
                max={500}
                disabled={editPlan === 'STARTER' || editPlan === 'BUSINESS'}
                value={editStaffQuota}
                onChange={(e) => setEditStaffQuota(Number(e.target.value))}
                className="h-9 text-xs font-mono rounded-xl"
              />
              {(editPlan === 'STARTER' || editPlan === 'BUSINESS') && (
                <p className="text-[10px] text-muted-foreground">Fixed by plan tier ({editPlan === 'STARTER' ? '2' : '4'} seats).</p>
              )}
            </div>

            {/* Modular Enterprise Toggles */}
            <div className="p-3.5 rounded-xl bg-secondary/50 border border-border space-y-2.5">
              <span className="text-xs font-semibold text-foreground">Modular Capabilities:</span>
              <div className="space-y-2 text-xs">
                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={editPlan !== 'ENTERPRISE'}
                    checked={editCustomDomain}
                    onChange={(e) => setEditCustomDomain(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Allow Custom Domain Portals</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={editPlan !== 'ENTERPRISE'}
                    checked={editMultipleBranches}
                    onChange={(e) => setEditMultipleBranches(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Enable Multiple Branches</span>
                </label>

                <label className="flex items-center space-x-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    disabled={editPlan !== 'ENTERPRISE'}
                    checked={editAdvancedReports}
                    onChange={(e) => setEditAdvancedReports(e.target.checked)}
                    className="rounded text-emerald-500 focus:ring-emerald-500"
                  />
                  <span>Enable Advanced Breakdown Reports</span>
                </label>
              </div>
              {editPlan !== 'ENTERPRISE' && (
                <p className="text-[10px] text-muted-foreground italic">Modular toggles require the Enterprise tier.</p>
              )}
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsConfigOpen(false)}
                className="h-9 rounded-xl text-xs"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={updatePlanMutation.isPending}
                className="h-9 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-700 text-white font-semibold"
              >
                {updatePlanMutation.isPending ? 'Saving...' : 'Save Configuration'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
