'use client';

import React, { useState, useMemo } from 'react';
import { User, ReportInvoiceItem } from '../../../types/api';
import { useReportData, useReportCashiers } from '../hooks/useReports';
import { useTenantsList } from '../../admin/hooks/useTenants';
import { useBranches } from '../../branches';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Skeleton } from '../../../components/ui/skeleton';
import { Pagination } from '../../../components/ui/pagination';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../../../components/ui/dialog';
import {
  Calendar,
  FileText,
  Filter,
  Printer,
  RefreshCw,
  Search,
  TrendingUp,
  Users,
  CheckCircle2,
  ChevronDown,
  X,
  Clock,
  Building2,
  Eye,
  Store,
  Loader2,
} from 'lucide-react';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { useModal } from '../../../components/ui/modal-provider';

type DatePreset = 'all_time' | 'today' | 'yesterday' | 'this_week' | 'this_month' | 'last_30_days' | 'custom';

interface SuperAdminReportsProps {
  user: User;
}

export function SuperAdminReports({ user }: SuperAdminReportsProps) {
  const modal = useModal();
  const [isPrintingSheet, setIsPrintingSheet] = useState(false);

  // Filters state
  const [preset, setPreset] = useState<DatePreset>('all_time');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [businessId, setBusinessId] = useState<string>('all');
  const [cashierId, setCashierId] = useState<string>('all');
  const [branchId, setBranchId] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'FINALIZED' | 'DRAFT'>('ALL');
  const [customerSearch, setCustomerSearch] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [limit, setLimit] = useState<number>(10);
  const [selectedInvoice, setSelectedInvoice] = useState<ReportInvoiceItem | null>(null);

  const { data: tenants = [] } = useTenantsList();
  const { data: branches = [] } = useBranches();

  const queryParams = useMemo(() => {
    return {
      preset,
      startDate: preset === 'custom' && startDate ? startDate : undefined,
      endDate: preset === 'custom' && endDate ? endDate : undefined,
      businessId: businessId !== 'all' ? businessId : undefined,
      cashierId: cashierId !== 'all' ? cashierId : undefined,
      branchId: branchId !== 'all' ? branchId : undefined,
      status: statusFilter !== 'ALL' ? (statusFilter as any) : undefined,
      customerName: customerSearch.trim() || undefined,
      page,
      limit,
    };
  }, [preset, startDate, endDate, businessId, cashierId, branchId, statusFilter, customerSearch, page, limit]);

  const { data: report, isLoading, isFetching, refetch } = useReportData(queryParams);
  const { data: cashiers = [] } = useReportCashiers(businessId !== 'all' ? businessId : undefined);

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
    setBranchId('all');
    setStatusFilter('ALL');
    setCustomerSearch('');
    setPage(1);
  };

  const handlePrintReportSheet = async () => {
    try {
      setIsPrintingSheet(true);
      const cleanParams: Record<string, any> = {};
      Object.entries(queryParams).forEach(([key, val]) => {
        if (val !== undefined && val !== null && val !== '' && val !== 'ALL') {
          cleanParams[key] = val;
        }
      });
      cleanParams.limit = 200;

      const response = await apiClient.get(API_ENDPOINTS.REPORTS.PDF, {
        params: cleanParams,
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);
      window.open(blobUrl, '_blank');
    } catch (err: any) {
      modal.alert(
        'Report Sheet Generation Failed',
        err?.response?.data?.message || err?.message || 'Unable to generate official report sheet. Please try again.',
        'error'
      );
    } finally {
      setIsPrintingSheet(false);
    }
  };

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
    (branchId !== 'all' ? 1 : 0) +
    (cashierId !== 'all' ? 1 : 0) +
    (statusFilter !== 'ALL' ? 1 : 0) +
    (customerSearch.trim() ? 1 : 0);

  return (
    <div className="space-y-6 pb-16 print:p-0 print:space-y-4">
      {/* HEADER SECTION */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-border/60 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
              Platform-Wide Reports & Financial Reconciliation
            </h1>
            <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/25 text-[10px] font-bold px-2 py-0.5 rounded-full">
              SUPER ADMIN
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1 max-w-2xl leading-relaxed">
            Consolidated platform audit, cross-tenant volume, multi-branch depot analysis, and global sales metrics.
          </p>
          {businessId !== 'all' && (
            <div className="mt-2">
              <Badge variant="outline" className="text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border-emerald-500/30">
                Filtered: {tenants.find((t) => t.id === businessId)?.businessName || 'Selected Business'}
              </Badge>
            </div>
          )}
        </div>

        {/* TOP ACTIONS */}
        <div className="flex items-center space-x-2.5 print:hidden">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching || isPrintingSheet}
            className="rounded-xl border-border hover:bg-secondary text-xs h-9"
          >
            <RefreshCw className={`h-3.5 w-3.5 mr-1.5 ${isFetching ? 'animate-spin text-primary' : ''}`} />
            Refresh
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handlePrintReportSheet}
            disabled={isPrintingSheet || isFetching}
            className="rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground text-xs font-semibold h-9 shadow-sm flex items-center space-x-1.5"
          >
            {isPrintingSheet ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Printer className="h-3.5 w-3.5" />
            )}
            <span>{isPrintingSheet ? 'Generating Sheet...' : 'Print Report Sheet'}</span>
          </Button>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2 border-t border-border/50">
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

            {/* Business Tenant Filter */}
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
                    setCashierId('all');
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

            {/* Branch Filter */}
            {branches.length > 0 && (
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                  <Store className="h-3 w-3 mr-1 text-primary" />
                  Branch / Depot
                </Label>
                <div className="relative">
                  <select
                    value={branchId}
                    onChange={(e) => {
                      setBranchId(e.target.value);
                      setPage(1);
                    }}
                    style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                    className="w-full h-9 pl-3 pr-8 rounded-xl text-xs bg-slate-900 border border-slate-700/80 text-slate-100 focus:outline-none focus:ring-1 focus:ring-primary shadow-inner cursor-pointer appearance-none truncate"
                  >
                    <option value="all" style={{ backgroundColor: '#0f172a', color: '#f8fafc' }} className="bg-slate-900 text-slate-100 font-bold">
                      All Branches
                    </option>
                    {branches.map((b) => (
                      <option
                        key={b.id}
                        value={b.id}
                        style={{ backgroundColor: '#0f172a', color: '#f8fafc' }}
                        className="bg-slate-900 text-slate-100"
                      >
                        {b.name} {b.isMain ? '★ (Main)' : ''}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="h-4 w-4 absolute right-2.5 top-2.5 text-slate-400 pointer-events-none" />
                </div>
              </div>
            )}

            {/* Cashier Filter */}
            <div className="space-y-1">
              <Label className="text-[11px] font-semibold text-muted-foreground flex items-center">
                <Users className="h-3 w-3 mr-1 text-primary" />
                Cashier / Staff
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
                    {businessId !== 'all' ? 'All Cashiers in Business' : 'All Platform Cashiers'}
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

            {/* Invoice Status Filter */}
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

      {/* SUMMARY KPI METRIC CARDS */}
      {!isLoading && report && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* 1. TOTAL FINALIZED REVENUE */}
          <Card className="rounded-2xl border-border bg-gradient-to-br from-card to-card/70 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-2xl group-hover:bg-emerald-500/20 transition-all pointer-events-none" />
            <CardContent className="p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider">
                  Platform Total Revenue
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
                  Total Platform Invoices
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
                  Drafts & Pipeline Value
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

      {/* CASHIER SHIFT RECONCILIATION BREAKDOWN */}
      {!isLoading && report && report.cashierStats.length > 0 && (
        <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
          <CardHeader className="pb-3 border-b border-border/60 bg-secondary/20">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-bold text-foreground flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  Platform Cashier Shifts & Breakdown
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Individual cashier performance, sales volume, and reconciliation across all businesses.
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

      {/* TOP CUSTOMERS LEADERBOARD & TIMELINE */}
      {!isLoading && report && report.topCustomers.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card className="rounded-2xl border-border bg-card shadow-sm lg:col-span-1">
            <CardHeader className="pb-3 border-b border-border/60 bg-secondary/20">
              <CardTitle className="text-sm font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Top Purchasing Customers
              </CardTitle>
              <CardDescription className="text-xs text-muted-foreground">
                Highest value buyers for this period across the platform.
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
                Platform Sales Velocity Breakdown
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

      {/* FILTERED INVOICES DETAILED TABLE */}
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
                          className="hover:underline text-primary cursor-pointer"
                        >
                          {inv.invoiceNumber}
                        </button>
                      </td>
                      <td className="py-3 px-4 text-muted-foreground font-mono text-[11px]">
                        {formatDate(inv.createdAt)}
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-semibold text-foreground">{inv.customerName}</p>
                        {inv.customerPhone && (
                          <p className="text-[10px] text-muted-foreground font-mono">{inv.customerPhone}</p>
                        )}
                      </td>
                      <td className="py-3 px-4 text-foreground font-medium">
                        {inv.cashierName || inv.creator?.name || 'N/A'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <Badge
                          className={`text-[10px] font-bold border-none ${
                            inv.status === 'FINALIZED'
                              ? 'bg-emerald-500/15 text-emerald-500'
                              : 'bg-amber-500/15 text-amber-500'
                          }`}
                        >
                          {inv.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-right font-mono text-muted-foreground">
                        {inv.itemsCount} item{inv.itemsCount !== 1 ? 's' : ''}
                      </td>
                      <td className="py-3 px-4 text-right font-mono font-bold text-foreground">
                        {formatCurrency(inv.totalAmount)}
                      </td>
                      <td className="py-3 px-4 text-center print:hidden">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedInvoice(inv)}
                          className="h-7 px-2 rounded-lg text-xs hover:bg-secondary text-muted-foreground hover:text-foreground"
                        >
                          <Eye className="h-3.5 w-3.5 mr-1" />
                          View
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* PAGINATION CONTROLS */}
          {report && report.pagination.totalPages > 1 && (
            <div className="p-4 border-t border-border flex items-center justify-between print:hidden">
              <span className="text-xs text-muted-foreground">
                Showing {((report.pagination.page - 1) * report.pagination.limit) + 1} to{' '}
                {Math.min(report.pagination.page * report.pagination.limit, report.pagination.total)} of{' '}
                {report.pagination.total} invoices
              </span>
              <Pagination
                currentPage={page}
                totalPages={report.pagination.totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* QUICK INVOICE DETAILS MODAL */}
      {selectedInvoice && (
        <Dialog open={Boolean(selectedInvoice)} onOpenChange={() => setSelectedInvoice(null)}>
          <DialogContent className="max-w-lg rounded-2xl bg-card border-border p-6 space-y-4">
            <DialogHeader className="border-b border-border pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <DialogTitle className="text-base font-bold text-foreground font-heading flex items-center space-x-2">
                    <span>Invoice {selectedInvoice.invoiceNumber}</span>
                    <Badge
                      className={`text-[10px] font-bold border-none ${
                        selectedInvoice.status === 'FINALIZED'
                          ? 'bg-emerald-500/15 text-emerald-500'
                          : 'bg-amber-500/15 text-amber-500'
                      }`}
                    >
                      {selectedInvoice.status}
                    </Badge>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground mt-0.5 font-mono">
                    Issued {formatDate(selectedInvoice.createdAt)}
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-3 text-xs">
              <div className="p-3 rounded-xl bg-secondary/30 border border-border/50 grid grid-cols-2 gap-2">
                <div>
                  <span className="text-muted-foreground font-medium">Customer:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedInvoice.customerName}</p>
                  {selectedInvoice.customerPhone && (
                    <p className="text-[11px] text-muted-foreground font-mono">{selectedInvoice.customerPhone}</p>
                  )}
                </div>
                <div>
                  <span className="text-muted-foreground font-medium">Cashier:</span>
                  <p className="font-bold text-foreground mt-0.5">{selectedInvoice.cashierName || selectedInvoice.creator?.name || 'Cashier'}</p>
                </div>
              </div>

              {/* Items List */}
              <div className="space-y-1.5">
                <span className="font-bold text-foreground uppercase tracking-wider text-[11px]">
                  Billed Items Breakdown ({selectedInvoice.items?.length || 0})
                </span>
                <div className="divide-y divide-border/60 border border-border/60 rounded-xl overflow-hidden bg-card">
                  {(selectedInvoice.items || []).map((it, idx) => (
                    <div key={idx} className="p-2.5 flex items-center justify-between">
                      <div className="min-w-0 pr-2">
                        <p className="font-semibold text-foreground truncate">{it.description}</p>
                        <p className="text-[10px] text-muted-foreground font-mono">
                          Qty: {it.quantity} {it.unit ? `(${it.unit})` : ''} • {formatCurrency(it.unitPrice)} each
                        </p>
                      </div>
                      <div className="font-mono font-bold text-foreground shrink-0">
                        {formatCurrency(it.totalAmount)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Total Row */}
              <div className="p-3 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-between">
                <span className="font-bold text-foreground">Grand Total Amount:</span>
                <span className="text-base font-black font-mono text-primary">
                  {formatCurrency(selectedInvoice.totalAmount)}
                </span>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

