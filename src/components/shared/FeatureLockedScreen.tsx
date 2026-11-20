'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Lock, Sparkles, ArrowRight, CheckCircle2 } from 'lucide-react';

interface FeatureLockedScreenProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  featureBenefits: string[];
  headerTitle: string;
  headerDescription: string;
}

export const FeatureLockedScreen: React.FC<FeatureLockedScreenProps> = ({
  title,
  description,
  icon,
  featureBenefits,
  headerTitle,
  headerDescription,
}) => {
  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-border/60">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-foreground font-heading">
            {headerTitle}
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {headerDescription}
          </p>
        </div>
      </div>

      {/* Feature Locked Hero Card */}
      <Card className="border-border bg-card shadow-lg rounded-2xl overflow-hidden relative">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-emerald-500/10 via-primary/5 to-transparent rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />

        <div className="p-8 sm:p-14 text-center max-w-2xl mx-auto space-y-6 relative z-10">
          {/* Badge & Lock Icon */}
          <div className="inline-flex flex-col items-center space-y-3">
            <div className="relative">
              <div className="p-4 bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 rounded-2xl border border-emerald-500/20 shadow-sm">
                <Lock className="h-8 w-8" />
              </div>
              <div className="absolute -top-1.5 -right-1.5 p-1 bg-amber-500 text-white rounded-full shadow-sm">
                <Sparkles className="h-3 w-3" />
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-semibold px-3 py-1 text-xs uppercase tracking-wider">
              Business & Enterprise Plan Feature
            </Badge>
          </div>

          {/* Title & Description */}
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-foreground font-heading">
              {title}
            </h2>
            <p className="text-sm text-muted-foreground max-w-lg mx-auto leading-relaxed">
              {description}
            </p>
          </div>

          {/* Feature Highlights Grid */}
          <div className="p-4 sm:p-5 rounded-2xl bg-secondary/50 border border-border/80 text-left space-y-2.5 max-w-lg mx-auto">
            <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              What you unlock with Business & Enterprise:
            </p>
            <div className="space-y-2">
              {featureBenefits.map((benefit, idx) => (
                <div key={idx} className="flex items-start space-x-2 text-xs text-foreground/90">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500 shrink-0 mt-0.5" />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Action CTAs */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href="/settings?tab=subscription" className="w-full sm:w-auto">
              <Button className="w-full sm:w-auto font-semibold px-6 py-2.5 h-11 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center space-x-2">
                <span>Upgrade to Business Plan</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/invoices" className="w-full sm:w-auto">
              <Button variant="outline" className="w-full sm:w-auto font-semibold h-11 px-5 rounded-xl cursor-pointer">
                Back to Invoices
              </Button>
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
};
