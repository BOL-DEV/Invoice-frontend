'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../../features/auth/schemas';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { normalizeApiError, applyApiFieldErrors, NormalizedError } from '../../../lib/api-error';
import {
  Building2,
  Clock,
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  ShieldCheck,
  FileText,
  Printer,
  AlertCircle,
  WifiOff,
  HelpCircle,
  CheckCircle2,
  X,
} from 'lucide-react';

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const isExpired = searchParams.get('reason') === 'expired';
  const { login } = useAuth();
  const [errorState, setErrorState] = useState<NormalizedError | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showHelpModal, setShowHelpModal] = useState(false);

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setErrorState(null);
    try {
      await login(data);
      // Retrieve role to determine redirection path
      const savedUser = localStorage.getItem('user_details');
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        if (userObj.role === 'ADMIN') {
          router.push('/');
        } else {
          router.push('/invoices');
        }
      } else {
        router.push('/invoices');
      }
    } catch (err) {
      console.error('Login failure:', err);
      const normalized = normalizeApiError(err);
      setErrorState(normalized);
      // Auto-assign any server field errors directly to inputs
      applyApiFieldErrors(normalized, setError);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-[#F8FAFC] dark:bg-[#030712] text-[#0F172A] dark:text-[#F8FAFC]">
      {/* ========================================================= */}
      {/* LEFT HERO PANEL (Visible on Desktop / Large screens)       */}
      {/* ========================================================= */}
      <div className="hidden lg:flex lg:w-1/2 xl:w-5/12 relative flex-col justify-between p-12 bg-[#0B0F19] text-white overflow-hidden border-r border-slate-800/80">
        {/* Ambient Glows */}
        <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#10B981]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 bg-emerald-600/10 rounded-full blur-3xl pointer-events-none" />
        
        {/* Subtle Geometric Overlay */}
        <div 
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '32px 32px'
          }}
        />

        {/* Top Branding */}
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-medium mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>LSV Billing & Logistics Gateway</span>
          </div>

          <div className="flex items-center space-x-3.5 mb-3">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-emerald-400 to-[#059669] flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Building2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white font-heading">
                Lao Steel Ventures
              </h1>
              <p className="text-xs text-slate-400 font-mono tracking-wider uppercase">
                Enterprise Invoice Generator
              </p>
            </div>
          </div>
          <p className="text-sm text-slate-300/90 leading-relaxed max-w-md mt-4">
            Industrial-grade billing system built for high-volume steel distribution, accurate tonnage computing, and audit-proof ledger tracking.
          </p>
        </div>

        {/* Value Proposition Badges */}
        <div className="relative z-10 space-y-4 my-8">
          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <FileText className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Dynamic Line-Item Calculation</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Automated tonnage, custom charges, and compliant 7.5% VAT / 2% WHT rates.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Dual-Role Anti-Fraud Protection</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Strict reprint approval gates to eliminate unauthorized duplicate receipts.</p>
            </div>
          </div>

          <div className="flex items-start space-x-3.5 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-sm">
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 shrink-0">
              <Printer className="h-5 w-5" />
            </div>
            <div>
              <h4 className="text-xs font-semibold text-white">Multi-Format Vector Documents</h4>
              <p className="text-[11px] text-slate-400 mt-0.5">Instant branded PDF, sharp 2x PNG rasterization, and spreadsheet exports.</p>
            </div>
          </div>
        </div>

        {/* Bottom Status / Footer */}
        <div className="relative z-10 pt-6 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400 font-mono">
          <div className="flex items-center space-x-2">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span>Secure TLS 1.3 Active</span>
          </div>
          <span>v2.4.0 • Depot Hub</span>
        </div>
      </div>

      {/* ========================================================= */}
      {/* RIGHT AUTH FORM PANEL                                     */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 xl:w-7/12 flex items-center justify-center p-6 sm:p-10 lg:p-16">
        <div className="w-full max-w-[440px] space-y-7">
          
          {/* Mobile Header Branding (Visible on mobile & tablets only) */}
          <div className="lg:hidden flex flex-col items-center text-center space-y-3 mb-6">
            <div className="h-12 w-12 rounded-2xl bg-[#10B981] flex items-center justify-center shadow-lg shadow-emerald-500/20 text-white">
              <Building2 className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">
                Lao Steel Ventures
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">Invoice Generator</p>
            </div>
          </div>

          {/* Form Header */}
          <div className="space-y-1.5">
            <h2 className="text-2xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">
              Sign In
            </h2>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Enter your authorized email and password to access the billing ledger.
            </p>
          </div>

          {/* Session Expired Notice */}
          {isExpired && !errorState && (
            <div className="p-4 rounded-xl border flex items-start space-x-3 text-xs bg-amber-500/10 border-amber-500/25 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5 shrink-0 mt-0.5" />
              <div className="space-y-1 flex-1">
                <p className="font-bold text-xs">Session Expired</p>
                <p className="text-[11px] leading-relaxed opacity-95">
                  Your previous session timed out due to 30 minutes of inactivity. Please sign in again.
                </p>
              </div>
            </div>
          )}

          {/* Error Banner */}
          {errorState && (
            <div className="p-4 rounded-xl border flex items-start space-x-3 text-xs animate-in fade-in slide-in-from-top-2 duration-200 bg-rose-500/10 border-rose-500/25 text-rose-600 dark:text-rose-400">
              {errorState.isNetworkError ? (
                <WifiOff className="h-5 w-5 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              )}
              <div className="space-y-1 flex-1">
                <p className="font-bold text-xs">{errorState.title}</p>
                <p className="text-[11px] leading-relaxed opacity-95">{errorState.message}</p>
              </div>
            </div>
          )}

          {/* Authentication Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* Email Field */}
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Email Address
              </Label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="email"
                  type="email"
                  placeholder="cashier@laosteel.com"
                  autoComplete="email"
                  autoFocus
                  {...register('email')}
                  className="bg-white dark:bg-slate-900/80 pl-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-[#10B981] transition-all"
                />
              </div>
              {errors.email && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center space-x-1">
                  <span>•</span>
                  <span>{errors.email.message}</span>
                </p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Password
                </Label>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Enter your password"
                  autoComplete="current-password"
                  {...register('password')}
                  className="bg-white dark:bg-slate-900/80 pl-10 pr-10 h-11 rounded-xl border-slate-200 dark:border-slate-800 text-xs focus:ring-2 focus:ring-[#10B981] transition-all"
                />
                <button
                  type="button"
                  tabIndex={-1}
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-slate-900 dark:hover:text-white transition-colors p-1.5 rounded-lg focus:outline-none"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
              {errors.password && (
                <p className="text-[11px] text-rose-500 font-medium mt-1 flex items-center space-x-1">
                  <span>•</span>
                  <span>{errors.password.message}</span>
                </p>
              )}
            </div>

            {/* Remember Me Checkbox */}
            <div className="flex items-center justify-between pt-1">
              <label htmlFor="rememberMe" className="flex items-center space-x-2.5 cursor-pointer select-none">
                <input
                  id="rememberMe"
                  type="checkbox"
                  {...register('rememberMe')}
                  className="h-4 w-4 rounded-md border-border text-emerald-500 focus:ring-emerald-500/40 bg-card transition-colors cursor-pointer"
                />
                <span className="text-xs text-muted-foreground hover:text-foreground transition-colors font-medium">
                  Remember me for 7 days
                </span>
              </label>
              <span className="text-[11px] text-muted-foreground/70">
                (Standard: 8h shift)
              </span>
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-gradient-to-r from-emerald-500 to-[#059669] hover:from-emerald-600 hover:to-[#047857] text-white font-bold transition-all duration-200 rounded-xl text-xs shadow-lg shadow-emerald-500/20 active:scale-[0.99] flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin text-white" />
                  <span>Verifying credentials...</span>
                </>
              ) : (
                <span>Sign In to Billing</span>
              )}
            </Button>
          </form>

          {/* Need Assistance Trigger */}
          <div className="pt-4 border-t border-slate-200/80 dark:border-slate-800/80 flex items-center justify-between text-xs text-muted-foreground">
            <button
              type="button"
              onClick={() => setShowHelpModal(true)}
              className="inline-flex items-center space-x-1.5 hover:text-[#10B981] transition-colors cursor-pointer text-[11px]"
            >
              <HelpCircle className="h-3.5 w-3.5" />
              <span>Need help signing in?</span>
            </button>
            <span className="text-[11px] font-mono select-none">Lao Steel Ventures</span>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* HELP / CONTACT DEPOT MODAL                                */}
      {/* ========================================================= */}
      {showHelpModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#0F172A] dark:text-[#F8FAFC]">
                <HelpCircle className="h-5 w-5 text-emerald-500" />
                <h3 className="font-bold text-sm">Depot Access Assistance</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowHelpModal(false)}
                className="text-muted-foreground hover:text-foreground p-1 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            
            <p className="text-xs text-muted-foreground leading-relaxed">
              If you have forgotten your password or your account is locked, please notify your shift supervisor or system administrator directly:
            </p>

            <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl border border-slate-200/80 dark:border-slate-700/60 text-xs space-y-1.5 font-mono">
              <p><span className="text-muted-foreground">Depot Helpdesk:</span> ext. 104 / 108</p>
              <p><span className="text-muted-foreground">Admin Email:</span> admin@laosteel.com</p>
              <p><span className="text-muted-foreground">Office:</span> Factory Depot Admin Wing</p>
            </div>

            <Button
              type="button"
              onClick={() => setShowHelpModal(false)}
              className="w-full bg-slate-900 dark:bg-slate-800 text-white rounded-xl text-xs h-9 hover:bg-slate-800"
            >
              Understood
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}


export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-950 flex items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
        </div>
      }
    >
      <LoginForm />
    </Suspense>
  );
}
