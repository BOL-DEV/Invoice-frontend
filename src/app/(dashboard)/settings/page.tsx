'use client';

import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useAuth } from '@/features/auth/context/AuthContext';
import { usePermission } from '@/features/auth/hooks/usePermission';
import { User, Building2, ShieldCheck, CreditCard, Loader2 } from 'lucide-react';
import { useSubscription } from '@/features/subscriptions/hooks/useSubscription';
import {
  UserProfileSettings,
  CompanyBusinessSettings,
  SubscriptionPlanSettings,
  SubscriptionUpgradeSettings,
  GlobalPricingSettings,
} from '@/features/settings/components';

export default function SettingsPage() {
  const { user } = useAuth();
  const { isAdmin, isLoading: isAuthLoading } = usePermission();

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const isBranchScoped = Boolean(user?.branchId);
  const isApprentice = user?.role === 'APPRENTICE';
  // A user is a Main Admin if they are ADMIN without a branch restriction
  const isMainAdmin = (isAdmin && !isBranchScoped) || isSuperAdmin;

  // For Main Admin, manage active tab
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState<'profile' | 'business' | 'subscription' | 'upgrade'>(() => {
    if (tabParam === 'subscription' || tabParam === 'upgrade') return 'upgrade';
    if (tabParam === 'plan') return 'subscription';
    if (tabParam === 'business' || tabParam === 'company') return 'business';
    return 'profile';
  });

  useEffect(() => {
    if (tabParam === 'subscription' || tabParam === 'upgrade') {
      setActiveTab('upgrade');
    } else if (tabParam === 'plan') {
      setActiveTab('subscription');
    } else if (tabParam === 'business' || tabParam === 'company') {
      setActiveTab('business');
    }
  }, [tabParam]);

  // Load subscription only for Main Admin to check if complimentary tier hides upgrade tab
  const { data: subDetails } = useSubscription();
  const subMode = subDetails?.subscription?.billingMode || (subDetails as any)?.billingMode;
  const isComplimentary = subMode === 'COMPLIMENTARY';

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Cashier or Sub-Admin (Branch Manager):
  // Strictly profile only! No unnecessary company or billing overhead.
  if (isApprentice || isBranchScoped) {
    return (
      <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-border/60">
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
              Settings & Security
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage your personal credentials, contact email, and password security.
            </p>
          </div>
        </div>

        {user && <UserProfileSettings user={user} />}
      </div>
    );
  }

  // Main Admin & Super Admin View
  return (
    <div className="space-y-4 sm:space-y-6 max-w-4xl mx-auto">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-1 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            Settings & Security
          </h1>
          <p className="text-xs text-muted-foreground mt-0.5">
            Manage your personal profile, account credentials, {isSuperAdmin ? 'and global subscription rates.' : 'company profile, and subscription quotas.'}
          </p>
        </div>
      </div>

      {/* Modern Segmented Control */}
      <div
        className={`p-1 rounded-xl bg-secondary/70 dark:bg-slate-900/80 border border-border/80 grid ${
          isSuperAdmin
            ? 'grid-cols-2 max-w-xs'
            : isComplimentary
            ? 'grid-cols-3 max-w-md'
            : 'grid-cols-4 max-w-xl'
        } gap-1 w-full`}
      >
        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          <User className="h-3.5 w-3.5 shrink-0" />
          <span className="truncate">Profile</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('business')}
          className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeTab === 'business'
              ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
              : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
          }`}
        >
          {isSuperAdmin ? (
            <>
              <CreditCard className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Global Pricing</span>
            </>
          ) : (
            <>
              <Building2 className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">Company</span>
            </>
          )}
        </button>

        {!isSuperAdmin && (
          <button
            type="button"
            onClick={() => setActiveTab('subscription')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'subscription'
                ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Plan & Quotas</span>
          </button>
        )}

        {!isSuperAdmin && !isComplimentary && (
          <button
            type="button"
            onClick={() => setActiveTab('upgrade')}
            className={`flex items-center justify-center space-x-2 py-2 px-3 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'upgrade'
                ? 'bg-card text-foreground shadow-sm border border-border/60 text-emerald-600 dark:text-emerald-400 font-bold'
                : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
            }`}
          >
            <CreditCard className="h-3.5 w-3.5 shrink-0" />
            <span className="truncate">Subscription</span>
          </button>
        )}
      </div>

      {/* Tab Panels */}
      {activeTab === 'profile' && user && <UserProfileSettings user={user} />}
      {activeTab === 'business' && (isSuperAdmin ? <GlobalPricingSettings /> : <CompanyBusinessSettings />)}
      {activeTab === 'subscription' && !isSuperAdmin && <SubscriptionPlanSettings />}
      {activeTab === 'upgrade' && !isSuperAdmin && !isComplimentary && <SubscriptionUpgradeSettings />}
      {activeTab === 'subscription' && !isSuperAdmin && <SubscriptionPlanSettings />}
      {activeTab === 'upgrade' && !isSuperAdmin && !isComplimentary && <SubscriptionUpgradeSettings />}
    </div>
  );
}
