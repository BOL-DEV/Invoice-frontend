'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../features/auth/context/AuthContext';
import { useDashboardStats } from '../features/dashboard/hooks/useDashboardStats';
import { AppLayout } from '../components/layout/AppLayout';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../components/ui/card';
import {
  TrendingUp,
  Clock,
  UserCheck,
  FileSpreadsheet,
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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Initializing terminal context...</p>
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
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold tracking-tight">System Status Overview</h2>
            <p className="text-sm text-muted-foreground">
              Real-time revenue metrics, system loads, and transaction audit summaries.
            </p>
          </div>
          <Button onClick={() => refetch()} className="font-semibold">
            Refresh Metrics
          </Button>
        </div>

        {statsLoading ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="border-border">
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
          <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-center">
            <p className="font-semibold">Failed to fetch server statistics.</p>
            <p className="text-xs mb-2">Ensure your local backend server is running and accessible.</p>
            <Button onClick={() => refetch()} variant="outline" className="border-rose-500/20 hover:bg-rose-500/15">
              Retry Connection
            </Button>
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Aggregate Revenue
                </CardTitle>
                <TrendingUp className="h-4 w-4 text-emerald-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {formatCurrency(stats?.totalSales || 0)}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Calculated from finalized sales ledger</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Pending Approvals
                </CardTitle>
                <Clock className="h-4 w-4 text-amber-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {stats?.pendingApprovalsCount || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.pendingApprovalsCount && stats.pendingApprovalsCount > 0
                    ? 'Requires immediate administrator action'
                    : 'System verification queues clear'}
                </p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Active Cashiers
                </CardTitle>
                <UserCheck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {stats?.cashiersCount || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">Registered apprentice cashiers</p>
              </CardContent>
            </Card>

            <Card className="border-border bg-card shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  Invoice Statuses
                </CardTitle>
                <FileSpreadsheet className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold font-mono">
                  {stats?.invoiceCounts?.total || 0}
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {stats?.invoiceCounts?.finalized || 0} Finalized | {stats?.invoiceCounts?.draft || 0} Drafts
                </p>
              </CardContent>
            </Card>
          </div>
        )}

        {!statsLoading && !isError && (
          <Card className="border-border bg-card shadow-sm">
            <CardHeader>
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Sales Trend (30 Days)
              </CardTitle>
              <CardDescription>Daily finalized invoice transaction volume in Naira.</CardDescription>
            </CardHeader>
            <CardContent>
              {chartData.length === 0 ? (
                <div className="h-64 flex items-center justify-center border border-dashed rounded-lg text-muted-foreground">
                  No sales transaction data recorded for this period.
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="h-64 flex items-end space-x-2 md:space-x-4 border-b border-border pb-2 pt-6">
                    {chartData.map((day, idx) => (
                      <div key={idx} className="flex-1 flex flex-col items-center group relative h-full justify-end">
                        <div className="absolute bottom-full mb-2 bg-zinc-900 border border-zinc-800 text-white text-xs px-2 py-1 rounded shadow-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10 font-mono">
                          {day.date}: {formatCurrency(day.sales)}
                        </div>
                        <div
                          style={{ height: `${Math.max(day.heightPercentage, 4)}%` }}
                          className="w-full bg-primary hover:bg-zinc-700 dark:hover:bg-zinc-400 rounded-t-sm transition-all duration-300"
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
        )}
      </div>
    </AppLayout>
  );
}
