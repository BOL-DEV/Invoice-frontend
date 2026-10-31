'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useDashboardStats } from '../../../features/dashboard/hooks/useDashboardStats';
import { useBusinessSettings } from '../../../features/business/hooks/useBusinessSettings';
import { useSubscription } from '../../../features/subscriptions/hooks/useSubscription';
import { useBranches } from '../../../features/branches';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  UserCheck,
  FileSpreadsheet,
  RefreshCw,
  Loader2,
  Plus,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileEdit,
  Building2,
  Store,
  MapPin,
  Users,
  ExternalLink,
  ChevronRight,
  Layers,
  ArrowUpRight,
} from 'lucide-react';
import { Skeleton } from '../../../components/ui/skeleton';
import { Button } from '../../../components/ui/button';
import { SuperAdminDashboard } from '../../../features/admin/components/SuperAdminDashboard';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();
  const [selectedBranchId, setSelectedBranchId] = useState<string>('all');
  const { data: stats, isLoading: statsLoading, isError, error, refetch } = useDashboardStats(selectedBranchId);
  const { data: businessSettings } = useBusinessSettings();
  const { data: subDetails } = useSubscription();
  const { data: branches = [] } = useBranches();

  const businessName = businessSettings?.businessName || 'BOLXolve Invoice';
  const rawLogo = businessSettings?.logo;
  const hasCustomLogo = Boolean(
    rawLogo &&
    typeof rawLogo === 'string' &&
    (rawLogo.startsWith('/') || rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:image/')) &&
    !rawLogo.startsWith('{')
  );

  const logoSrc = hasCustomLogo ? (rawLogo as string) : '/platform-logo.svg';

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Loading Workspace Dashboard...</p>
        </div>
      </div>
    );
  }

  // Super Admin Platform Command Center:
  if (user.role === 'SUPER_ADMIN') {
    return (
      <SuperAdminDashboard user={user} />
    );
  }

  const isSubAdmin = user.role === 'ADMIN' && Boolean(user.branchId);
  const isMainAdmin = user.role === 'ADMIN' && !user.branchId;
  const isAdmin = user.role === 'ADMIN';

  const hasMultiBranch = Boolean(
    subDetails?.capabilities?.multipleBranches ||
    subDetails?.subscription?.hasMultipleBranches ||
    stats?.isMultiBranch ||
    branches.length > 1 ||
    (stats?.branchBreakdown && stats.branchBreakdown.length > 0)
  );

  const currentBranch = branches.find((b) => b.id === selectedBranchId);

  const formatCurrency = (amount: number) => {
    return `₦${Number(amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const getSalesChartData = () => {
    if (!stats?.salesTrend || stats.salesTrend.length === 0) return [];
    const maxSales = Math.max(...stats.salesTrend.map((t) => t.sales), 1);
    return stats.salesTrend.map((item) => ({
      date: item.date,
      sales: item.sales,
      heightPercentage: (item.sales / maxSales) * 100,
    }));
  };

  const chartData = getSalesChartData();
  const totalTrendRevenue = chartData.reduce((acc, curr) => acc + curr.sales, 0);

  // Compute total sales across all branches for revenue share percentage
  const totalEnterpriseSales = stats?.branchBreakdown?.reduce((acc, b) => acc + b.totalSales, 0) || stats?.totalSales || 1;

  return (
    <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
      
      {/* ========================================================= */}
      {/* HERO HEADER & QUICK ACTIONS                               */}
      {/* ========================================================= */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {isMainAdmin && hasMultiBranch
                ? selectedBranchId === 'all'
                  ? 'Enterprise Operations Overview'
                  : `${currentBranch?.name || 'Branch'} Operations Overview`
                : isSubAdmin
                ? 'Branch Operations Overview'
                : `Welcome back, ${user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Cashier'}`}
            </h1>
            {isMainAdmin && hasMultiBranch && (
              <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex">
                MULTI-BRANCH ENTERPRISE
              </Badge>
            )}
            {isSubAdmin && (
              <Badge className="bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full hidden sm:inline-flex">
                BRANCH MANAGER
              </Badge>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {isMainAdmin && hasMultiBranch
              ? selectedBranchId === 'all'
                ? 'Consolidated sales volume, branch network breakdown, and cashier activity across all physical depots.'
                : `Viewing isolated sales metrics, cashier staffing, and pending queues for ${currentBranch?.name || 'selected branch'}.`
              : isSubAdmin
              ? 'Live sales performance, cashier activity, and pending approval workflows for your assigned branch.'
              : 'Monitor your finalized receipts, active draft orders, and pending approval requests.'}
          </p>
        </div>

        {/* Quick Actions */}
        <div className="flex items-center space-x-2.5">
          <Button
            onClick={() => refetch()}
            variant="outline"
            size="sm"
            className="h-10 rounded-xl text-xs border-border hover:bg-secondary flex items-center space-x-1.5"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${statsLoading ? 'animate-spin text-emerald-500' : ''}`} />
            <span>Refresh</span>
          </Button>
          
          <Link href="/invoices/create">
            <Button className="h-10 bg-gradient-to-r from-emerald-500 to-[#059669] hover:from-emerald-600 hover:to-[#047857] text-white font-semibold rounded-xl text-xs px-4 shadow-lg shadow-emerald-500/20 flex items-center space-x-1.5 cursor-pointer">
              <Plus className="h-4 w-4" />
              <span>New Invoice</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* ========================================================= */}
      {/* MULTI-BRANCH SELECTOR PILLS (For Main Admin)              */}
      {/* ========================================================= */}
      {isMainAdmin && hasMultiBranch && (branches.length > 0 || (stats?.branchBreakdown && stats.branchBreakdown.length > 0)) && (
        <div className="p-3 bg-secondary/30 rounded-2xl border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-2 shrink-0">
            <Building2 className="h-4 w-4 text-emerald-500" />
            <span className="text-xs font-bold text-foreground">Depot Filter:</span>
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedBranchId('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                selectedBranchId === 'all'
                  ? 'bg-emerald-500 text-white shadow-sm font-bold'
                  : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
              }`}
            >
              <Layers className="h-3.5 w-3.5" />
              <span>All Branches (Consolidated)</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                selectedBranchId === 'all' ? 'bg-white/20 text-white' : 'bg-secondary text-muted-foreground'
              }`}>
                {branches.length || stats?.branchBreakdown?.length || 0}
              </span>
            </button>

            {(stats?.branchBreakdown || branches).map((b) => {
              const isSelected = selectedBranchId === b.id;
              return (
                <button
                  key={b.id}
                  type="button"
                  onClick={() => setSelectedBranchId(b.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer flex items-center space-x-1.5 ${
                    isSelected
                      ? 'bg-emerald-500 text-white shadow-sm font-bold'
                      : 'bg-card text-muted-foreground hover:text-foreground hover:bg-secondary border border-border/60'
                  }`}
                >
                  <Store className="h-3.5 w-3.5" />
                  <span>{b.name}</span>
                  {b.isMain && (
                    <span className={`text-[9px] px-1 py-0.2 rounded font-bold uppercase tracking-wider ${
                      isSelected ? 'bg-white/25 text-white' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      Main
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* KPI METRICS GRID                                          */}
      {/* ========================================================= */}
      {statsLoading ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="border-border bg-card shadow-premium rounded-2xl p-5 space-y-3">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-24" />
                <Skeleton className="h-8 w-8 rounded-xl" />
              </div>
              <Skeleton className="h-7 w-36" />
              <Skeleton className="h-3 w-48" />
            </Card>
          ))}
        </div>
      ) : isError ? (
        <div className="p-6 bg-rose-500/10 border border-rose-500/20 rounded-2xl text-rose-500 text-center space-y-3">
          <p className="font-semibold text-sm">Failed to fetch server statistics.</p>
          <p className="text-xs text-muted-foreground">
            {error instanceof Error ? error.message : 'Ensure your backend service is running and accessible.'}
          </p>
          <Button onClick={() => refetch()} variant="outline" className="border-rose-500/25 hover:bg-rose-500/5 text-rose-600 rounded-xl h-9 text-xs px-4">
            Retry Connection
          </Button>
        </div>
      ) : (
        <motion.div
          initial="hidden"
          animate="show"
          variants={{
            hidden: { opacity: 0 },
            show: {
              opacity: 1,
              transition: { staggerChildren: 0.05 }
            }
          }}
          className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4"
        >
          {/* Metric 1: Revenue */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden relative group hover:border-emerald-500/40 transition-all duration-200">
              <div className="h-1 w-full bg-gradient-to-r from-emerald-500 to-teal-400" />
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-4">
                <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {isMainAdmin && selectedBranchId === 'all' ? 'Total Revenue (All Depots)' : 'Branch Revenue'}
                </CardTitle>
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <TrendingUp className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent className="px-6 pb-5">
                <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                  {formatCurrency(stats?.totalSales || 0)}
                </div>
                <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center space-x-1">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 inline" />
                  <span>Computed from finalized invoices</span>
                </p>
              </CardContent>
            </Card>
          </motion.div>

          {/* Metric 2: Pending Approvals */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <Link href="/approvals" className="block">
              <Card className={`border-border bg-card shadow-premium rounded-2xl overflow-hidden relative group transition-all duration-200 hover:border-amber-500/50 ${(stats?.pendingApprovalsCount || 0) > 0 ? 'ring-1 ring-amber-500/30' : ''}`}>
                <div className={`h-1 w-full ${(stats?.pendingApprovalsCount || 0) > 0 ? 'bg-amber-500' : 'bg-slate-200 dark:bg-slate-700'}`} />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-4">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pending Approvals
                  </CardTitle>
                  <div className={`p-2 rounded-xl ${(stats?.pendingApprovalsCount || 0) > 0 ? 'bg-amber-500/15 text-amber-500 animate-pulse' : 'bg-secondary text-muted-foreground'}`}>
                    <Clock className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                    {stats?.pendingApprovalsCount || 0}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center space-x-1">
                    {(stats?.pendingApprovalsCount || 0) > 0 ? (
                      <span className="text-amber-500 font-semibold flex items-center space-x-1">
                        <span>{isAdmin ? 'Action required' : 'Awaiting admin sign-off'}</span>
                        <ArrowRight className="h-3 w-3 inline" />
                      </span>
                    ) : (
                      <span>{isAdmin ? 'All queues clear' : 'No pending tickets'}</span>
                    )}
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Metric 3: Total Invoices */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            <Link href={selectedBranchId !== 'all' ? `/invoices?branchId=${selectedBranchId}` : '/invoices'} className="block">
              <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden relative group hover:border-indigo-500/40 transition-all duration-200">
                <div className="h-1 w-full bg-indigo-500" />
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-4">
                  <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                    {isAdmin ? 'Total Invoices' : 'My Invoices'}
                  </CardTitle>
                  <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-500">
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                    {stats?.invoiceCounts?.total || 0}
                  </div>
                  <p className="text-[11px] text-muted-foreground mt-1.5">
                    <span className="text-emerald-500 font-medium">{stats?.invoiceCounts?.finalized || 0} finalized</span>
                    <span className="mx-1">•</span>
                    <span>{stats?.invoiceCounts?.draft || 0} drafts</span>
                  </p>
                </CardContent>
              </Card>
            </Link>
          </motion.div>

          {/* Metric 4: Multi-Branch Overview OR Cashiers */}
          <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
            {isMainAdmin && hasMultiBranch && selectedBranchId === 'all' ? (
              <Link href="/branches" className="block">
                <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden relative group hover:border-emerald-500/40 transition-all duration-200">
                  <div className="h-1 w-full bg-emerald-500" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-4">
                    <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Physical Depots
                    </CardTitle>
                    <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                      <Building2 className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums flex items-center space-x-2">
                      <span>{branches.length || stats?.branchBreakdown?.length || 1}</span>
                      <span className="text-xs font-normal text-muted-foreground">Branches</span>
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5 flex items-center justify-between">
                      <span>{stats?.cashiersCount || 0} active staff members</span>
                      <ArrowRight className="h-3 w-3 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ) : isAdmin ? (
              <Link href={selectedBranchId !== 'all' ? `/users?branchId=${selectedBranchId}` : '/users'} className="block">
                <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden relative group hover:border-blue-500/40 transition-all duration-200">
                  <div className="h-1 w-full bg-blue-500" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-4">
                    <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Staff / Cashiers
                    </CardTitle>
                    <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                      <UserCheck className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                      {stats?.cashiersCount || 0}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">Registered depot operators</p>
                  </CardContent>
                </Card>
              </Link>
            ) : (
              <Link href="/invoices" className="block">
                <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden relative group hover:border-amber-500/40 transition-all duration-200">
                  <div className="h-1 w-full bg-amber-500" />
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-4">
                    <CardTitle className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                      Drafts In Progress
                    </CardTitle>
                    <div className="p-2 rounded-xl bg-amber-500/10 text-amber-500">
                      <FileEdit className="h-4 w-4" />
                    </div>
                  </CardHeader>
                  <CardContent className="px-6 pb-5">
                    <div className="text-2xl font-bold font-mono tracking-tight text-foreground tabular-nums">
                      {stats?.invoiceCounts?.draft || 0}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-1.5">Pending completion & billing</p>
                  </CardContent>
                </Card>
              </Link>
            )}
          </motion.div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* MULTI-BRANCH OPERATIONS BREAKDOWN (For Main Admin)        */}
      {/* ========================================================= */}
      {isMainAdmin && hasMultiBranch && stats?.branchBreakdown && stats.branchBreakdown.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08, duration: 0.2 }}
          className="space-y-4"
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 px-1">
            <div className="space-y-0.5">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4 text-emerald-500" />
                <h2 className="text-sm font-bold tracking-tight text-foreground font-heading uppercase tracking-wider">
                  Branch Network Performance Breakdown
                </h2>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-mono px-2 py-0.5 rounded-full">
                  {stats.branchBreakdown.length} Depots Active
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                Individual revenue volume, branch managers, and cashier staff distribution across all physical depot locations.
              </p>
            </div>

            <Link href="/branches">
              <Button variant="outline" size="sm" className="h-8 rounded-xl text-xs border-border hover:bg-secondary flex items-center space-x-1.5 cursor-pointer">
                <span>Manage Branches</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground" />
              </Button>
            </Link>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {stats.branchBreakdown.map((branch) => {
              const revenueShare = totalEnterpriseSales > 0 ? Math.min(Math.round((branch.totalSales / totalEnterpriseSales) * 100), 100) : 0;
              const isSelected = selectedBranchId === branch.id;

              return (
                <Card
                  key={branch.id}
                  className={`border-border bg-card shadow-premium rounded-2xl overflow-hidden transition-all duration-200 relative hover:border-emerald-500/40 ${
                    isSelected ? 'ring-2 ring-emerald-500/60 border-emerald-500/60' : ''
                  }`}
                >
                  <div className={`h-1.5 w-full ${branch.isMain ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-slate-300 dark:bg-slate-700'}`} />
                  
                  <div className="p-5 space-y-4">
                    {/* Top Row: Branch Identity & Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center space-x-2">
                          <h3 className="font-bold text-sm text-foreground truncate">{branch.name}</h3>
                          {branch.isMain && (
                            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[9px] font-bold px-1.5 py-0.5 rounded uppercase">
                              Main Hub
                            </Badge>
                          )}
                        </div>
                        {branch.code && (
                          <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                            Code: <strong className="text-foreground">{branch.code}</strong>
                          </p>
                        )}
                        <p className="text-[11px] text-muted-foreground flex items-center space-x-1 mt-1 truncate">
                          <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                          <span className="truncate">{branch.address || 'Address not configured'}</span>
                        </p>
                      </div>

                      <Badge variant="outline" className={`text-[10px] shrink-0 font-medium ${
                        branch.isActive
                          ? 'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5'
                          : 'border-amber-500/30 text-amber-500 bg-amber-500/5'
                      }`}>
                        {branch.isActive ? 'Active Depot' : 'Inactive'}
                      </Badge>
                    </div>

                    {/* Manager Card */}
                    <div className="p-2.5 rounded-xl bg-secondary/40 border border-border/70 flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold text-xs flex items-center justify-center shrink-0 border border-emerald-500/20">
                        {branch.manager?.firstName ? branch.manager.firstName[0].toUpperCase() : 'M'}
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center space-x-1.5">
                          <p className="text-xs font-semibold text-foreground truncate">
                            {branch.manager ? `${branch.manager.firstName} ${branch.manager.lastName}` : 'No Branch Head Appointed'}
                          </p>
                          <span className="text-[9px] px-1 bg-secondary text-muted-foreground rounded font-mono">
                            Manager
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground truncate font-mono">
                          {branch.manager?.email || 'Provision via Staff page'}
                        </p>
                      </div>
                    </div>

                    {/* Performance Metrics Trio */}
                    <div className="grid grid-cols-3 gap-2 text-center pt-1 border-t border-border/60">
                      <div className="p-2 rounded-xl bg-secondary/20">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Revenue</p>
                        <p className="text-xs font-bold font-mono text-emerald-600 dark:text-emerald-400 truncate mt-0.5">
                          {formatCurrency(branch.totalSales)}
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-secondary/20">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Invoices</p>
                        <p className="text-xs font-bold font-mono text-foreground mt-0.5">
                          {branch.finalizedCount} <span className="text-[10px] text-muted-foreground font-normal">rec</span>
                        </p>
                      </div>

                      <div className="p-2 rounded-xl bg-secondary/20">
                        <p className="text-[10px] font-medium text-muted-foreground uppercase">Operators</p>
                        <p className="text-xs font-bold font-mono text-foreground mt-0.5">
                          {branch.staffCount} <span className="text-[10px] text-muted-foreground font-normal">staff</span>
                        </p>
                      </div>
                    </div>

                    {/* Revenue Contribution Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Revenue Contribution</span>
                        <strong className="text-foreground">{revenueShare}% of business total</strong>
                      </div>
                      <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 rounded-full transition-all duration-300"
                          style={{ width: `${Math.max(revenueShare, 2)}%` }}
                        />
                      </div>
                    </div>

                    {/* Actions Row */}
                    <div className="pt-1 flex items-center justify-between gap-2 border-t border-border/60 text-xs">
                      <button
                        type="button"
                        onClick={() => setSelectedBranchId(isSelected ? 'all' : branch.id)}
                        className={`text-[11px] font-semibold transition-colors cursor-pointer flex items-center space-x-1 ${
                          isSelected ? 'text-emerald-500 font-bold' : 'text-muted-foreground hover:text-foreground'
                        }`}
                      >
                        <span>{isSelected ? '✓ Viewing This Branch' : 'Isolate In Dashboard'}</span>
                        <ChevronRight className="h-3 w-3" />
                      </button>

                      <div className="flex items-center space-x-1.5">
                        <Link
                          href={`/invoices?branchId=${branch.id}`}
                          className="text-[11px] text-muted-foreground hover:text-indigo-400 font-medium px-2 py-1 rounded-lg hover:bg-secondary transition-all"
                        >
                          Ledger
                        </Link>
                        <Link
                          href={`/users?branchId=${branch.id}`}
                          className="text-[11px] text-muted-foreground hover:text-emerald-400 font-medium px-2 py-1 rounded-lg hover:bg-secondary transition-all"
                        >
                          Staff
                        </Link>
                      </div>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* ========================================================= */}
      {/* SALES TREND CHART & QUICK SHORTCUTS                       */}
      {/* ========================================================= */}
      {!statsLoading && !isError && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.2 }}
          className="grid gap-6 lg:grid-cols-12"
        >
          {/* Chart (8 cols) */}
          <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden lg:col-span-8">
            <CardHeader className="p-6 border-b border-border/80 flex flex-row items-center justify-between bg-slate-50/50 dark:bg-slate-900/30">
              <div>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-4 w-4 text-emerald-500" />
                  <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    {isMainAdmin && selectedBranchId === 'all'
                      ? '30-Day Enterprise Sales Trend (Consolidated)'
                      : `${currentBranch?.name || 'Depot'} 30-Day Revenue Trend`}
                  </CardTitle>
                </div>
                <CardDescription className="text-xs mt-1">
                  {isMainAdmin && selectedBranchId === 'all'
                    ? 'Daily aggregate volume generated across all physical depot sales.'
                    : `Daily revenue generated from finalized invoices for ${currentBranch?.name || 'this branch'}.`}
                </CardDescription>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-mono text-muted-foreground">30D Aggregate</p>
                <p className="text-sm font-bold font-mono text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {formatCurrency(totalTrendRevenue)}
                </p>
              </div>
            </CardHeader>

            <CardContent className="p-6">
              {chartData.length === 0 ? (
                <div className="h-64 flex flex-col items-center justify-center border border-dashed rounded-xl text-muted-foreground text-xs space-y-1">
                  <BarChart3 className="h-8 w-8 text-muted-foreground/30" />
                  <p>No sales transaction data recorded for this 30-day cycle.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-64 flex items-end space-x-1.5 sm:space-x-3 border-b border-border pb-2 pt-6">
                    {chartData.map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        {/* Tooltip */}
                        <div className="absolute bottom-full mb-2 bg-[#0F172A] dark:bg-slate-800 border border-slate-700/60 text-white text-[10px] px-2.5 py-1.5 rounded-lg shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-150 pointer-events-none whitespace-nowrap z-20 font-mono">
                          <p className="text-slate-400">{day.date}</p>
                          <p className="font-bold text-emerald-400">{formatCurrency(day.sales)}</p>
                        </div>
                        
                        {/* Bar */}
                        <div
                          style={{ height: `${Math.max(day.heightPercentage, 4)}%` }}
                          className="w-full bg-gradient-to-t from-emerald-600 to-emerald-400 hover:from-emerald-500 hover:to-emerald-300 rounded-t-md transition-all duration-200 cursor-pointer shadow-sm"
                        />
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-between text-[11px] text-muted-foreground px-1 font-mono">
                    <span>{chartData[0]?.date}</span>
                    <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
                    <span>{chartData[chartData.length - 1]?.date}</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Quick Operational Shortcuts (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            <Card className="border-border bg-card shadow-premium rounded-2xl p-6 space-y-4">
              <div className="space-y-1">
                <h3 className="font-bold text-sm text-foreground">
                  {isAdmin ? 'Quick Operations' : 'Cashier Actions'}
                </h3>
                <p className="text-xs text-muted-foreground">
                  Direct access to billing and workflow operations.
                </p>
              </div>

              <div className="space-y-2.5">
                <Link href="/invoices/create" className="block">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                        <Plus className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Create New Invoice</p>
                        <p className="text-[10px] text-muted-foreground">Add items, tax & print</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                <Link href={selectedBranchId !== 'all' ? `/invoices?branchId=${selectedBranchId}` : '/invoices'} className="block">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-indigo-500/40 hover:bg-indigo-500/5 transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                        <FileSpreadsheet className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Invoices Ledger</p>
                        <p className="text-[10px] text-muted-foreground">Filter, print and search records</p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                <Link href="/approvals" className="block">
                  <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-foreground">Reprint Approvals</p>
                        <p className="text-[10px] text-muted-foreground">
                          {isAdmin ? 'Review cashier reprint tickets' : 'Track status of your reprint tickets'}
                        </p>
                      </div>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-amber-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                </Link>

                {isMainAdmin && hasMultiBranch && (
                  <Link href="/branches" className="block">
                    <div className="flex items-center justify-between p-3 rounded-xl border border-border hover:border-emerald-500/40 hover:bg-emerald-500/5 transition-all group">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                          <Building2 className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="text-xs font-semibold text-foreground">Branches & Locations</p>
                          <p className="text-[10px] text-muted-foreground">Manage physical depots & managers</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>
                )}
              </div>
            </Card>

            {/* Station Guidance / Security Card */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-2 shadow-premium">
              <div className="flex items-center space-x-2">
                <Image src={logoSrc} alt={businessName} width={18} height={18} className="w-4 h-4 object-contain" />
                <span className="text-xs font-bold">{businessName}</span>
              </div>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                {isMainAdmin && hasMultiBranch
                  ? 'Enterprise Multi-Branch Security Protocol Active: Head managers govern localized depot cashiers. Consolidated oversight and auditing is centralized at executive headquarters.'
                  : isAdmin
                  ? 'Dual-tier security protocol is active. Reprints and ledger revisions require designated admin authorization.'
                  : 'Terminal operational guide: Invoices saved as draft can be modified. Finalized receipts require manager approval for reprinting.'}
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
