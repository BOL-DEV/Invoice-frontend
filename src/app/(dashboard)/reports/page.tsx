'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { useReportData, useReportCashiers } from '../../../features/reports/hooks/useReports';
import { useTenantsList } from '../../../features/admin/hooks/useTenants';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { Pagination } from '../../../components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { ReportInvoiceItem } from '../../../types/api';
import {
  BarChart3,
  Calendar,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Search,
  TrendingUp,
  User,
  Users,
  CheckCircle2,
  ChevronDown,
  X,
  Clock,
  Building2,
  Eye,
} from 'lucide-react';

type DatePreset = 'all_time' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_30_days' | 'custom';

export default function ReportsPage() {
  const { user } = useAuth();
  const isAdminOrSuper = user?.role === 'ADMIN' || user?.role === 'SUPER_ADMIN';
  const isSuperAdmin = user?.role === 'SUPER_ADMIN';

  // Filters state - default to all_time so user immediately sees all invoices & finalized sales
  const [preset, setPreset] = useState<DatePreset>('today');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [businessId, setBusinessId] = useState<string>('all');
  const [cashierId, setCashierId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FINALIZED' | 'DRAFT'>('ALL');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedInvoice, setSelectedInvoice] = useState<ReportInvoiceItem | null>(null);

  // Super admin tenants list
  const { data: tenants = [] } = useTenantsList();

  // Query parameters
  const queryParams = useMemo(() => {
    return {
      preset,
      startDate: preset === 'custom' && startDate ? startDate : undefined,
      endDate: preset === 'custom' && endDate ? endDate : undefined,
      businessId: isSuperAdmin && businessId !== 'all' ? businessId : undefined,
      cashierId: cashierId !== 'all' ? cashierId : undefined,
      status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
      customerName: customerSearch.trim() || undefined,
      page,
      limit,
    };
  }, [preset, startDate, endDate, isSuperAdmin, businessId, cashierId, statusFilter, customerSearch, page, limit]);

  // Queries - pass businessId to useReportCashiers so cashiers dropdown filters by business!
  const { data: report, isLoading, isFetching, refetch } = useReportData(queryParams);
  const { data: cashiers = [] } = useReportCashiers(isSuperAdmin && businessId !== 'all' ? businessId : undefined);

  const handlePresetChange = (newPreset: DatePreset) => {
    setPreset(newPreset);
    setPage(1);
    if (newPreset !== 'custom') {
      setStartDate('');
      setEndDate('');
    }
  };

  const handleResetFilters = () => {
    setPreset('today');
    setStartDate('');
    setEndDate('');
    setBusinessId('all');
    setCashierId('all');
    setStatusFilter('ALL');
    setCustomerSearch('');
    setPage(1);
  };

  const handlePrint = () => {
    if (typeof window !== 'undefined') {
      window.print();
    }
  };

  // Format currency helpers
  const formatCurrency = (val: number | undefined) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 2,
    }).format(val || 0);
  };

  const formatNumber = (val: number | undefined) => {
    return new Intl.NumberFormat('en-US').format(val || 0);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString('en-GB', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return isoStr;
    }
  };

  const activeFiltersCount =
    (preset !== 'today' ? 1 : 0) +
    (businessId !== 'all' ? 1 : 0) +
    (cashierId !== 'all' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (customerSearch.trim() ? 1 : 0);

  return (
    <div className="space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center space-x-2.5">
            <div className="h-10 w-10 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-sm">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-foreground flex items-center gap-2">
                Business Reports & Reconciliation
                <Badge variant="outline" className="text-[11px] font-semibold bg-primary/10 text-primary border-primary/20 uppercase">
                  {preset === 'all_time' ? 'All Time' : preset.replace('_', ' ')}
                </Badge>
                {isSuperAdmin && (
                  <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                    {businessId === 'all' ? 'All Businesses' : tenants.find(t => t.id === businessId)?.businessName || 'Filtered Business'}
                  </Badge>
                )}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Financial performance, cashier reconciliation shifts, and customer sales analysis across {isSuperAdmin ? 'the platform' : 'your business'}.
              </p>
            </div>
          </div>
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center space-x-2.5 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="rounded-xl border-border hover:bg-secondary text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrint}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 shadow-sm"
          >
            <Printer className="h-3.5 w-3.5 mr-1.5" />
            Print Report Sheet
          </Button>
        </div>
      </div>

      {/* PRINT-ONLY HEADER */}
      <div className="hidden print:block border-b border-gray-300 pb-3 mb-4">
        <h2 className="text-xl font-bold text-black">Official Reconciliation Report Sheet</h2>
        <div className="text-xs text-gray-600 flex justify-between mt-1">
          <span>Generated: {new Date().toLocaleString('en-GB')}</span>
          <span>Period: {preset.toUpperCase()} ({report?.dateRange?.startDate ? new Date(report.dateRange.startDate).toLocaleDateString('en-GB') : 'All Time'} - {report?.dateRange?.endDate ? new Date(report.dateRange.endDate).toLocaleDateString('en-GB') : 'Present'})</span>
        </div>
      </div>

      {/* FILTER CONTROLS TOOLBAR */}
      <Card className="rounded-2xl border-border bg-card/60 backdrop-blur-sm shadow-sm print:hidden">
        <CardContent className="p-4 space-y-4">
          {/* DATE PRESETS PILLS */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider mr-1 flex items-center">
              <Calendar className="h-3.5 w-3.5 mr-1 text-primary" />
              Period:
            </span>
            {(
              [
                { id: 'today', label: "Today's Report" },
                { id: 'yesterday', label: 'Yesterday' },
                { id: 'this_week', label: 'This Week' },
                { id: 'this_month', label: 'This Month' },
                { id: 'last_30_days', label: 'Last 30 Days' },
                { id: 'custom', label: 'Custom Range' },
                { id: 'all_time', label: 'All Time' },
              ] as const
            ).map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => handlePresetChange(item.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                  preset === item.id
                    ? 'bg-primary text-primary-foreground shadow-sm scale-102'
                    : 'bg-secondary/60 text-muted-foreground hover:bg-secondary hover:text-foreground'
                }`}
              >
                {item.label}
              </button>
            ))}

            {activeFiltersCount > 0 && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={handleResetFilters}
                className="ml-auto text-xs text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 h-7 px-2 rounded-lg"
              >
                <X className="h-3 w-3 mr-1" />
                Reset Filters ({activeFiltersCount})
              </Button>
            )}
          </div>

          {/* DETAILED FILTER INPUTS */}
          <div className={`grid grid-cols-1 sm:grid-cols-2 ${isSuperAdmin ? 'lg:grid-cols-4 xl:grid-cols-5' : 'lg:grid-cols-4'} gap-3 pt-2 border-t border-border/50`}>
            {/* Custom Date Pickers */}
            {preset === 'custom' && (
              <>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">From Date</Label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => {
                      setStartDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 rounded-xl text-xs bg-slate-900 border-slate-700/80 text-slate-100"
                  />
                </div>
                <div className="space-y-1">
                  <Label className="text-[11px] font-semibold text-muted-foreground">To Date</Label>
                  <Input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      setPage(1);
                    }}
                    className="h-9 rounded-xl text-xs bg-slate-900 border-slate-700/80 text-slate-100"
                  />
                </div>
              </>
            )}

            {/* Business / Tenant Filter (Super Admin Platform-Wide Filter) */}
            {isSuperAdmin && (
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                  <Building2 className="h-3 w-3 mr-1 text-primary" />
                  Business Tenant
                </Label>
                <div className="relative">
                  <select
                    value={businessId}
                    onChange={(e) => {
                      setBusinessId(e.target.value);
                      setCashierId('all'); // reset cashier when business changes
                      setPage(1);
                    }}
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                    className="w-full h-9 pl-3 pr-8 rounded-xl text-xs bg-slate-900 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner cursor-pointer appearance-none truncate"
                  >
                    <option value="all" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="bg-slate-900 text-slate-100 font-bold">
                      All Businesses (Platform-Wide)
                    </option>
                    {tenants.map((t) => (
                      <option
                        key={t.id}
                        value={t.id}
                        style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                        className="bg-slate-900 text-slate-100"
                      >
                        {t.businessName} ({t.slug})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Cashier Filter (For Admins) - Custom Dark Themed Select Box */}
            {isAdminOrSuper ? (
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                  <Users className="h-3 w-3 mr-1 text-primary" />
                  {isSuperAdmin && businessId !== 'all' ? 'Cashier in Business' : 'Cashier / Staff'}
                </Label>
                <div className="relative">
                  <select
                    value={cashierId}
                    onChange={(e) => {
                      setCashierId(e.target.value);
                      setPage(1);
                    }}
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                    className="w-full h-9 pl-3 pr-8 rounded-xl text-xs bg-slate-900 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner cursor-pointer appearance-none"
                  >
                    <option value="all" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="bg-slate-900 text-slate-100">
                      {isSuperAdmin && businessId !== 'all' ? 'All Cashiers in Business' : 'All Cashiers'}
                    </option>
                    {cashiers.map((c) => (
                      <option
                        key={c.id}
                        value={c.id}
                        style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                        className="bg-slate-900 text-slate-100"
                      >
                        {c.firstName} {c.lastName} ({c.email})
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            ) : (
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                  <User className="h-3 w-3 mr-1 text-primary" />
                  Your Cashier Shift
                </Label>
                <div className="h-9 px-3 rounded-xl text-xs bg-slate-900 border border-slate-700/80 flex items-center text-slate-300 font-medium truncate">
                  {user?.firstName} {user?.lastName} (Self)
                </div>
              </div>
            )}

            {/* Invoice Status Filter - Custom Dark Themed Select Box */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                <Filter className="h-3 w-3 mr-1 text-primary" />
                Invoice Status
              </Label>
              <div className="relative">
                <select
                  value={statusFilter}
                  onChange={(e) => {
                    setStatusFilter(e.target.value as any);
                    setPage(1);
                  }}
                  style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                  className="w-full h-9 pl-3 pr-8 rounded-xl text-xs bg-slate-900 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner cursor-pointer appearance-none"
                >
                  <option value="ALL" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="bg-slate-900 text-slate-100">
                    All Statuses
                  </option>
                  <option value="FINALIZED" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="bg-slate-900 text-slate-100">
                    Finalized / Closed Only
                  </option>
                  <option value="DRAFT" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="bg-slate-900 text-slate-100">
                    Drafts / In-Progress Only
                  </option>
                </select>
                <ChevronDown className="h-4 w-4 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
              </div>
            </div>

            {/* Customer Search Filter */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                <Search className="h-3 w-3 mr-1 text-primary" />
                Customer Name / Phone
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Filter by customer..."
                  value={customerSearch}
                  onChange={(e) => {
                    setCustomerSearch(e.target.value);
                    setPage(1);
                  }}
                  className="h-9 pl-8 pr-2.5 rounded-xl text-xs bg-slate-900 border-slate-700/80 text-slate-100"
                />
                <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-slate-400" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* LOADING STATE */}
      {isLoading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
          <Skeleton className="h-28 rounded-2xl" />
        </div>
      )}

      {/* SUMMARY KPI METRIC CARDS (Total Revenue, Total Invoices, Draft Value - Weight & Average Size Removed) */}
      {!isLoading && report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. TOTAL FINALIZED REVENUE */}
          <Card className="rounded-2xl border-border bg-gradient-to-br from-card to-card/70 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Finalized Revenue
                </span>
                <div className="h-8 w-8 rounded-xl bg-emerald-500/15 text-emerald-500 flex items-center justify-center font-bold">
                  ₦
                </div>
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {formatCurrency(report.summary.totalRevenue)}
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>
                  <strong className="text-foreground">{formatNumber(report.summary.finalizedInvoices)}</strong> finalized invoice{report.summary.finalizedInvoices !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* 2. TOTAL INVOICES GENERATED */}
          <Card className="rounded-2xl border-border bg-gradient-to-br from-card to-card/70 shadow-sm relative overflow-hidden group hover:border-primary/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full blur-2xl group-hover:bg-primary/20 transition-all pointer-events-none" />
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Total Invoices Generated
                </span>
                <div className="h-8 w-8 rounded-xl bg-primary/15 text-primary flex items-center justify-center">
                  <FileText className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {formatNumber(report.summary.totalInvoices)}
              </div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <span className="text-emerald-500 font-semibold">{report.summary.finalizedInvoices} closed</span>
                <span>•</span>
                <span className="text-amber-500 font-semibold">{report.summary.draftInvoices} drafts</span>
              </div>
            </CardContent>
          </Card>

          {/* 3. DRAFT PIPELINE VALUE */}
          <Card className="rounded-2xl border-border bg-gradient-to-br from-card to-card/70 shadow-sm relative overflow-hidden group hover:border-amber-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-full blur-2xl group-hover:bg-amber-500/20 transition-all pointer-events-none" />
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Drafts & Pending Pipeline
                </span>
                <div className="h-8 w-8 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
                  <Clock className="h-4 w-4" />
                </div>
              </div>
              <div className="text-2xl font-black text-foreground tracking-tight">
                {formatCurrency(report.summary.draftRevenue)}
              </div>
              <div className="flex items-center space-x-1.5 text-xs text-muted-foreground">
                <span>
                  <strong className="text-foreground">{formatNumber(report.summary.draftInvoices)}</strong> pending draft{report.summary.draftInvoices !== 1 ? 's' : ''}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* CASHIER SHIFT RECONCILIATION BREAKDOWN (Average Sale & Action row removed) */}
      {isAdminOrSuper && !isLoading && report && report.cashierStats.length > 0 && (
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Cashier Shifts & Staff Breakdown
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Individual cashier performance, sales volume, and reconciliation for this period.
                </CardDescription>
              </div>
              <Badge variant="outline" className="text-xs font-semibold bg-secondary">
                {report.cashierStats.length} Staff Member{report.cashierStats.length !== 1 ? 's' : ''}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">Cashier Name</th>
                    <th className="py-2.5 px-4">Email</th>
                    <th className="py-2.5 px-4 text-center">Total Invoices</th>
                    <th className="py-2.5 px-4 text-center">Finalized</th>
                    <th className="py-2.5 px-4 text-right">Revenue Collected</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {report.cashierStats.map((c) => {
                    const isSelected = cashierId === c.id;
                    return (
                      <tr
                        key={c.id}
                        className={`hover:bg-secondary/20 transition-colors ${
                          isSelected ? 'bg-primary/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-4 font-bold text-foreground flex items-center space-x-2">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-bold">
                            {c.name.charAt(0) || 'U'}
                          </div>
                          <span>{c.name}</span>
                        </td>
                        <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">{c.email}</td>
                        <td className="py-3 px-4 text-center font-semibold text-foreground">
                          {formatNumber(c.count)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <Badge className="text-[10px] bg-emerald-500/15 text-emerald-500 border-none font-bold">
                            {c.finalizedCount}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                          {formatCurrency(c.revenue)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* TOP CUSTOMERS LEADERBOARD & SUMMARY TREND */}
      {!isLoading && report && report.topCustomers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-border bg-card shadow-sm lg:col-span-1">
            <CardHeader className="pb-3 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Top Purchasing Customers
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Highest value buyers for this period.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-3 space-y-2">
              {report.topCustomers.slice(0, 5).map((cust, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded-xl bg-secondary/30 border border-border/50 flex items-center justify-between text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-bold text-foreground truncate">{cust.customerName}</p>
                    <p className="text-[11px] text-muted-foreground font-mono">
                      {cust.customerPhone || 'No phone'} • {cust.count} purchase{cust.count !== 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-mono font-bold text-foreground">{formatCurrency(cust.totalSpent)}</p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* TIMELINE / SALES ACTIVITY */}
          <Card className="rounded-2xl border-border bg-card shadow-sm lg:col-span-2">
            <CardHeader className="pb-3 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-emerald-500" />
                Sales Velocity Breakdown
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Daily timeline revenue and invoice count distribution.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-4">
              {report.dailyTrend.length === 0 ? (
                <div className="py-8 text-center text-xs text-muted-foreground">
                  No invoice activity recorded in this selected range.
                </div>
              ) : (
                <div className="space-y-3">
                  {report.dailyTrend.slice(-7).map((point, idx) => {
                    const maxRev = Math.max(...report.dailyTrend.map((d) => d.revenue)) || 1;
                    const pct = Math.min(100, Math.round((point.revenue / maxRev) * 100));
                    return (
                      <div key={idx} className="space-y-1 text-xs">
                        <div className="flex items-center justify-between font-mono">
                          <span className="font-semibold text-foreground">{point.date}</span>
                          <span className="text-muted-foreground">
                            {formatNumber(point.count)} inv • <strong className="text-foreground">{formatCurrency(point.revenue)}</strong>
                          </span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-secondary overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-emerald-500 to-primary rounded-full transition-all duration-500"
                            style={{ width: `${Math.max(4, pct)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* FILTERED INVOICES DETAILED TABLE (Action column removed, Items/Weight changed to just Items) */}
      <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
        <CardHeader className="pb-3 border-b border-border/60 bg-secondary/20">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                Invoices Generated in Period
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Itemized invoices matching your active filters ({report?.pagination?.total || 0} total records).
              </CardDescription>
            </div>
            {report && (
              <Badge variant="outline" className="text-xs font-semibold bg-secondary self-start sm:self-auto">
                Page {report.pagination.page} of {report.pagination.totalPages}
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {report?.invoices.length === 0 ? (
            <div className="py-12 text-center space-y-2">
              <FileText className="h-8 w-8 text-muted-foreground mx-auto opacity-40" />
              <p className="text-sm font-semibold text-foreground">No Invoices Found</p>
              <p className="text-xs text-muted-foreground">
                There are no invoices recorded for this date period or matching filter criteria.
              </p>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="rounded-xl text-xs mt-2"
              >
                Reset to Today&apos;s Report
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border">
                  <tr>
                    <th className="py-2.5 px-4">Invoice #</th>
                    {isSuperAdmin && <th className="py-2.5 px-4">Business</th>}
                    <th className="py-2.5 px-4">Date & Time</th>
                    <th className="py-2.5 px-4">Customer</th>
                    <th className="py-2.5 px-4">Cashier</th>
                    <th className="py-2.5 px-4 text-center">Status</th>
                    <th className="py-2.5 px-4 text-right">Items Bought</th>
                    <th className="py-2.5 px-4 text-right">Total Amount</th>
                    <th className="py-2.5 px-4 text-center print:hidden">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {report?.invoices.map((inv) => (
                    <tr key={inv.id} className="hover:bg-secondary/20 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-foreground">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoice(inv)}
                          className="hover:text-primary transition-colors hover:underline text-left"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      {isSuperAdmin && (
                        <td className="py-3 px-4">
                          <span className="font-semibold text-foreground">
                            {inv.business?.name || 'Standard Tenant'}
                          </span>
                        </td>
                      )}
                      <td className="py-3 px-4 text-muted-foreground">{formatDate(inv.createdAt)}</td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{inv.customerName}</p>
                        {inv.customerPhone && (
                          <p className="text-[11px] text-muted-foreground font-mono">{inv.customerPhone}</p>
                        )}
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-foreground">{inv.creator.name}</span>
                      </td>
                      <td className="py-3 px-4 text-center">
                        {inv.status === 'FINALIZED' ? (
                          <Badge className="text-[10px] bg-emerald-500/15 text-emerald-500 border-none font-bold">
                            Finalized
                          </Badge>
                        ) : (
                          <Badge className="text-[10px] bg-amber-500/15 text-amber-500 border-none font-bold">
                            Draft
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right font-mono">
                        <div className="flex flex-col items-end">
                          <span className="font-bold text-foreground">
                            {inv.itemsCount} line item{inv.itemsCount !== 1 ? 's' : ''}
                          </span>
                          <span
                            className="text-[11px] text-muted-foreground truncate max-w-[220px]"
                            title={inv.items && inv.items.length > 0 ? inv.items.map((i) => `${i.quantity}× ${i.description}`).join(', ') : ''}
                          >
                            {inv.items && inv.items.length > 0
                              ? inv.items.map((i) => `${i.quantity}× ${i.description}`).join(', ')
                              : `${inv.itemsCount} items`}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatCurrency(inv.total)}
                      </td>
                      <td className="py-3 px-4 text-center print:hidden">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                          className="h-7 px-2.5 rounded-lg text-xs hover:bg-primary/10 hover:text-primary gap-1 font-semibold"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View Details
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
        {/* PAGINATION FOOTER */}
        {report && report.pagination.total > 0 && (
          <div className="p-3 border-t border-border/80 bg-secondary/10 flex flex-col sm:flex-row items-center justify-between gap-3 print:hidden">
            <div className="flex items-center space-x-2 text-xs text-muted-foreground">
              <span>Show</span>
              <div className="relative">
                <select
                  value={limit}
                  onChange={(e) => {
                    setLimit(Number(e.target.value));
                    setPage(1);
                  }}
                  style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                  className="h-8 pl-2.5 pr-7 rounded-xl text-xs bg-slate-900 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner cursor-pointer appearance-none"
                >
                  <option value={5} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>5</option>
                  <option value={10} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>10</option>
                  <option value={20} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>20</option>
                  <option value={50} style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}>50</option>
                </select>
                <ChevronDown className="h-3.5 w-3.5 absolute right-2 top-2.5 text-slate-400 pointer-events-none" />
              </div>
              <span>rows per page</span>
            </div>

            <Pagination
              currentPage={page}
              totalPages={report.pagination.totalPages}
              onPageChange={(p) => setPage(p)}
              totalItems={report.pagination.total}
              itemsPerPage={limit}
              itemName="invoices"
            />
          </div>
        )}
      </Card>

      {/* PRINT-ONLY SIGNATURE RECONCILIATION BLOCK */}
      <div className="hidden print:block pt-8 border-t border-gray-400 mt-8 text-black">
        <div className="grid grid-cols-2 gap-8 text-xs">
          <div className="space-y-4">
            <p className="font-bold">Prepared by (Cashier / Staff):</p>
            <div className="border-b border-black w-48 h-8" />
            <p>Name: _______________________________</p>
            <p>Signature & Date: ____________________</p>
          </div>
          <div className="space-y-4">
            <p className="font-bold">Approved & Audited by (Manager / Admin):</p>
            <div className="border-b border-black w-48 h-8" />
            <p>Name: _______________________________</p>
            <p>Signature & Date: ____________________</p>
          </div>
        </div>
      </div>

      {/* FULL INVOICE DETAILS MODAL (AUDIT VIEW FOR SUPER ADMIN & ADMIN) */}
      <Dialog open={Boolean(selectedInvoice)} onOpenChange={(open) => !open && setSelectedInvoice(null)}>
        <DialogContent className="w-[95vw] sm:max-w-2xl md:max-w-3xl lg:max-w-4xl bg-card border border-border rounded-3xl p-5 sm:p-7 md:p-8 space-y-6 max-h-[92vh] overflow-y-auto shadow-2xl">
          <DialogHeader className="space-y-1.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <DialogTitle className="text-xl sm:text-2xl font-bold font-heading text-foreground flex items-center gap-2.5">
                  <FileText className="h-5 w-5 text-primary shrink-0" />
                  <span>Invoice {selectedInvoice?.invoiceNumber}</span>
                </DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground mt-1">
                  Issued on {selectedInvoice && formatDate(selectedInvoice.createdAt)}
                  {selectedInvoice?.business?.name && ` • Organization: ${selectedInvoice.business.name}`}
                </DialogDescription>
              </div>
              <Badge
                className={`text-xs font-bold self-start sm:self-auto ${
                  selectedInvoice?.status === 'FINALIZED'
                    ? 'bg-emerald-500/15 text-emerald-500 border border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-500 border border-amber-500/30'
                }`}
              >
                {selectedInvoice?.status}
              </Badge>
            </div>
          </DialogHeader>

          {/* Quick Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 p-4 sm:p-5 rounded-2xl bg-secondary/30 border border-border/60 text-xs">
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Customer</span>
              <p className="font-bold text-foreground text-sm mt-0.5 truncate">{selectedInvoice?.customerName}</p>
              {selectedInvoice?.customerPhone && (
                <p className="text-[11px] text-muted-foreground font-mono mt-0.5">{selectedInvoice.customerPhone}</p>
              )}
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Cashier / Staff</span>
              <p className="font-bold text-foreground text-sm mt-0.5 truncate">{selectedInvoice?.creator.name}</p>
              <p className="text-[11px] text-muted-foreground font-mono truncate mt-0.5">{selectedInvoice?.creator.email}</p>
            </div>
            <div className="min-w-0">
              <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">Grand Total</span>
              <p className="text-base sm:text-lg font-black font-mono text-emerald-500 mt-0.5 truncate">
                {selectedInvoice && formatCurrency(selectedInvoice.total)}
              </p>
            </div>
          </div>

          {/* Itemized Table */}
          <div className="space-y-2.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Itemized Items ({selectedInvoice?.items?.length || selectedInvoice?.itemsCount || 0} Distinct Line Items)
              </h4>
              <span className="text-[11px] text-muted-foreground font-medium">
                Standard Item Breakdown
              </span>
            </div>
            <div className="rounded-2xl border border-border/80 overflow-x-auto bg-background">
              <table className="w-full text-xs text-left min-w-[500px]">
                <thead className="bg-secondary/40 text-muted-foreground font-semibold border-b border-border/80">
                  <tr>
                    <th className="py-2.5 px-3.5">Item Description</th>
                    <th className="py-2.5 px-3.5 text-center w-24">Quantity</th>
                    <th className="py-2.5 px-3.5 text-right w-32">Unit Price</th>
                    <th className="py-2.5 px-3.5 text-right w-36">Total Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/60">
                  {selectedInvoice?.items && selectedInvoice.items.length > 0 ? (
                    selectedInvoice.items.map((item, idx) => (
                      <tr key={idx} className="hover:bg-secondary/10 transition-colors">
                        <td className="py-2.5 px-3.5 font-semibold text-foreground break-words">{item.description}</td>
                        <td className="py-2.5 px-3.5 text-center font-mono font-bold text-foreground">{item.quantity}</td>
                        <td className="py-2.5 px-3.5 text-right font-mono text-muted-foreground whitespace-nowrap">
                          {formatCurrency(item.unitPrice)}
                        </td>
                        <td className="py-2.5 px-3.5 text-right font-mono font-bold text-foreground whitespace-nowrap">
                          {formatCurrency(item.totalPrice)}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">
                        Item breakdown: {selectedInvoice?.itemsCount || 1} line items recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Additional Charges / Fees if any */}
          {selectedInvoice?.charges && selectedInvoice.charges.length > 0 && (
            <div className="space-y-2 p-3.5 rounded-2xl bg-secondary/20 border border-border/60 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-bold text-muted-foreground uppercase text-[10px] tracking-wider block">
                  Additional Applied Charges &amp; Fees ({selectedInvoice.charges.length})
                </span>
                <span className="text-[11px] font-mono font-medium text-foreground">
                  Total Fees: {formatCurrency(selectedInvoice.charges.reduce((acc, c) => acc + (Number(c.amount) || 0), 0))}
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                {selectedInvoice.charges.map((charge, idx) => (
                  <div key={charge.id || idx} className="flex justify-between items-center px-3 py-2 rounded-xl bg-background/60 border border-border/40 text-xs">
                    <span className="text-foreground font-medium truncate pr-2 flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                      {charge.name}
                    </span>
                    <span className="font-mono font-bold text-foreground shrink-0">{formatCurrency(charge.amount)}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Notes and Financial Totals */}
          <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end gap-3.5 pt-2">
            <div className="w-full sm:flex-1">
              {selectedInvoice?.notes && (
                <div className="p-3.5 rounded-2xl bg-secondary/20 border border-border/60 text-xs text-muted-foreground">
                  <span className="font-bold text-foreground block mb-0.5">Notes:</span>
                  <p className="break-words">{selectedInvoice.notes}</p>
                </div>
              )}
            </div>
            <div className="w-full sm:w-72 space-y-2 text-xs bg-secondary/30 p-4 rounded-2xl border border-border/60 shrink-0">
              <div className="flex justify-between items-center text-muted-foreground">
                <span>Subtotal:</span>
                <span className="font-mono font-semibold text-foreground whitespace-nowrap">
                  {selectedInvoice && formatCurrency(selectedInvoice.subtotal)}
                </span>
              </div>
              {selectedInvoice?.charges && selectedInvoice.charges.length > 0 && (
                <div className="space-y-1.5 pt-2 border-t border-border/50">
                  <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider block">
                    Charges &amp; Fees:
                  </span>
                  {selectedInvoice.charges.map((ch, idx) => (
                    <div key={ch.id || idx} className="flex justify-between items-center text-muted-foreground text-[11px]">
                      <span className="truncate pr-2">+ {ch.name}:</span>
                      <span className="font-mono font-medium text-foreground whitespace-nowrap">
                        {formatCurrency(ch.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              )}
              <div className="flex justify-between items-center border-t border-border/80 pt-2 text-sm font-bold text-foreground">
                <span>Total Amount:</span>
                <span className="font-mono text-emerald-500 font-black whitespace-nowrap">
                  {selectedInvoice && formatCurrency(selectedInvoice.total)}
                </span>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4 flex items-center justify-end border-t border-border/60">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedInvoice(null)}
              className="rounded-xl text-xs h-9 px-6 border-border hover:bg-secondary font-semibold"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
