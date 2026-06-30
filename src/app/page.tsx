'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
} from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { Button } from '../components/ui/button';

export default function Home() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { data: stats, isLoading: statsLoading, isError, refetch } = useDashboardStats();

  useEffect(() => {
    if (!authLoading && user && user.role !== 'ADMIN') {
      router.replace('/invoices');
    }
  }, [user, authLoading, router]);

  if (authLoading || (user && user.role !== 'ADMIN')) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-2.5">
          <Loader2 className="h-6 w-6 animate-spin text-primary" />
          <p className="text-xs text-muted-foreground animate-pulse font-medium">Initializing terminal context...</p>
        </div>
      </div>
    );
  }

  const formatCurrency = (amount: number) => {
    return `₦${amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}`;
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

  return (
    <AppLayout>
      <div className="space-y-6 max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading flex items-center space-x-2">
              <Building2 className="h-5 w-5 text-primary" />
              <span>System Status Overview</span>
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Real-time revenue metrics, system loads, and transaction audit summaries.
            </p>
          </div>
          <Button onClick={() => refetch()} variant="outline" className="font-semibold space-x-1.5 h-9 rounded-xl shadow-sm bg-card border-border">
            <RefreshCw className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Refresh Metrics</span>
          </Button>
        </div>

        {statsLoading ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border rounded-2xl shadow-premium">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-4 w-4 rounded-full" />
                </CardHeader>
                <CardContent>
                  <Skeleton className="h-8 w-[120px] mb-2" />
                  <Skeleton className="h-3 w-[80px]" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : isError ? (
          <div className="bg-rose-500/10 border border-rose-500/25 text-rose-600 p-6 rounded-2xl text-center max-w-md mx-auto space-y-3">
            <p className="font-semibold text-sm">Failed to fetch server statistics.</p>
            <p className="text-xs text-muted-foreground">Ensure your local backend server is running and accessible.</p>
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
            {/* Revenue */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <Card className="border-border bg-card shadow-premium rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-5">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Aggregate Revenue
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-[#10B981]" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-2xl font-bold font-mono tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                    {formatCurrency(stats?.totalSales || 0)}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Calculated from finalized sales ledger</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Pending Approvals */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <Card className="border-border bg-card shadow-premium rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-5">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Pending Approvals
                  </CardTitle>
                  <Clock className="h-4 w-4 text-amber-500 animate-pulse" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-2xl font-bold font-mono tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                    {stats?.pendingApprovalsCount || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    {stats?.pendingApprovalsCount && stats.pendingApprovalsCount > 0
                      ? 'Requires immediate action'
                      : 'System verification queues clear'}
                  </p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Active Cashiers */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <Card className="border-border bg-card shadow-premium rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-5">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Active Cashiers
                  </CardTitle>
                  <UserCheck className="h-4 w-4 text-blue-500" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-2xl font-bold font-mono tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                    {stats?.cashiersCount || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1">Registered apprentice cashiers</p>
                </CardContent>
              </Card>
            </motion.div>

            {/* Invoice Statuses */}
            <motion.div variants={{ hidden: { opacity: 0, y: 10 }, show: { opacity: 1, y: 0 } }}>
              <Card className="border-border bg-card shadow-premium rounded-2xl">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-6 pt-5">
                  <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                    Invoice Statuses
                  </CardTitle>
                  <FileSpreadsheet className="h-4 w-4 text-purple-500" />
                </CardHeader>
                <CardContent className="px-6 pb-5">
                  <div className="text-2xl font-bold font-mono tracking-tight text-[#0F172A] dark:text-[#F8FAFC]">
                    {stats?.invoiceCounts?.total || 0}
                  </div>
                  <p className="text-[10px] text-muted-foreground mt-1 truncate">
                    {stats?.invoiceCounts?.finalized || 0} Finalized | {stats?.invoiceCounts?.draft || 0} Drafts
                  </p>
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}

        {!statsLoading && !isError && (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.2 }}
          >
            <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
              <CardHeader className="p-6 border-b border-border bg-slate-50 dark:bg-slate-900/35">
                <CardTitle className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Sales Trend (30 Days)
                </CardTitle>
                <CardDescription className="text-xs mt-0.5">Daily finalized invoice transaction volume in Naira.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                {chartData.length === 0 ? (
                  <div className="h-64 flex items-center justify-center border border-dashed rounded-xl text-muted-foreground">
                    No sales transaction data recorded for this period.
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="h-64 flex items-end space-x-2 md:space-x-4 border-b border-border pb-2 pt-6">
                      {chartData.map((day, idx) => (
                        <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                          <div className="absolute bottom-full mb-2 bg-[#0F172A] dark:bg-slate-800 border border-slate-700/50 text-white text-[10px] px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 font-mono">
                            {day.date}: {formatCurrency(day.sales)}
                          </div>
                          <div
                            style={{ height: `${Math.max(day.heightPercentage, 4)}%` }}
                            className="w-full bg-primary hover:bg-[#059669] dark:hover:bg-[#10B981]/80 rounded-t-lg transition-all duration-300"
                          />
                        </div>
                      ))}
                    </div>

                    <div className="flex justify-between text-xs text-muted-foreground px-2 font-mono">
                      <span>{chartData[0]?.date}</span>
                      <span>{chartData[Math.floor(chartData.length / 2)]?.date}</span>
                      <span>{chartData[chartData.length - 1]?.date}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </div>
    </AppLayout>
  );
}


