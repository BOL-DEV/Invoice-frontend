'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { usePlatformOverview } from '../hooks/useTenants';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Skeleton } from '../../../components/ui/skeleton';
import { TenantSummary, PlanType, BillingMode } from '../../../types/api';
import {
  Building2,
  Users,
  FileText,
  TrendingUp,
  CreditCard,
  Gift,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ExternalLink,
  Plus,
  RefreshCw,
  Loader2,
  ShieldCheck,
  Search,
  Sliders,
  DollarSign,
  Activity,
  Globe,
  Sparkles,
} from 'lucide-react';

interface SuperAdminDashboardProps {
  user: {
    firstName?: string;
    lastName?: string;
    email: string;
  };
}

export const SuperAdminDashboard: React.FC<SuperAdminDashboardProps> = ({ user }) => {
  const router = useRouter();
  const { data: overview, isLoading, isError, error, refetch, isFetching } = usePlatformOverview();
  const [selectedPlanTab, setSelectedPlanTab] = useState<'ALL' | PlanType>('ALL');
  const [selectedBillingTab, setSelectedBillingTab] = useState<'ALL' | BillingMode>('ALL');
  const [searchFilter, setSearchFilter] = useState('');

  const formatCurrency = (amount: number) => {
    return `₦${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  if (isLoading) {
    return (
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div className="space-y-2">
            <Skeleton className="h-6 w-48 rounded-full" />
            <Skeleton className="h-8 w-80 rounded-xl" />
            <Skeleton className="h-4 w-96 rounded-lg" />
          </div>
          <Skeleton className="h-10 w-36 rounded-xl" />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton className="h-72 rounded-2xl lg:col-span-2" />
          <Skeleton className="h-72 rounded-2xl" />
        </div>
      </div>
    );
  }

  if (isError || !overview) {
    return (
      <div className="p-8 text-center space-y-4 max-w-lg mx-auto my-12 bg-card border border-border rounded-2xl shadow-sm">
        <div className="h-12 w-12 rounded-2xl bg-rose-500/10 text-rose-500 flex items-center justify-center mx-auto">
          <AlertTriangle className="h-6 w-6" />
        </div>
        <div>
          <h3 className="font-bold text-base text-foreground">Failed to Load Platform Overview</h3>
          <p className="text-xs text-muted-foreground mt-1">
            {error instanceof Error ? error.message : 'Unable to aggregate platform empire statistics.'}
          </p>
        </div>
        <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl">
          <RefreshCw className="h-4 w-4 mr-1.5" />
          Retry Overview
        </Button>
      </div>
    );
  }

  // Filter businesses for the interactive preview list
  const filteredBusinesses = (overview.allBusinesses || []).filter((b) => {
    const matchesSearch =
      !searchFilter ||
      b.businessName.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (b.slug && b.slug.toLowerCase().includes(searchFilter.toLowerCase())) ||
      b.email.toLowerCase().includes(searchFilter.toLowerCase());

    const plan = b.subscription?.plan || 'STARTER';
    const matchesPlan = selectedPlanTab === 'ALL' || plan === selectedPlanTab;

    const billing = b.subscription?.billingMode || 'SUBSCRIPTION';
    const matchesBilling = selectedBillingTab === 'ALL' || billing === selectedBillingTab;

    return matchesSearch && matchesPlan && matchesBilling;
  });

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      {/* ========================================================= */}
      {/* EMPIRE HEADER & GLOBAL CONTROL                            */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-border/60">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-semibold mb-2">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>BOLXolve Multi-Tenant Cloud Empire • Global Platform Admin</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
            Platform Command Center
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Real-time multi-tenant telemetry, subscription quotas, organization ledgers, and tenant status.
          </p>
        </div>

        {/* Global Control CTAs */}
        <div className="flex items-center space-x-2.5">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            disabled={isFetching}
            className="h-10 rounded-xl text-xs border-border hover:bg-secondary flex items-center space-x-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin text-emerald-500' : 'text-muted-foreground'}`} />
            <span>Refresh Telemetry</span>
          </Button>
          <Link href="/admin/tenants">
            <Button
              size="sm"
              className="h-10 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold shadow-sm flex items-center space-x-1.5"
            >
              <Building2 className="h-4 w-4" />
              <span>Manage All Tenants</span>
              <ArrowRight className="h-3.5 w-3.5 ml-1" />
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* KPI METRIC CARDS                                          */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Businesses */}
        <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Businesses
              </span>
              <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
                <Building2 className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
                {overview.totalBusinesses}
              </span>
            </div>
            <div className="mt-2.5 flex items-center space-x-2 text-xs">
              <span className="inline-flex items-center text-emerald-600 dark:text-emerald-400 font-medium">
                <CheckCircle2 className="h-3.5 w-3.5 mr-1" />
                {overview.activeBusinesses} Active
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="inline-flex items-center text-rose-500 font-medium">
                <AlertTriangle className="h-3.5 w-3.5 mr-1" />
                {overview.suspendedBusinesses} Suspended
              </span>
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Total Staff & Cashiers */}
        <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Platform Staff / Cashiers
              </span>
              <div className="h-9 w-9 rounded-xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                <Users className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
                {overview.totalUsers}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground flex items-center">
              Active staff members across all registered organizations
            </p>
          </CardContent>
        </Card>

        {/* Card 3: Total Invoices Created */}
        <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Invoices Issued
              </span>
              <div className="h-9 w-9 rounded-xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
                <FileText className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-3xl font-extrabold tracking-tight font-heading text-foreground">
                {overview.totalInvoices.toLocaleString()}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              Cumulative invoices logged across entire tenant network
            </p>
          </CardContent>
        </Card>

        {/* Card 4: Platform Gross Volume */}
        <Card className="rounded-2xl border-border bg-card shadow-sm hover:shadow-md transition-all">
          <CardContent className="p-5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Total Invoiced Volume
              </span>
              <div className="h-9 w-9 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-3">
              <span className="text-2xl font-extrabold tracking-tight font-heading text-foreground truncate block">
                {formatCurrency(overview.totalPlatformVolume)}
              </span>
            </div>
            <p className="mt-2.5 text-xs text-muted-foreground">
              Gross platform value generated by tenant invoices
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* PLAN TIERS & BILLING MODES OVERVIEW                       */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Panel 1: Subscription Plan Breakdown (STARTER vs BUSINESS vs ENTERPRISE) */}
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400">
                  <Layers className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Subscription Tier Distribution
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Organizations categorized by feature capability & staff quotas
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-border text-xs font-semibold">
                {overview.totalBusinesses} Total
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              {/* Starter Tier */}
              <div
                onClick={() => setSelectedPlanTab(selectedPlanTab === 'STARTER' ? 'ALL' : 'STARTER')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlanTab === 'STARTER'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Starter</span>
                  <Badge className="bg-slate-200 dark:bg-slate-800 text-foreground text-[10px]">2 Seats</Badge>
                </div>
                <div className="text-2xl font-extrabold text-foreground mt-2 font-heading">
                  {overview.planCounts.STARTER}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Manual entry, basic invoicing</p>
              </div>

              {/* Business Tier */}
              <div
                onClick={() => setSelectedPlanTab(selectedPlanTab === 'BUSINESS' ? 'ALL' : 'BUSINESS')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlanTab === 'BUSINESS'
                    ? 'border-blue-500 bg-blue-500/10 ring-2 ring-blue-500/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">Business</span>
                  <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 text-[10px]">4 Seats</Badge>
                </div>
                <div className="text-2xl font-extrabold text-foreground mt-2 font-heading">
                  {overview.planCounts.BUSINESS}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">AI Scanner, Multi-branch</p>
              </div>

              {/* Enterprise Tier */}
              <div
                onClick={() => setSelectedPlanTab(selectedPlanTab === 'ENTERPRISE' ? 'ALL' : 'ENTERPRISE')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedPlanTab === 'ENTERPRISE'
                    ? 'border-purple-500 bg-purple-500/10 ring-2 ring-purple-500/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-purple-600 dark:text-purple-400">Enterprise</span>
                  <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px]">Custom</Badge>
                </div>
                <div className="text-2xl font-extrabold text-foreground mt-2 font-heading">
                  {overview.planCounts.ENTERPRISE}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Custom domains & quotas</p>
              </div>
            </div>

            {/* Quick list of businesses for selected plan */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span>{selectedPlanTab === 'ALL' ? 'All Registered Businesses' : `${selectedPlanTab} Plan Businesses`}</span>
                <span className="text-[11px]">Click any card to inspect full details</span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(overview.businessesByPlan[selectedPlanTab === 'ALL' ? 'STARTER' : selectedPlanTab] || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No businesses on this tier.</p>
                ) : (
                  (selectedPlanTab === 'ALL'
                    ? overview.allBusinesses
                    : overview.businessesByPlan[selectedPlanTab] || []
                  ).slice(0, 5).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/60 transition-all text-xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                          {b.businessName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{b.businessName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">{b.slug}.invoice.bolxolve.com</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            b.onboardingStatus === 'ACTIVE'
                              ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]'
                              : 'border-rose-500/30 text-rose-500 text-[10px]'
                          }
                        >
                          {b.onboardingStatus}
                        </Badge>
                        <Link href={`/admin/tenants/${b.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs rounded-lg text-emerald-600 hover:text-emerald-500">
                            <span>Details</span>
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Panel 2: Billing Mode Breakdown (SUBSCRIPTION vs COMPLIMENTARY) */}
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="bg-secondary/20 border-b border-border py-4 px-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  <CreditCard className="h-4 w-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-foreground">
                    Billing Mode Classification
                  </CardTitle>
                  <CardDescription className="text-xs text-muted-foreground">
                    Commercial SaaS subscribers vs internal complimentary workspaces
                  </CardDescription>
                </div>
              </div>
              <Badge variant="outline" className="border-border text-xs font-semibold">
                Commercial Overview
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-3">
              {/* Subscription Mode */}
              <div
                onClick={() => setSelectedBillingTab(selectedBillingTab === 'SUBSCRIPTION' ? 'ALL' : 'SUBSCRIPTION')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBillingTab === 'SUBSCRIPTION'
                    ? 'border-emerald-500 bg-emerald-500/10 ring-2 ring-emerald-500/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                    SaaS Subscription
                  </span>
                  <CreditCard className="h-4 w-4 text-emerald-500" />
                </div>
                <div className="text-2xl font-extrabold text-foreground mt-2 font-heading">
                  {overview.billingModeCounts.SUBSCRIPTION}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Paid business tenants</p>
              </div>

              {/* Complimentary Mode */}
              <div
                onClick={() => setSelectedBillingTab(selectedBillingTab === 'COMPLIMENTARY' ? 'ALL' : 'COMPLIMENTARY')}
                className={`p-4 rounded-xl border cursor-pointer transition-all ${
                  selectedBillingTab === 'COMPLIMENTARY'
                    ? 'border-amber-500 bg-amber-500/10 ring-2 ring-amber-500/20'
                    : 'border-border bg-card hover:bg-secondary/40'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                    Complimentary
                  </span>
                  <Gift className="h-4 w-4 text-amber-500" />
                </div>
                <div className="text-2xl font-extrabold text-foreground mt-2 font-heading">
                  {overview.billingModeCounts.COMPLIMENTARY}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1">Free partner/internal accounts</p>
              </div>
            </div>

            {/* Quick list of businesses for selected billing mode */}
            <div className="pt-2">
              <div className="flex items-center justify-between text-xs font-semibold text-muted-foreground mb-2">
                <span>
                  {selectedBillingTab === 'ALL'
                    ? 'All Commercial Workspaces'
                    : `${selectedBillingTab === 'SUBSCRIPTION' ? 'Paid SaaS' : 'Complimentary'} Workspaces`}
                </span>
                <span className="text-[11px]">Click details to view quotas & ledgers</span>
              </div>
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {(overview.businessesByBilling[selectedBillingTab === 'ALL' ? 'SUBSCRIPTION' : selectedBillingTab] || []).length === 0 ? (
                  <p className="text-xs text-muted-foreground py-4 text-center">No businesses under this classification.</p>
                ) : (
                  (selectedBillingTab === 'ALL'
                    ? overview.allBusinesses
                    : overview.businessesByBilling[selectedBillingTab] || []
                  ).slice(0, 5).map((b) => (
                    <div
                      key={b.id}
                      className="flex items-center justify-between p-3 rounded-xl bg-secondary/30 hover:bg-secondary/60 border border-border/60 transition-all text-xs"
                    >
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold shrink-0">
                          {b.businessName.charAt(0).toUpperCase()}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-foreground truncate">{b.businessName}</p>
                          <p className="text-[10px] text-muted-foreground font-mono truncate">
                            {b.subscription?.plan || 'STARTER'} Tier • {b.stats?.userCount || 0} Staff
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2 shrink-0">
                        <Badge
                          variant="outline"
                          className={
                            b.subscription?.billingMode === 'COMPLIMENTARY'
                              ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 text-[10px]'
                              : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 text-[10px]'
                          }
                        >
                          {b.subscription?.billingMode || 'SUBSCRIPTION'}
                        </Badge>
                        <Link href={`/admin/tenants/${b.id}`}>
                          <Button size="sm" variant="ghost" className="h-7 px-2 text-xs rounded-lg text-emerald-600 hover:text-emerald-500">
                            <span>Details</span>
                            <ArrowRight className="h-3 w-3 ml-1" />
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================= */}
      {/* TENANT REGISTRY QUICK EXPLORER                            */}
      {/* ========================================================= */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="bg-secondary/20 border-b border-border py-4 px-6">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <div>
              <CardTitle className="text-base font-bold text-foreground">
                Tenant Roster & Fast Access
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                All business workspaces active on the platform. Inspect staff quotas, ledgers, and domains.
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2 w-full sm:w-auto">
              <div className="relative flex-1 sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search tenant name or slug..."
                  value={searchFilter}
                  onChange={(e) => setSearchFilter(e.target.value)}
                  className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <Link href="/admin/tenants">
                <Button size="sm" variant="outline" className="h-8 rounded-xl text-xs whitespace-nowrap">
                  View Full Tenant Center
                </Button>
              </Link>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-secondary/30 border-b border-border text-[10px] uppercase font-bold text-muted-foreground">
                <tr>
                  <th className="py-3 px-6">Business Workspace</th>
                  <th className="py-3 px-4">Plan Tier</th>
                  <th className="py-3 px-4">Billing Mode</th>
                  <th className="py-3 px-4 text-center">Staff Members</th>
                  <th className="py-3 px-4 text-center">Invoices</th>
                  <th className="py-3 px-4 text-center">Status</th>
                  <th className="py-3 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/60">
                {filteredBusinesses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-muted-foreground">
                      No businesses matching the selected filter criteria.
                    </td>
                  </tr>
                ) : (
                  filteredBusinesses.map((b) => {
                    const plan = b.subscription?.plan || 'STARTER';
                    const billing = b.subscription?.billingMode || 'SUBSCRIPTION';
                    const isSuspended = b.onboardingStatus === 'SUSPENDED';

                    return (
                      <tr key={b.id} className="hover:bg-secondary/20 transition-colors">
                        <td className="py-3.5 px-6">
                          <div className="flex items-center space-x-3">
                            <div className="h-9 w-9 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0">
                              {b.businessName.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-bold text-foreground text-xs">{b.businessName}</p>
                              <p className="text-[10px] text-muted-foreground font-mono">{b.slug}.invoice.bolxolve.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="outline"
                            className={
                              plan === 'ENTERPRISE'
                                ? 'border-purple-500/30 text-purple-600 dark:text-purple-400 bg-purple-500/10 text-[10px]'
                                : plan === 'BUSINESS'
                                ? 'border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/10 text-[10px]'
                                : 'border-border text-foreground text-[10px]'
                            }
                          >
                            {plan}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4">
                          <Badge
                            variant="outline"
                            className={
                              billing === 'COMPLIMENTARY'
                                ? 'border-amber-500/30 text-amber-600 dark:text-amber-400 bg-amber-500/10 text-[10px]'
                                : 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 text-[10px]'
                            }
                          >
                            {billing}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium">
                          {b.stats?.userCount || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center font-mono font-medium">
                          {b.stats?.invoiceCount || 0}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <Badge
                            className={
                              !isSuspended
                                ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 text-[10px]'
                                : 'bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px]'
                            }
                          >
                            {b.onboardingStatus}
                          </Badge>
                        </td>
                        <td className="py-3.5 px-6 text-right">
                          <Link href={`/admin/tenants/${b.id}`}>
                            <Button
                              size="sm"
                              className="h-8 px-3 rounded-xl text-xs bg-emerald-600 hover:bg-emerald-500 text-white font-semibold flex items-center space-x-1.5 ml-auto"
                            >
                              <span>View Full Details</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </Button>
                          </Link>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* ========================================================= */}
      {/* SYSTEM ARCHITECTURE & ISOLATION HEALTH                    */}
      {/* ========================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="p-4 rounded-2xl bg-secondary/20 border border-border flex items-start space-x-3 text-xs">
          <ShieldCheck className="h-5 w-5 text-emerald-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground">Multi-Tenant Isolation Active</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Live token scoping, custom domain boundary verification, and real-time suspension enforcement enabled.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/20 border border-border flex items-start space-x-3 text-xs">
          <Globe className="h-5 w-5 text-blue-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground">Domain Router & Branding</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Automated host resolution for custom enterprise domains and subdomain routing online.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-secondary/20 border border-border flex items-start space-x-3 text-xs">
          <Sparkles className="h-5 w-5 text-purple-500 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-foreground">Multimodal AI Scanner Service</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">
              Vision data extraction active with quota restrictions enforced on Starter tiers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
