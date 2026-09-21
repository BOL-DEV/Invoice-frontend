'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../features/auth/context/AuthContext';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  Clock,
  UserCheck,
  FileSpreadsheet,
  Building2,
  RefreshCw,
  Loader2,
  Plus,
  ArrowRight,
  BarChart3,
  CheckCircle2,
  FileEdit,
  } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';

export default function Home() {
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading, isError, error, refetch } = useDashboardStats();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Loading Lao Steel Ventures Dashboard...</p>
        </div>
      </div>
    );
  }

  const isAdmin = user.role === 'ADMIN';

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

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto pb-10">
        
        {/* ========================================================= */}
        {/* HERO HEADER & QUICK ACTIONS                               */}
        {/* ========================================================= */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border/60">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium mb-2">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              <span>
                {isAdmin
                  ? 'Lao Steel Ventures • Management Hub'
                  : 'Lao Steel Ventures • Cashier Station Terminal'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground font-heading">
              {isAdmin
                ? 'Depot Operations Overview'
                : `Welcome back, ${user.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : 'Cashier'}`}
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              {isAdmin
                ? 'Live sales performance, cashier activity, and pending approval workflows.'
                : 'Monitor your shift receipts, active draft orders, and pending approval requests.'}
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
              {((error as any)?.response?.data?.error?.message) ||
                ((error as any)?.message) ||
                'Ensure your backend service is running and accessible.'}
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
                    {isAdmin ? 'Aggregate Revenue' : 'My Shift Revenue'}
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
                    <span>
                      {isAdmin ? 'Computed from finalized invoices' : 'From your finalized receipts'}
                    </span>
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
              <Link href="/invoices" className="block">
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

            {/* Metric 4: Admin: Cashiers | Apprentice: Draft Invoices */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              {isAdmin ? (
                <Link href="/users" className="block">
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
                      {isAdmin ? '30-Day Depot Revenue Trend' : 'My 30-Day Sales Trend'}
                    </CardTitle>
                  </div>
                  <CardDescription className="text-xs mt-1">
                    {isAdmin
                      ? 'Daily aggregate volume generated across all depot sales.'
                      : 'Your daily sales volume generated from finalized steel receipts.'}
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
                    {isAdmin ? 'Quick Depot Shortcuts' : 'Cashier Actions'}
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
                          <p className="text-[10px] text-muted-foreground">Add rebar, beams & compute tax</p>
                        </div>
                      </div>
                      <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-emerald-500 group-hover:translate-x-0.5 transition-all" />
                    </div>
                  </Link>

                  <Link href="/invoices" className="block">
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
                </div>
              </Card>

              {/* Station Guidance / Security Card */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-950 text-white border border-slate-800 space-y-2 shadow-premium">
                <div className="flex items-center space-x-2">
                  <Building2 className="h-4 w-4 text-emerald-400" />
                  <span className="text-xs font-bold">Lao Steel Ventures</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  {isAdmin
                    ? 'Dual-tier security protocol is active. Reprints and ledger revisions require designated admin authorization.'
                    : 'Terminal operational guide: Invoices saved as draft can be modified. Finalized receipts require manager approval for reprinting.'}
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}
