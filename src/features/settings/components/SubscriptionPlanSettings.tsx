'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ShieldCheck,
  User,
  Sparkles,
  Globe,
  Building2,
  FileSpreadsheet,
  Activity,
  Receipt,
  Loader2,
  Calendar,
  Clock,
  AlertTriangle,
  AlertCircle,
} from 'lucide-react';
import { useSubscription } from '@/features/subscriptions/hooks/useSubscription';

export function SubscriptionPlanSettings() {
  const { data: subDetails, isLoading: isSubLoading } = useSubscription();

  const sub = subDetails?.subscription;
  const subPlan = sub?.plan || (subDetails as any)?.plan || 'STARTER';
  const staffCount = subDetails?.usage?.staffCount ?? (subDetails as any)?.activeStaffCount ?? 0;
  const maxStaffCount =
    subDetails?.usage?.maxStaffCount ??
    sub?.maxStaffCount ??
    (subDetails as any)?.staffLimit ??
    (subDetails as any)?.maxStaffCount ??
    3;
  const cashierCount = subDetails?.usage?.cashierCount ?? (subDetails as any)?.cashierCount ?? 0;
  const managerCount = subDetails?.usage?.managerCount ?? (subDetails as any)?.managerCount ?? 0;

  const aiExtractionEnabled = subDetails?.capabilities?.aiExtraction ?? true;
  const customDomainCapability =
    subDetails?.capabilities?.customDomain ??
    sub?.hasCustomDomain ??
    (subDetails as any)?.hasCustomDomain ??
    false;
  const multipleBranchesEnabled =
    subDetails?.capabilities?.multipleBranches ??
    sub?.hasMultipleBranches ??
    (subDetails as any)?.hasMultipleBranches ??
    false;
  const excelExportEnabled =
    subDetails?.capabilities?.excelExport ?? (subPlan === 'BUSINESS' || subPlan === 'ENTERPRISE');
  const activityLogsEnabled =
    subDetails?.capabilities?.activityLogs ?? (subPlan === 'BUSINESS' || subPlan === 'ENTERPRISE');

  // Subscription dates & expiration calculations
  const startDate = sub?.startDate;
  const effectiveEndDate = sub?.effectiveEndDate || sub?.endDate;
  const isInitialGrace = sub?.isInitialGrace;
  const isExpired = sub?.isExpired;
  const isExpiringSoon = sub?.isExpiringSoon;
  const hoursRemaining = sub?.hoursRemaining;
  const daysRemaining = sub?.daysRemaining;

  // Memoized effective remaining counts to ensure we never display a dash "—" when effectiveEndDate is available
  const effectiveDaysRemaining = React.useMemo(() => {
    if (typeof daysRemaining === 'number') return daysRemaining;
    if (typeof (subDetails as any)?.daysRemaining === 'number') return (subDetails as any).daysRemaining;
    if (!effectiveEndDate) return null;
    const diff = new Date(effectiveEndDate).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }, [daysRemaining, (subDetails as any)?.daysRemaining, effectiveEndDate]);

  const effectiveHoursRemaining = React.useMemo(() => {
    if (typeof hoursRemaining === 'number') return hoursRemaining;
    if (typeof (subDetails as any)?.hoursRemaining === 'number') return (subDetails as any).hoursRemaining;
    if (!effectiveEndDate) return 24;
    const diff = new Date(effectiveEndDate).getTime() - Date.now();
    return Math.max(0, Math.floor(diff / (1000 * 60 * 60)));
  }, [hoursRemaining, (subDetails as any)?.hoursRemaining, effectiveEndDate]);

  const formatDate = (dateStr?: string | null, includeTime = false) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

  return (
    <div className="space-y-6">
      {/* 1. URGENT EXPIRATION BANNERS */}
      {isExpired ? (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 flex items-start space-x-3.5 shadow-lg shadow-rose-500/5 animate-in fade-in">
          <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-rose-300">Subscription Suspended / Expired</h4>
            <p className="text-xs text-rose-200/80 leading-relaxed">
              Your organization subscription {isInitialGrace ? '24-hour setup grace window' : ''} expired on{' '}
              <strong className="text-white">{formatDate(effectiveEndDate, true)}</strong>. Invoice creation and staff
              actions are suspended. Please renew your subscription to reactivate full operations.
            </p>
          </div>
        </div>
      ) : isInitialGrace ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5 shadow-lg shadow-amber-500/5 animate-in fade-in">
          <Clock className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300">24-Hour Setup Grace Window Active</h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Welcome! Your workspace was registered on the <strong className="text-white">{subPlan}</strong> tier. You
              have <strong className="text-amber-300 font-mono">{effectiveHoursRemaining} hours remaining</strong> (until{' '}
              {formatDate(effectiveEndDate, true)}) to make your initial subscription payment from the Subscription tab before
              account suspension.
            </p>
          </div>
        </div>
      ) : isExpiringSoon ? (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-start space-x-3.5 shadow-lg shadow-amber-500/5 animate-in fade-in">
          <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-amber-300">
              Subscription Expiring Soon ({effectiveDaysRemaining} {effectiveDaysRemaining === 1 ? 'day' : 'days'} remaining)
            </h4>
            <p className="text-xs text-amber-200/80 leading-relaxed">
              Your <strong className="text-white">{subPlan}</strong> subscription is approaching its expiration on{' '}
              <strong className="text-white">{formatDate(effectiveEndDate)}</strong>. Please renew in the Subscription tab to
              guarantee uninterrupted billing for your business.
            </p>
          </div>
        </div>
      ) : null}

      {/* Subscription Dates Overview Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Calendar className="h-3.5 w-3.5 text-emerald-500" />
            <span>Day of Subscription</span>
          </div>
          <p className="text-xs sm:text-sm font-bold text-foreground font-mono">{formatDate(startDate)}</p>
        </div>

        <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <Clock className="h-3.5 w-3.5 text-amber-500" />
            <span>Date of Expiry</span>
          </div>
          <p
            className={`text-xs sm:text-sm font-bold font-mono ${
              isExpired ? 'text-rose-400' : isExpiringSoon || isInitialGrace ? 'text-amber-400' : 'text-foreground'
            }`}
          >
            {formatDate(effectiveEndDate, Boolean(isInitialGrace))}
          </p>
          <p className="text-[10px] text-muted-foreground">
            {isExpired
              ? 'Expired'
              : isInitialGrace
                ? `${effectiveHoursRemaining}h grace remaining`
                : effectiveDaysRemaining !== null
                  ? `${effectiveDaysRemaining} ${effectiveDaysRemaining === 1 ? 'day' : 'days'} remaining`
                  : 'Active'}
          </p>
        </div>

        <div className="p-3.5 rounded-xl border border-border/80 bg-card space-y-1">
          <div className="flex items-center space-x-2 text-xs text-muted-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
            <span>Subscription Status</span>
          </div>
          <div>
            {isExpired ? (
              <Badge className="bg-rose-500/20 border-rose-500/40 text-rose-400 text-[10px]">EXPIRED</Badge>
            ) : isInitialGrace ? (
              <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-[10px]">
                24H GRACE ({effectiveHoursRemaining}h left)
              </Badge>
            ) : isExpiringSoon ? (
              <Badge className="bg-amber-500/20 border-amber-500/40 text-amber-300 text-[10px]">
                EXPIRING IN {effectiveDaysRemaining}D
              </Badge>
            ) : (
              <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px]">ACTIVE</Badge>
            )}
          </div>
        </div>
      </div>
      {/* Plan & Quota Card */}
      <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Subscription Plan & Quotas
                </CardTitle>
                <CardDescription className="text-xs">
                  Active platform tier, staff limits, and feature capabilities.
                </CardDescription>
              </div>
            </div>

            {subDetails?.subscription && (
              <div className="flex items-center space-x-2">
                <Badge className="bg-emerald-500 text-white font-mono text-xs px-3 py-1">
                  {subDetails.subscription.plan} PLAN
                </Badge>
                {subDetails.subscription.billingMode === 'COMPLIMENTARY' && (
                  <Badge variant="outline" className="border-emerald-500/40 text-emerald-600 dark:text-emerald-400 text-xs">
                    COMPLIMENTARY ACCESS
                  </Badge>
                )}
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-6">
          {isSubLoading ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
            </div>
          ) : subDetails ? (
            <div className="space-y-6">
              {/* Quota Usage Bar */}
              <div className="p-4 rounded-xl border border-border/80 bg-slate-50/60 dark:bg-slate-900/50 space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-foreground flex items-center space-x-1.5">
                    <User className="h-3.5 w-3.5 text-emerald-500" />
                    <span>Staff Members Allocation</span>
                  </span>
                  <span className="font-mono font-bold text-emerald-600 dark:text-emerald-400">
                    {staffCount} of {maxStaffCount} staff registered
                  </span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (staffCount / Math.max(1, maxStaffCount)) * 100)}%`,
                    }}
                  />
                </div>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-muted-foreground mt-1 gap-1">
                  <p>
                    {subPlan === 'STARTER' &&
                      'Starter plan includes 3 total user accounts (1 business administrator + 2 cashiers). Extra seats: ₦2,000/seat/month.'}
                    {subPlan === 'BUSINESS' &&
                      'Business plan includes 5 total user accounts (1 business administrator + 4 cashiers). Extra seats: ₦2,000/seat/month.'}
                    {subPlan === 'ENTERPRISE' &&
                      'Enterprise plan includes 11 total user accounts (1 business admin + 2 branch managers + 8 cashiers) across 2 branches.'}
                  </p>
                  {(cashierCount > 0 || managerCount > 0) && (
                    <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">
                      Breakdown: {managerCount} branch {managerCount === 1 ? 'manager' : 'managers'}, {cashierCount}{' '}
                      {cashierCount === 1 ? 'cashier' : 'cashiers'}
                    </span>
                  )}
                </div>
              </div>

              {/* AI Document Scanning Quota Usage Bar */}
              {subDetails?.aiScans && (
                <div className="p-4 rounded-xl border border-border/80 bg-slate-50/60 dark:bg-slate-900/50 space-y-2">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-semibold text-foreground flex items-center space-x-1.5">
                      <Sparkles className="h-3.5 w-3.5 text-indigo-500" />
                      <span>AI Document Scanning Quota</span>
                    </span>
                    <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                      {subDetails.aiScans.used} of {subDetails.aiScans.limit} scans used (
                      {subDetails.aiScans.remaining} remaining)
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className="bg-indigo-500 h-full rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(
                          100,
                          (subDetails.aiScans.used / Math.max(1, subDetails.aiScans.limit)) * 100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-muted-foreground mt-1 gap-1">
                    <p>Monthly cycle quota. Resets every 30 days. Extra AI Vision scans pack: ₦5,000 for 100 scans.</p>
                    {subDetails.aiScans.resetAt && (
                      <span className="font-medium text-slate-500 dark:text-slate-400 shrink-0">
                        Cycle resets: {new Date(subDetails.aiScans.resetAt).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Feature Capabilities Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      aiExtractionEnabled
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">AI Document Scanner</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {subDetails?.aiScans?.limit ?? (subPlan === 'STARTER' ? 10 : subPlan === 'BUSINESS' ? 60 : 150)}{' '}
                      scans/month included (Extra pack: ₦5,000 for 100 scans)
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      customDomainCapability
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Globe className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Custom Branded Domain</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {customDomainCapability
                        ? 'Active — Use your custom business domain (e.g. pos.yourbrand.com)'
                        : 'Available on Business & Enterprise tiers'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      multipleBranchesEnabled
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Building2 className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Multi-Branch Locations</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {multipleBranchesEnabled
                        ? 'Active — Unlimited physical depots & branch managers'
                        : 'Exclusive to Enterprise tier'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      excelExportEnabled
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <FileSpreadsheet className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Full Excel / CSV Export</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {excelExportEnabled
                        ? 'Active — Unlimited filtered export of receipts & ledgers'
                        : 'Available on Business & Enterprise tiers'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 ${
                      activityLogsEnabled
                        ? 'bg-emerald-500/10 text-emerald-500'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-400'
                    }`}
                  >
                    <Activity className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Activity Audit Logs</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      {activityLogsEnabled
                        ? 'Active — Comprehensive audit trail of actions'
                        : 'Available on Business & Enterprise tiers'}
                    </p>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl border border-border/80 flex items-start space-x-3">
                  <div className="p-2 rounded-lg shrink-0 bg-emerald-500/10 text-emerald-500">
                    <Receipt className="h-4 w-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground">Thermal & A4 Print Templates</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">
                      Active on all plans with live preview & bespoke custom layouts.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-xs text-muted-foreground">Unable to load plan specifications at this time.</p>
          )}
        </CardContent>
      </Card>

      {/* Custom Domains Card */}
      {customDomainCapability && (
        <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
          <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Globe className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">Custom Domains</CardTitle>
                <CardDescription className="text-xs">
                  View active web domains and routing endpoints configured for this business workspace.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-4 sm:p-6 space-y-4">
            {(() => {
              const validDomains = (subDetails?.domains || []).filter(
                (d) => d.domain && !d.domain.endsWith('.localhost')
              );
              return (
                <div className="space-y-2 pt-2">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-semibold text-foreground">Active Registered Domains</h4>
                    <Badge variant="outline" className="text-[10px] text-muted-foreground border-border font-mono">
                      {validDomains.length} Registered
                    </Badge>
                  </div>
                  <div className="divide-y divide-border/80 border border-border/80 rounded-xl overflow-hidden">
                    {validDomains.length > 0 ? (
                      validDomains.map((d) => (
                        <div key={d.id} className="p-3.5 flex items-center justify-between bg-card text-xs">
                          <div className="flex items-center space-x-2.5">
                            <Globe className="h-4 w-4 text-emerald-500 shrink-0" />
                            <span className="font-mono font-medium text-foreground">{d.domain}</span>
                            {d.isPrimary && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-2 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/5"
                              >
                                Primary Platform Domain
                              </Badge>
                            )}
                            {d.isCustom && (
                              <Badge
                                variant="outline"
                                className="text-[10px] py-0 px-2 border-blue-500/30 text-blue-600 dark:text-blue-400 bg-blue-500/5"
                              >
                                Custom Brand Domain
                              </Badge>
                            )}
                          </div>

                          <div className="flex items-center space-x-2 text-[11px] text-muted-foreground font-mono">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            <span>Connected</span>
                          </div>
                        </div>
                      ))
                    ) : (
                      <div className="p-6 text-center text-xs text-muted-foreground">
                        No custom domains registered yet. Contact platform administration to attach your branded domain.
                      </div>
                    )}
                  </div>
                </div>
              );
            })()}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
