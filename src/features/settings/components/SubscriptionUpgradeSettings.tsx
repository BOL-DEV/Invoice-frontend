'use client';

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Sparkles, CheckCircle2 } from 'lucide-react';
import { useSubscription, useInitiateSubscriptionPayment } from '@/features/subscriptions/hooks/useSubscription';
import { useModal } from '@/components/ui/modal-provider';
import { getErrorDialog } from '@/lib/api-error';
import { DynamicBankTransferModal } from '@/components/subscriptions/DynamicBankTransferModal';

export function SubscriptionUpgradeSettings() {
  const modal = useModal();
  const { data: subDetails } = useSubscription();
  const subPlan = subDetails?.subscription?.plan || (subDetails as any)?.plan || 'STARTER';

  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [activePaymentData, setActivePaymentData] = useState<any>(null);

  const initiatePaymentMutation = useInitiateSubscriptionPayment();

  const getPlanPrice = (plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE', months: number) => {
    const monthlyRates = { STARTER: 6500, BUSINESS: 10500, ENTERPRISE: 20000 };
    const annualRates = { STARTER: 65000, BUSINESS: 105000, ENTERPRISE: 200000 };
    if (months === 12) {
      return { total: annualRates[plan], ratePerMonth: Math.round(annualRates[plan] / 12), isDiscounted: true };
    }
    const total = monthlyRates[plan] * months;
    return { total, ratePerMonth: monthlyRates[plan], isDiscounted: false };
  };

  const handleStartUpgrade = async (
    plan: 'STARTER' | 'BUSINESS' | 'ENTERPRISE',
    months: number = selectedMonths
  ) => {
    try {
      const cycle = months === 12 ? 'ANNUAL' : 'MONTHLY';
      const data = await initiatePaymentMutation.mutateAsync({ plan, billingCycle: cycle, months });
      setActivePaymentData(data);
      setIsPaymentModalOpen(true);
    } catch (err: any) {
      const { title, message, variant } = getErrorDialog(
        err,
        'Upgrade Initiation Failed',
        'Could not initiate your payment request.'
      );
      modal.alert(title, message, variant);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
                <Sparkles className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                  Upgrade or Renew Subscription
                </CardTitle>
                <CardDescription className="text-xs">
                  Instant activation via Lenco Dynamic Virtual Bank Transfer with zero onboarding fees.
                </CardDescription>
              </div>
            </div>

            {/* Billing Duration Controls */}
            <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
              {/* Preset Pills */}
              <div className="inline-flex items-center p-1 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                {[
                  { label: '1 Mo', months: 1 },
                  { label: '3 Mos', months: 3 },
                  { label: '6 Mos', months: 6 },
                  { label: '1 Year', months: 12, badge: '2 Mos Free' },
                ].map((preset) => (
                  <button
                    key={preset.months}
                    type="button"
                    onClick={() => setSelectedMonths(preset.months)}
                    className={`px-2.5 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 cursor-pointer ${
                      selectedMonths === preset.months
                        ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    <span>{preset.label}</span>
                    {preset.badge && (
                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                          selectedMonths === preset.months
                            ? 'bg-slate-950/20 text-slate-950'
                            : 'bg-emerald-400/20 text-emerald-300'
                        }`}
                      >
                        {preset.badge}
                      </span>
                    )}
                  </button>
                ))}
              </div>

              {/* Custom Month Stepper */}
              <div className="inline-flex items-center h-9 px-2.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-white">
                <span className="text-slate-400 mr-2 text-[11px]">Months:</span>
                <button
                  type="button"
                  disabled={selectedMonths <= 1}
                  onClick={() => setSelectedMonths((m) => Math.max(1, m - 1))}
                  className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold text-slate-200 transition-colors cursor-pointer"
                  title="Decrease months"
                >
                  -
                </button>
                <span className="w-8 text-center font-mono font-bold text-emerald-400 text-xs">
                  {selectedMonths}
                </span>
                <button
                  type="button"
                  disabled={selectedMonths >= 36}
                  onClick={() => setSelectedMonths((m) => Math.min(36, m + 1))}
                  className="h-6 w-6 rounded-md bg-slate-800 hover:bg-slate-700 disabled:opacity-40 flex items-center justify-center font-bold text-slate-200 transition-colors cursor-pointer"
                  title="Increase months"
                >
                  +
                </button>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Starter Card */}
            {(() => {
              const pricing = getPlanPrice('STARTER', selectedMonths);
              return (
                <div
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                    subPlan === 'STARTER'
                      ? 'border-emerald-500/60 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-border/80 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                        <h5 className="text-xl font-bold text-white mt-0.5">
                          ₦{pricing.total.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400">
                            {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                          </span>
                        </h5>
                        {pricing.isDiscounted && (
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦13,000)
                          </p>
                        )}
                      </div>
                      {subPlan === 'STARTER' && (
                        <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                          Active Tier
                        </Badge>
                      )}
                    </div>

                    <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>3 Users (1 Admin + 2 Cashiers)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>10 AI Scans / Month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Thermal & A4 Printable Invoices</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5">
                    <Button
                      size="sm"
                      disabled={initiatePaymentMutation.isPending}
                      onClick={() => handleStartUpgrade('STARTER', selectedMonths)}
                      className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                    >
                      {subPlan === 'STARTER'
                        ? `Renew Starter (${selectedMonths} ${
                            selectedMonths === 1 ? 'Mo' : 'Mos'
                          } • ₦${pricing.total.toLocaleString()})`
                        : `Select Starter (${selectedMonths} ${
                            selectedMonths === 1 ? 'Mo' : 'Mos'
                          } • ₦${pricing.total.toLocaleString()})`}
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* Business Card */}
            {(() => {
              const pricing = getPlanPrice('BUSINESS', selectedMonths);
              return (
                <div
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                    subPlan === 'BUSINESS'
                      ? 'border-emerald-500/60 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-border/80 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Business</span>
                        <h5 className="text-xl font-bold text-white mt-0.5">
                          ₦{pricing.total.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400">
                            {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                          </span>
                        </h5>
                        {pricing.isDiscounted && (
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦21,000)
                          </p>
                        )}
                      </div>
                      {subPlan === 'BUSINESS' ? (
                        <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                          Active Tier
                        </Badge>
                      ) : (
                        <span className="text-[10px] font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                          Popular
                        </span>
                      )}
                    </div>

                    <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>5 Users (1 Admin + 4 Cashiers)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>60 AI Scans / Month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Custom Domain + Excel Export</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5">
                    <Button
                      size="sm"
                      disabled={initiatePaymentMutation.isPending}
                      onClick={() => handleStartUpgrade('BUSINESS', selectedMonths)}
                      className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                    >
                      {subPlan === 'BUSINESS'
                        ? `Renew Business (${selectedMonths} ${
                            selectedMonths === 1 ? 'Mo' : 'Mos'
                          } • ₦${pricing.total.toLocaleString()})`
                        : `Upgrade to Business (${selectedMonths} ${
                            selectedMonths === 1 ? 'Mo' : 'Mos'
                          } • ₦${pricing.total.toLocaleString()})`}
                    </Button>
                  </div>
                </div>
              );
            })()}

            {/* Enterprise Card */}
            {(() => {
              const pricing = getPlanPrice('ENTERPRISE', selectedMonths);
              return (
                <div
                  className={`flex flex-col justify-between p-5 rounded-2xl border transition-all ${
                    subPlan === 'ENTERPRISE'
                      ? 'border-emerald-500/60 bg-emerald-500/[0.04] shadow-sm ring-1 ring-emerald-500/20'
                      : 'border-border/80 bg-slate-900/40 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise</span>
                        <h5 className="text-xl font-bold text-white mt-0.5">
                          ₦{pricing.total.toLocaleString()}
                          <span className="text-xs font-normal text-slate-400">
                            {selectedMonths === 1 ? ' / mo' : ` for ${selectedMonths} mos`}
                          </span>
                        </h5>
                        {pricing.isDiscounted && (
                          <p className="text-[11px] text-emerald-400 font-medium mt-0.5">
                            Effective: ₦{pricing.ratePerMonth.toLocaleString()}/mo (Save ₦40,000)
                          </p>
                        )}
                      </div>
                      {subPlan === 'ENTERPRISE' && (
                        <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[10px] px-2 py-0.5">
                          Active Tier
                        </Badge>
                      )}
                    </div>

                    <ul className="text-xs text-slate-300 space-y-2 pt-2 border-t border-slate-800/80">
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>11 Users (Owner + Sub-admins + 8 Cashiers)</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>150 AI Scans / Month</span>
                      </li>
                      <li className="flex items-center space-x-2">
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                        <span>Multi-Branch Real-Time Control & Audits</span>
                      </li>
                    </ul>
                  </div>

                  <div className="pt-5">
                    <Button
                      size="sm"
                      disabled={initiatePaymentMutation.isPending}
                      onClick={() => handleStartUpgrade('ENTERPRISE', selectedMonths)}
                      className="w-full text-xs h-10 rounded-xl font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 transition-all cursor-pointer shadow-sm"
                    >
                      {subPlan === 'ENTERPRISE'
                        ? `Renew Enterprise (${selectedMonths} ${
                            selectedMonths === 1 ? 'Mo' : 'Mos'
                          } • ₦${pricing.total.toLocaleString()})`
                        : `Upgrade to Enterprise (${selectedMonths} ${
                            selectedMonths === 1 ? 'Mo' : 'Mos'
                          } • ₦${pricing.total.toLocaleString()})`}
                    </Button>
                  </div>
                </div>
              );
            })()}
          </div>
        </CardContent>
      </Card>

      {/* Lenco Dynamic Bank Transfer Modal */}
      <DynamicBankTransferModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        paymentData={activePaymentData}
        onSuccess={() => {
          setIsPaymentModalOpen(false);
        }}
      />
    </div>
  );
}
