'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '../features/auth/context/AuthContext';
import {
  ShieldCheck,
  Printer,
  Layers,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Building2,
  MessageCircle,
  Clock,
  Menu,
  X,
  AlertTriangle,
  ScanLine,
} from 'lucide-react';
import { Button } from '../components/ui/button';

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // FAQ state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const getWhatsAppPlanLink = (planName: string, monthlyPrice: number, annualPrice: number) => {
    const priceText = billingCycle === 'monthly' ? `₦${monthlyPrice.toLocaleString()}/month` : `₦${annualPrice.toLocaleString()}/year`;
    const text = encodeURIComponent(
      `Hello BOLXolve Team, I would like to get started on the ${planName} plan (${priceText}) with free onboarding.`
    );
    return `https://wa.me/2348000000000?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#0B0F19] text-white font-sans antialiased selection:bg-emerald-500 selection:text-slate-950">

      {/* ========================================================= */}
      {/* TOP USER BANNER (IF LOGGED IN)                            */}
      {/* ========================================================= */}
      {user && (
        <div className="bg-slate-900 border-b border-slate-800 text-slate-300 py-2.5 px-4 text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>Active session: <strong>{user.firstName || 'User'}</strong> ({user.role})</span>
          </div>
          <Link href="/dashboard" className="inline-flex items-center space-x-1.5 font-semibold text-emerald-400 hover:text-emerald-300">
            <span>Go to Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* MINIMAL NAVBAR (WITH NEW PYTHON-DESIGNED LOGO)            */}
      {/* ========================================================= */}
      <header className="sticky top-0 z-40 bg-[#0B0F19]/90 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between">

          {/* Official Platform Logo (Standalone Unboxed Isometric Cube) */}
          <Link href="/" className="flex items-center space-x-3.5 group">
            <Image
              src="/platform-logo.svg"
              alt="BOLXolve Platform Logo"
              width={52}
              height={52}
              className="h-11 w-11 sm:h-12 sm:w-12 object-contain group-hover:scale-105 transition-transform"
              priority
            />
            <span className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              BOLXolve <span className="text-emerald-400 font-semibold">Invoice</span>
            </span>
          </Link>

          {/* Clean Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-400">
            <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
            <a href="#anti-theft" className="hover:text-white transition-colors">Anti-Theft</a>
            <a href="#pricing" className="hover:text-white transition-colors">Pricing</a>
            <a href="#faq" className="hover:text-white transition-colors">FAQ</a>
          </nav>

          {/* Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">
              Sign In
            </Link>
            <a href="#pricing">
              <Button className="h-10 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg px-4 transition-all">
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 text-slate-400 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* Mobile dropdown */}
        {mobileMenuOpen && (
          <div className="md:hidden border-b border-slate-800 bg-[#0B0F19] px-4 py-4 space-y-3">
            <a href="#how-it-works" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 py-1">How It Works</a>
            <a href="#anti-theft" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 py-1">Anti-Theft</a>
            <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 py-1">Pricing</a>
            <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="block text-sm font-medium text-slate-300 py-1">FAQ</a>
            <div className="pt-2 border-t border-slate-800 flex flex-col space-y-2">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full text-xs font-semibold h-10 border-slate-700 text-slate-200">
                  Sign In
                </Button>
              </Link>
              <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full text-xs font-semibold h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950">
                  Get Started
                </Button>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="pt-20 pb-20 sm:pt-28 sm:pb-24 px-4 sm:px-6 max-w-4xl mx-auto text-center">

        {/* Simple Pill */}
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-slate-900 border border-slate-800 text-emerald-400 text-xs font-medium mb-6">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          <span>Invoice Pipeline & Revenue Assurance</span>
        </div>

        {/* Headline */}
        <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-[1.18] max-w-3xl mx-auto">
          The simple invoice pipeline that stops cashier theft.
        </h1>

        {/* Subtitle */}
        <p className="mt-5 text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Monitor every sale in real-time, approve discounts and receipt reprints from your phone, and prevent revenue leakages across all your branches.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
          <a href="#pricing" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-11 px-6 text-xs sm:text-sm font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm flex items-center justify-center space-x-2 transition-all">
              <span>View Subscription Plans</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
          <a
            href="https://wa.me/2348000000000?text=Hello%20BOLXolve%20Team%2C%20I%20would%20like%20to%20learn%20more%20about%20the%20invoice%20pipeline"
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="outline" className="w-full sm:w-auto h-11 px-6 text-xs sm:text-sm font-semibold border-slate-700 bg-slate-900/60 text-slate-300 hover:bg-slate-800 hover:text-white rounded-lg flex items-center justify-center space-x-2">
              <MessageCircle className="h-4 w-4 text-emerald-400" />
              <span>Talk to Us on WhatsApp</span>
            </Button>
          </a>
        </div>

        {/* Micro highlights */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium">
          <span className="flex items-center space-x-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Thermal slip & A4 PDF</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Tamper-proof cashier audit log</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <Check className="h-4 w-4 text-emerald-400" />
            <span>Multi-branch real-time sync</span>
          </span>
        </div>

      </section>

      {/* ========================================================= */}
      {/* BUSINESSES WE SERVE                                       */}
      {/* ========================================================= */}
      <section className="py-10 border-y border-slate-800/80 bg-slate-900/40">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="text-center text-xs font-semibold uppercase tracking-wider text-slate-400 mb-6">
            Engineered for trade, retail, and wholesale businesses across Nigeria
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 text-center">
            {[
              'Building Materials',
              'Supermarkets & Retail',
              'Wholesale Depots',
              'Auto Spare Parts',
              'Multi-Branch Outlets',
            ].map((name, i) => (
              <div key={i} className="py-2.5 px-3 rounded-lg border border-slate-800 bg-slate-900/60 text-slate-300 text-xs font-medium">
                {name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* ANTI-THEFT SECTION (3 CLEAN CARDS)                        */}
      {/* ========================================================= */}
      <section id="anti-theft" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Stop revenue leakage at the cashier desk.
          </h2>
          <p className="mt-3 text-sm text-slate-400">
            Paper invoice books and loose spreadsheets make it easy for staff to hide transactions. BOLXolve Invoice puts the owner back in control.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <AlertTriangle className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">No Pocketed Sales</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every sale must be issued with an authentic, serialized thermal slip or A4 PDF. Customers demand the receipt, leaving cashiers zero room for unrecorded sales.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Locked Invoices & Voids</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Once an invoice is finalized, cashiers cannot edit prices, change quantities, or void records. Any reprint or cancellation requires manager approval.
            </p>
          </div>

          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-3">
            <div className="h-9 w-9 rounded-lg bg-emerald-500/10 text-emerald-400 flex items-center justify-center font-bold text-sm">
              <Building2 className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Live Branch Visibility</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never wait for &ldquo;end of day reports&rdquo; or rough phone estimates again. See what every branch cashier has collected live on your phone.
            </p>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* HOW IT WORKS / CORE FEATURES                              */}
      {/* ========================================================= */}
      <section id="how-it-works" className="py-20 border-t border-slate-800 bg-slate-900/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Everything you need to run your invoice pipeline.
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Reliable, straightforward tools tailored for Nigerian wholesale, trade, and retail businesses.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <Printer className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Thermal Receipt & A4 Invoices</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Connects with standard 58mm/80mm thermal receipt printers for quick customer slips, or downloads official A4 PDF invoices with custom tax breakdowns.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <Clock className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Immutable Cashier Audit Trails</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Every action—from invoice creation to payment verification and reprints—is permanently logged with exact cashier name and timestamp.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <Layers className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Multi-Branch Depot Management</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Assign sub-admins to supervise branch cashiers while you keep complete company-wide consolidated sales control from a single owner dashboard.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 space-y-2.5">
              <ScanLine className="h-5 w-5 text-emerald-400" />
              <h3 className="text-sm font-bold text-white">Smart Paper Slip Scanning (OCR)</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Take a quick photo of handwritten order notes, supplier bills, or delivery slips to automatically extract line items into the invoice system in seconds.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* PRICING PLANS (10k / 22k / 44k - ₦0 SETUP FEE)             */}
      {/* ========================================================= */}
      <section id="pricing" className="py-20 max-w-5xl mx-auto px-4 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
            Simple, transparent subscription plans.
          </h2>
          <p className="mt-2 text-sm text-slate-400">
            No per-invoice commissions. Zero hidden charges. <strong>Free Guided Onboarding Included.</strong>
          </p>

          {/* Billing Cycle Toggle */}
          <div className="mt-6 inline-flex p-1 rounded-lg bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setBillingCycle('monthly')}
              className={`px-4 py-1.5 rounded-md transition-all ${billingCycle === 'monthly' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle('annual')}
              className={`px-4 py-1.5 rounded-md transition-all flex items-center space-x-1 ${billingCycle === 'annual' ? 'bg-emerald-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'}`}
            >
              <span>Annual (2 Months Free)</span>
              <span className="text-[10px] text-emerald-300 bg-emerald-950/60 px-1 rounded">Save 17%</span>
            </button>
          </div>
        </div>

        {/* 3 Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-stretch">

          {/* STARTER */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Starter</span>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  ₦{billingCycle === 'monthly' ? '6,500' : '65,000'}
                  <span className="text-xs text-slate-400 font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {billingCycle === 'annual' ? '₦5,416/mo effective (Save ₦13,000/yr)' : 'Billed monthly recurring'}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>3 Users:</strong> 1 Admin + 2 Cashiers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Unlimited Thermal & PDF Receipts</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Cashier Reprint & Void Approvals</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>10 Smart OCR scans/month</span>
                </div>
                <div className="flex items-center space-x-2 text-slate-500">
                  <X className="h-4 w-4 text-slate-600 shrink-0" />
                  <span>Excel Export & Activity Logs</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-semibold text-center">
                ✓ Free Setup & Guided Onboarding Included
              </div>
            </div>

            <a href={getWhatsAppPlanLink('Starter', 6500, 65000)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full text-xs font-semibold h-10 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200">
                Choose Starter
              </Button>
            </a>
          </div>

          {/* BUSINESS (POPULAR) */}
          <div className="p-6 rounded-xl border-2 border-emerald-500 bg-slate-900/90 flex flex-col justify-between space-y-6 relative">
            <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-bold tracking-wide uppercase">
              Most Popular
            </div>

            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Business</span>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  ₦{billingCycle === 'monthly' ? '10,500' : '105,000'}
                  <span className="text-xs text-slate-400 font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {billingCycle === 'annual' ? '₦8,750/mo effective (Save ₦21,000/yr)' : 'Billed monthly recurring'}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>5 Users:</strong> 1 Admin + 4 Cashiers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Thermal Slip & A4 Invoices</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Excel (.xlsx) Export</strong> included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>Activity & Audit Logs</strong> included</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Cashier Approvals & Shift Verification</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>60 Smart OCR scans/month</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-semibold text-center">
                ✓ Free Setup & Guided Onboarding Included
              </div>
            </div>

            <a href={getWhatsAppPlanLink('Business', 10500, 105000)} target="_blank" rel="noopener noreferrer">
              <Button className="w-full text-xs font-bold h-10 bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-sm">
                Choose Business
              </Button>
            </a>
          </div>

          {/* ENTERPRISE */}
          <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/50 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Enterprise</span>
                <p className="text-2xl sm:text-3xl font-bold text-white mt-1">
                  ₦{billingCycle === 'monthly' ? '20,000' : '200,000'}
                  <span className="text-xs text-slate-400 font-normal">/{billingCycle === 'monthly' ? 'mo' : 'yr'}</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {billingCycle === 'annual' ? '₦16,666/mo effective (Save ₦40,000/yr)' : 'Billed monthly recurring'}
                </p>
              </div>

              <div className="border-t border-slate-800 pt-3 space-y-2 text-xs text-slate-300">
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>11 Users:</strong> 1 Owner + 2 Managers + 8 Cashiers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span><strong>2 Physical Branches Included</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>PDF & Excel Export Unlocked</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Enterprise Audit History & Logs</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>150 Smart OCR scans/month</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Priority Onboarding & Staff Training</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-[11px] text-emerald-400 font-semibold text-center">
                ✓ Free Setup & Dedicated Support Included
              </div>
            </div>

            <a href={getWhatsAppPlanLink('Enterprise', 20000, 200000)} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" className="w-full text-xs font-semibold h-10 border-slate-700 bg-slate-900/60 hover:bg-slate-800 text-slate-200">
                Choose Enterprise
              </Button>
            </a>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* FAQ SECTION                                               */}
      {/* ========================================================= */}
      <section id="faq" className="py-20 max-w-3xl mx-auto px-4 sm:px-6">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'How does BOLXolve Invoice prevent cashier fraud?',
              a: 'Once an invoice is finalized and marked paid or printed, cashiers cannot edit the amounts, delete records, or issue secret discounts behind the owner’s back. Any reprint or cancellation requires an authorized manager or owner approval. Every action is recorded in a tamper-proof audit log.',
            },
            {
              q: 'Can I monitor my branches without visiting in person?',
              a: 'Yes. BOLXolve Invoice is cloud-synced. You can log into your Owner Dashboard from any phone or computer anywhere in Nigeria and see live sales, pending transfers, and cashier shifts in real time.',
            },
            {
              q: 'Can we use our existing thermal receipt printer?',
              a: 'Yes. BOLXolve Invoice works with standard 58mm and 80mm USB, Bluetooth, and network thermal receipt printers. It also generates standard A4 PDF invoices for corporate clients.',
            },
            {
              q: 'Are there any hidden setup or onboarding charges?',
              a: 'No. Setup and guided onboarding for your staff and cashiers are 100% free with your subscription.',
            },
            {
              q: 'Can we connect custom domain or add extra branches?',
              a: 'Yes! Custom domain routing (invoice.yourcompany.com), extra branch connections, and custom invoice stationery templates can be added seamlessly whenever your business expands.',
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div key={idx} className="rounded-lg border border-slate-800 bg-slate-900/50 overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-xs sm:text-sm font-semibold text-slate-200 hover:text-white"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800 pt-2.5">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL CLEAN CTA                                           */}
      {/* ========================================================= */}
      <section className="py-16 border-t border-slate-800 bg-slate-900/80 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center space-y-5">
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Ready to stop revenue theft in your business?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 max-w-xl mx-auto">
            Get started with BOLXolve Invoice today. Fast 24-hour onboarding for businesses and branches across Nigeria with ₦0 setup fee.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a
              href="https://wa.me/2348000000000?text=Hello%20BOLXolve%20Team%2C%20I%20would%20like%20to%20get%20started%20with%20free%20onboarding"
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button className="h-11 px-6 text-xs font-semibold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-lg shadow-sm flex items-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat with an Onboarding Specialist</span>
              </Button>
            </a>
            <Link href="/login">
              <Button variant="outline" className="h-11 px-6 text-xs font-semibold border-slate-700 bg-slate-950 text-slate-300 hover:bg-slate-800 rounded-lg">
                Existing Staff? Sign In
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* MODERN FOOTER (WITH BRAND LOGO LOCKUP)                   */}
      {/* ========================================================= */}
      <footer className="pt-16 pb-12 bg-[#080B11] border-t border-slate-800 text-xs text-slate-400">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-12">

          {/* Top Row: Brand & Multi-Column Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 lg:gap-10">

            {/* Brand Column (spans 2 cols) */}
            <div className="lg:col-span-2 space-y-5">
              <Link href="/" className="inline-block group">
                <Image
                  src="/brand-logo.png?v=2"
                  alt="BOLXolve Invoice"
                  width={380}
                  height={86}
                  className="h-14 sm:h-16 w-auto object-contain group-hover:opacity-95 transition-opacity"
                  priority
                />
              </Link>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
                The tamper-proof invoice pipeline and revenue assurance platform built for Nigerian business owners. Eliminate cashier fraud, track branch revenue, and secure every transaction in real-time.
              </p>
              <div className="pt-2">
                <a
                  href="https://wa.me/2348000000000?text=Hello%20BOLXolve%20Team%2C%20I%20would%20like%20to%20learn%20more"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-3.5 py-2 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-semibold hover:bg-emerald-500/20 transition-colors"
                >
                  <MessageCircle className="h-4 w-4" />
                  <span>Chat with an Onboarding Specialist</span>
                </a>
              </div>
            </div>

            {/* Column 1: Product */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Product</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">How It Works</a></li>
                <li><a href="#anti-theft" className="hover:text-emerald-400 transition-colors">Anti-Theft Approvals</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Multi-Branch Sync</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Thermal & A4 Invoices</a></li>
                <li><a href="#how-it-works" className="hover:text-emerald-400 transition-colors">Smart Slip OCR</a></li>
              </ul>
            </div>

            {/* Column 2: Supported Trades */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Businesses</h4>
              <ul className="space-y-2 text-xs">
                <li><span className="text-slate-400">Building Materials</span></li>
                <li><span className="text-slate-400">Supermarkets & Retail</span></li>
                <li><span className="text-slate-400">Wholesale Depots</span></li>
                <li><span className="text-slate-400">Pharmacies & Stores</span></li>
                <li><span className="text-slate-400">Auto Spare Parts</span></li>
              </ul>
            </div>

            {/* Column 3: Plans & Access */}
            <div className="space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">Commercial</h4>
              <ul className="space-y-2 text-xs">
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Starter (₦6,500/mo)</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Business (₦10,500/mo)</a></li>
                <li><a href="#pricing" className="hover:text-emerald-400 transition-colors">Enterprise (₦20,000/mo)</a></li>
                <li><a href="#faq" className="hover:text-emerald-400 transition-colors">Frequently Asked Questions</a></li>
                <li><Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold">Staff & Owner Login →</Link></li>
              </ul>
            </div>

          </div>

          {/* Bottom Divider & Status Row */}
          <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
            <p>© {new Date().getFullYear()} BOLXolve Technologies. All rights reserved.</p>

            <div className="flex items-center space-x-2 text-slate-400">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Platform Service: All Systems Operational</span>
            </div>

            <p className="text-[11px] text-slate-500 font-mono">invoice.bolxolve.com</p>
          </div>

        </div>
      </footer>

    </div>
  );
}
