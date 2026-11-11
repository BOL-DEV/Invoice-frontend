'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { useModal } from '../../../components/ui/modal-provider';
import {
  CreditCard,
  Save,
  RotateCcw,
  Loader2,
  Zap,
  Building,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface TierPricing {
  monthlyPrice: number;
  annualPrice: number;
}

interface GlobalPricingData {
  STARTER: TierPricing;
  BUSINESS: TierPricing;
  ENTERPRISE: TierPricing;
}

const DEFAULT_PRICING: GlobalPricingData = {
  STARTER: { monthlyPrice: 6500, annualPrice: 65000 },
  BUSINESS: { monthlyPrice: 10500, annualPrice: 105000 },
  ENTERPRISE: { monthlyPrice: 20000, annualPrice: 200000 },
};

export function GlobalPricingSettings() {
  const modal = useModal();
  const queryClient = useQueryClient();

  const [formData, setFormData] = useState<GlobalPricingData>(DEFAULT_PRICING);
  const [hasChanges, setHasChanges] = useState(false);

  const { data: pricingData, isLoading, isError } = useQuery<GlobalPricingData>({
    queryKey: ['globalPricing'],
    queryFn: async () => {
      const res = await apiClient.get(API_ENDPOINTS.SUBSCRIPTIONS.GLOBAL_PRICING);
      return res.data?.data;
    },
  });

  useEffect(() => {
    if (pricingData) {
      setFormData({
        STARTER: {
          monthlyPrice: pricingData.STARTER?.monthlyPrice ?? DEFAULT_PRICING.STARTER.monthlyPrice,
          annualPrice: pricingData.STARTER?.annualPrice ?? DEFAULT_PRICING.STARTER.annualPrice,
        },
        BUSINESS: {
          monthlyPrice: pricingData.BUSINESS?.monthlyPrice ?? DEFAULT_PRICING.BUSINESS.monthlyPrice,
          annualPrice: pricingData.BUSINESS?.annualPrice ?? DEFAULT_PRICING.BUSINESS.annualPrice,
        },
        ENTERPRISE: {
          monthlyPrice: pricingData.ENTERPRISE?.monthlyPrice ?? DEFAULT_PRICING.ENTERPRISE.monthlyPrice,
          annualPrice: pricingData.ENTERPRISE?.annualPrice ?? DEFAULT_PRICING.ENTERPRISE.annualPrice,
        },
      });
      setHasChanges(false);
    }
  }, [pricingData]);

  const updateMutation = useMutation({
    mutationFn: async (payload: GlobalPricingData) => {
      const res = await apiClient.put(API_ENDPOINTS.SUBSCRIPTIONS.UPDATE_GLOBAL_PRICING, payload);
      return res.data?.data;
    },
    onSuccess: (updated) => {
      queryClient.setQueryData(['globalPricing'], updated);
      setHasChanges(false);
      modal.alert(
        'Pricing Rates Saved',
        'Platform baseline subscription plans and billing rates have been updated successfully.',
        'success'
      );
    },
    onError: (err: any) => {
      modal.alert(
        'Failed to Update Pricing',
        err.response?.data?.message || 'Could not save pricing configuration. Please try again.',
        'error'
      );
    },
  });

  const handlePriceChange = (
    tier: keyof GlobalPricingData,
    cycle: 'monthlyPrice' | 'annualPrice',
    rawVal: string
  ) => {
    const val = parseInt(rawVal.replace(/[^0-9]/g, ''), 10) || 0;
    setFormData((prev) => ({
      ...prev,
      [tier]: {
        ...prev[tier],
        [cycle]: val,
      },
    }));
    setHasChanges(true);
  };

  const handleResetDefaults = async () => {
    const confirmed = await modal.confirm(
      'Reset to Factory Defaults?',
      'Are you sure you want to revert global baseline rates to the default values (₦6,500 Starter, ₦10,500 Business, ₦20,000 Enterprise)?',
      'Reset Defaults',
      'Cancel'
    );
    if (confirmed) {
      setFormData(DEFAULT_PRICING);
      setHasChanges(true);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateMutation.mutate(formData);
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-16 space-y-3">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        <p className="text-xs text-muted-foreground">Loading platform pricing configuration...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="p-6 rounded-xl border border-destructive/30 bg-destructive/5 text-destructive space-y-2">
        <div className="flex items-center gap-2 font-semibold">
          <AlertCircle className="h-5 w-5" />
          <span>Error loading pricing</span>
        </div>
        <p className="text-xs opacity-90">Failed to load platform subscription rates. Please reload the page.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Overview Card */}
      <Card className="border border-border/80 bg-card shadow-sm">
        <CardHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                <CreditCard className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-base sm:text-lg font-bold text-foreground">
                  Global Subscription Pricing
                </CardTitle>
                <CardDescription className="text-xs text-muted-foreground">
                  Manage standard monthly and annual baseline pricing across all tenant tiers.
                </CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="border-emerald-500/30 text-emerald-500 bg-emerald-500/5 text-[11px] font-semibold">
              Platform Master
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4 text-xs text-muted-foreground leading-relaxed">
          <div className="flex items-start gap-2.5 p-3 rounded-lg bg-secondary/50 border border-border/70 text-secondary-foreground">
            <HelpCircle className="h-4 w-4 shrink-0 text-emerald-500 mt-0.5" />
            <span>
              These global baseline rates apply to all business tenants selecting or renewing subscriptions.
              Individual businesses can also have tailored monthly and annual pricing overridden directly inside their tenant profile.
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Pricing Tier Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Starter Plan */}
        <Card className="border border-border/80 bg-card hover:border-emerald-500/40 transition-colors shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-500 border border-blue-500/20">
                    <Zap className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">Starter Tier</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-mono">Solo/Micro</Badge>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground mt-1">
                Standard package for small retail shops and single depots.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Monthly Rate (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">₦</span>
                  <Input
                    type="text"
                    className="pl-7 font-mono font-bold"
                    value={formData.STARTER.monthlyPrice.toLocaleString('en-US')}
                    onChange={(e) => handlePriceChange('STARTER', 'monthlyPrice', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Annual Rate (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">₦</span>
                  <Input
                    type="text"
                    className="pl-7 font-mono font-bold"
                    value={formData.STARTER.annualPrice.toLocaleString('en-US')}
                    onChange={(e) => handlePriceChange('STARTER', 'annualPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>3 Total Users (1 Admin + 2 Cashiers)</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>10 AI Scans / Month</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Thermal & A4 Printable Invoices</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Business Plan */}
        <Card className="border border-border/80 bg-card hover:border-emerald-500/40 transition-colors shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                    <Building className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">Business Tier</CardTitle>
                </div>
                <Badge className="bg-emerald-500/15 text-emerald-500 border border-emerald-500/30 text-[10px] uppercase font-mono">Popular</Badge>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground mt-1">
                Expanded volume with custom domain branding & reporting.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Monthly Rate (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">₦</span>
                  <Input
                    type="text"
                    className="pl-7 font-mono font-bold"
                    value={formData.BUSINESS.monthlyPrice.toLocaleString('en-US')}
                    onChange={(e) => handlePriceChange('BUSINESS', 'monthlyPrice', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Annual Rate (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">₦</span>
                  <Input
                    type="text"
                    className="pl-7 font-mono font-bold"
                    value={formData.BUSINESS.annualPrice.toLocaleString('en-US')}
                    onChange={(e) => handlePriceChange('BUSINESS', 'annualPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>5 Total Users (1 Admin + 4 Cashiers)</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>60 AI Scans / Month</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Custom Branded Domain + Excel Export</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>

        {/* Enterprise Plan */}
        <Card className="border border-border/80 bg-card hover:border-emerald-500/40 transition-colors shadow-sm flex flex-col justify-between">
          <div>
            <CardHeader className="pb-3 border-b border-border/50">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="p-1.5 rounded-lg bg-purple-500/10 text-purple-500 border border-purple-500/20">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <CardTitle className="text-sm font-bold text-foreground">Enterprise Tier</CardTitle>
                </div>
                <Badge variant="outline" className="text-[10px] uppercase font-mono border-purple-500/30 text-purple-400">Multi-Branch</Badge>
              </div>
              <CardDescription className="text-[11px] text-muted-foreground mt-1">
                Highest capacity with multi-depot branch support & audits.
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-4 space-y-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Monthly Rate (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">₦</span>
                  <Input
                    type="text"
                    className="pl-7 font-mono font-bold"
                    value={formData.ENTERPRISE.monthlyPrice.toLocaleString('en-US')}
                    onChange={(e) => handlePriceChange('ENTERPRISE', 'monthlyPrice', e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold text-foreground">Annual Rate (₦)</Label>
                <div className="relative">
                  <span className="absolute left-3 top-2.5 text-xs font-bold text-muted-foreground">₦</span>
                  <Input
                    type="text"
                    className="pl-7 font-mono font-bold"
                    value={formData.ENTERPRISE.annualPrice.toLocaleString('en-US')}
                    onChange={(e) => handlePriceChange('ENTERPRISE', 'annualPrice', e.target.value)}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-border/50 space-y-1.5 text-[11px] text-muted-foreground">
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>11 Users (Owner + Sub-admins + 8 Cashiers)</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>150 AI Scans / Month</span>
                </div>
                <div className="flex items-center gap-1.5 text-foreground/80 font-medium">
                  <CheckCircle2 className="h-3 w-3 text-emerald-500 shrink-0" />
                  <span>Multi-Branch Real-Time Control & Audits</span>
                </div>
              </div>
            </CardContent>
          </div>
        </Card>
      </div>

      {/* Action Footer */}
      <Card className="border border-border/80 bg-card shadow-sm">
        <CardFooter className="py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleResetDefaults}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5 mr-1.5" />
              Revert to Defaults
            </Button>
          </div>

          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-[11px] text-amber-500 font-medium">
                Unsaved pricing changes
              </span>
            )}
            <Button
              type="submit"
              disabled={updateMutation.isPending || !hasChanges}
              className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-4 cursor-pointer"
            >
              {updateMutation.isPending ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  Saving Rates...
                </>
              ) : (
                <>
                  <Save className="h-3.5 w-3.5 mr-1.5" />
                  Save Global Rates
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </form>
  );
}
