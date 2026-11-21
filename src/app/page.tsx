'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { useAuth } from '../features/auth/context/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [activeControlTab, setActiveControlTab] = useState(0);

  const isDark = mounted ? resolvedTheme === 'dark' : false;
  const toggleTheme = () => {
    setTheme(isDark ? 'light' : 'dark');
  };

  const controlData = [
    {
      icon: 'receipt_long',
      badge: 'SERIALIZED RECEIPT',
      title: 'Every sale leaves a verifiable paper & digital trail.',
      body: 'Every sale must be issued with an authentic, serialized thermal slip or A4 PDF. Customers demand the receipt, leaving cashiers zero room for unrecorded sales.',
    },
    {
      icon: 'verified_user',
      badge: 'MANAGER APPROVAL',
      title: 'Finalized invoices are locked against silent edits.',
      body: 'Once an invoice is finalized, cashiers cannot edit prices, change quantities, or void records. Any reprint or cancellation requires manager approval.',
    },
    {
      icon: 'storefront',
      badge: 'REAL-TIME SYNC',
      title: 'Live branch collections from anywhere on your phone.',
      body: 'Never wait for "end of day reports" or rough phone estimates again. See what every branch cashier has collected live on your phone.',
    },
  ];

  const currentControl = controlData[activeControlTab];

  const prices = {
    monthly: {
      starter: '₦6,500',
      business: '₦10,500',
      enterprise: '₦20,000',
      cadence: 'Billed monthly recurring',
    },
    annual: {
      starter: '₦5,417',
      business: '₦8,750',
      enterprise: '₦16,667',
      cadence: 'Billed annually (2 months free)',
    },
  };

  const getWhatsAppLink = (planName?: string) => {
    const text = planName
      ? encodeURIComponent(`Hello BOLXolve Team, I would like to get started on the ${planName} plan with free guided onboarding.`)
      : encodeURIComponent('Hello BOLXolve Team, I would like to learn more about BOLXolve Invoice and get onboarded.');
    return `https://wa.me/2348000000000?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-on-background dark:text-dark-on-background font-body antialiased selection:bg-light-primary/20 dark:selection:bg-dark-primary/20 transition-colors duration-200">
      {/* Active User Session Bar */}
      {user && (
        <div className="bg-light-surface-container-high dark:bg-dark-surface-container border-b border-light-outline-variant/30 dark:border-dark-outline-variant/30 text-light-on-surface dark:text-dark-on-surface py-2 px-gutter-md md:px-page-margin text-xs flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="h-2 w-2 rounded-full bg-light-primary dark:bg-dark-primary" />
            <span>
              Signed in as <strong>{user.firstName || 'User'}</strong> ({user.role})
            </span>
          </div>
          <Link
            href="/invoices"
            className="font-semibold text-light-primary dark:text-dark-primary hover:underline flex items-center space-x-1"
          >
            <span>Go to Dashboard</span>
            <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
          </Link>
        </div>
      )}

      {/* Ultra-Minimal Top Navigation */}
      <header className="sticky top-0 z-40 bg-light-background/95 dark:bg-dark-background/95 border-b border-light-outline-variant/30 dark:border-dark-outline-variant/30 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin h-20 flex items-center justify-between gap-gutter-lg">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary rounded-sm"
          >
            <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true" className="shrink-0">
              <path d="M16 2L28 9L16 16L4 9L16 2Z" className="fill-light-primary dark:fill-dark-primary"></path>
              <path
                d="M4 9L16 16V30L4 23V9Z"
                className="fill-light-secondary dark:fill-dark-secondary"
                fillOpacity="0.85"
              ></path>
              <path
                d="M28 9L16 16V30L28 23V9Z"
                className="fill-light-primary-container dark:fill-dark-primary-container"
              ></path>
            </svg>
            <div className="flex items-baseline gap-1.5">
              <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface tracking-tight">
                BOLXolve
              </span>
              <span className="font-headline text-headline-sm text-light-primary dark:text-dark-primary">
                Invoice
              </span>
            </div>
          </Link>

          {/* Minimal Nav */}
          <nav aria-label="Primary Navigation" className="hidden md:flex items-center gap-gutter-xl">
            <a
              href="#pipeline"
              className="font-label text-label-lg text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors"
            >
              Pipeline
            </a>
            <a
              href="#anti-theft"
              className="font-label text-label-lg text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors"
            >
              Anti-Theft
            </a>
            <a
              href="#capabilities"
              className="font-label text-label-lg text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors"
            >
              Capabilities
            </a>
            <a
              href="#pricing"
              className="font-label text-label-lg text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors"
            >
              Pricing
            </a>
            <a
              href="#faq"
              className="font-label text-label-lg text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors"
            >
              FAQ
            </a>
          </nav>

          {/* Right Actions + Theme Toggle */}
          <div className="flex items-center gap-gutter-sm shrink-0">
            {/* Theme Toggle Button */}
            <button
              onClick={toggleTheme}
              type="button"
              aria-label="Switch between dark and light theme"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]" aria-hidden="true">
                {isDark ? 'light_mode' : 'dark_mode'}
              </span>
            </button>

            {user ? (
              <Link
                href="/invoices"
                className="hidden sm:inline-flex items-center justify-center px-gutter-md py-3 rounded font-label text-label-lg text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center px-gutter-md py-3 rounded font-label text-label-lg text-light-on-surface dark:text-dark-on-surface hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors"
              >
                Sign In
              </Link>
            )}

            <a
              href="#pricing"
              className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-colors font-label text-label-lg"
            >
              <span>Get Started</span>
            </a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: Centered Editorial Statement + Panoramic 3-Stage Pipeline Strip */}
        <section
          id="pipeline"
          className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin pt-section-md pb-section-md md:pt-section-lg md:pb-section-lg flex flex-col gap-section-sm"
        >
          <div className="max-w-4xl mx-auto text-center flex flex-col items-center gap-gutter-lg">
            <span className="font-label text-label-sm uppercase tracking-widest text-light-primary dark:text-dark-primary">
              Invoice Pipeline &amp; Revenue Assurance
            </span>

            <h1 className="font-headline text-display-lg-mobile md:text-display-lg text-light-on-surface dark:text-dark-on-surface text-balance">
              The simple invoice pipeline that stops cashier theft.
            </h1>

            <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-2xl text-pretty">
              Monitor every sale in real-time, approve discounts and receipt reprints from your phone, and prevent revenue
              leakages across all your branches.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-gutter-md pt-gutter-xs">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-colors"
              >
                <span className="font-label text-label-lg">View Subscription Plans</span>
                <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                  arrow_forward
                </span>
              </a>

              <a
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors"
              >
                <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary" aria-hidden="true">
                  chat
                </span>
                <span className="font-label text-label-lg">Talk to Us on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Panoramic 3-Stage Revenue Assurance Architecture */}
          <div className="rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant overflow-hidden">
            {/* Stage Header Bar */}
            <div className="px-gutter-lg md:px-gutter-xl py-gutter-md border-b border-light-outline-variant/40 dark:border-dark-outline-variant/40 flex flex-wrap items-center justify-between gap-gutter-md">
              <div className="flex items-center gap-gutter-sm">
                <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary" aria-hidden="true">
                  monitoring
                </span>
                <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface">
                  Live Assurance Flow
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-gutter-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <span className="font-mono text-mono-sm">Thermal slip &amp; A4 PDF</span>
                <span className="font-mono text-mono-sm">Tamper-proof audit log</span>
                <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary">Multi-branch sync</span>
              </div>
            </div>

            {/* 3-Column Horizontal Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-light-outline-variant/40 dark:divide-dark-outline-variant/40">
              {/* Stage 1: Cashier Desk */}
              <div className="p-gutter-lg md:p-gutter-xl flex flex-col justify-between gap-gutter-lg">
                <div className="flex flex-col gap-gutter-sm">
                  <div className="flex items-center justify-between gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      01 · Cashier Desk
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary" aria-hidden="true">
                      receipt_long
                    </span>
                  </div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    Serialized Slip Issued
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Every sale locks immediately on print—no silent edits, price drops, or pocketed cash.
                  </p>
                </div>
                <div className="p-gutter-md rounded-md bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between gap-gutter-sm">
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">#INV-0482 · 80mm</span>
                  <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary">LOCKED</span>
                </div>
              </div>

              {/* Stage 2: Owner Approval */}
              <div className="p-gutter-lg md:p-gutter-xl flex flex-col justify-between gap-gutter-lg">
                <div className="flex flex-col gap-gutter-sm">
                  <div className="flex items-center justify-between gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      02 · Owner Mobile
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-light-secondary dark:text-dark-secondary" aria-hidden="true">
                      lock
                    </span>
                  </div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    Approval Gatekeeper
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Reprints, discounts, or voids pause for your one-tap authorization from anywhere.
                  </p>
                </div>
                <div className="p-gutter-md rounded-md bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between gap-gutter-sm">
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">Reprint · ₦42,500</span>
                  <span className="font-mono text-mono-sm text-light-secondary dark:text-dark-secondary">PENDING</span>
                </div>
              </div>

              {/* Stage 3: Consolidated Ledger */}
              <div className="p-gutter-lg md:p-gutter-xl flex flex-col justify-between gap-gutter-lg">
                <div className="flex flex-col gap-gutter-sm">
                  <div className="flex items-center justify-between gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      03 · Owner Dashboard
                    </span>
                    <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary" aria-hidden="true">
                      verified_user
                    </span>
                  </div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    All Depots Synced
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Real-time consolidated revenue across every physical branch and cashier shift.
                  </p>
                </div>
                <div className="p-gutter-md rounded-md bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between gap-gutter-sm">
                  <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">30D Total</span>
                  <span className="font-mono text-mono-sm tabular-nums text-light-primary dark:text-dark-primary">₦17,510,675.00</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 1: Interactive Anti-Theft Control Index (Rail + Stage) */}
        <section
          id="anti-theft"
          className="border-y border-light-outline-variant/40 dark:border-dark-outline-variant/40 bg-light-surface-container-low/40 dark:bg-dark-surface-container-lowest/40"
        >
          <div className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin py-section-md md:py-section-lg flex flex-col gap-section-sm">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-gutter-lg">
              <div className="max-w-2xl flex flex-col gap-gutter-sm">
                <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-surface dark:text-dark-on-surface text-balance">
                  Stop revenue leakage at the cashier desk.
                </h2>
                <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                  Paper invoice books and loose spreadsheets make it easy for staff to hide transactions. BOLXolve Invoice puts the owner back in control.
                </p>
              </div>
              <p className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0">
                Built for Nigerian trade &amp; wholesale
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl items-stretch">
              {/* Left Interactive Selector Rail (5 cols) */}
              <div className="lg:col-span-5 flex flex-col gap-gutter-sm">
                <button
                  type="button"
                  onClick={() => setActiveControlTab(0)}
                  className={`text-left p-gutter-lg rounded-md transition-colors cursor-pointer flex flex-col gap-gutter-xs ${
                    activeControlTab === 0
                      ? 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-2 border-light-primary dark:border-dark-primary shadow-sm'
                      : 'bg-light-surface-container-lowest/60 dark:bg-dark-surface-container-low/60 border border-light-outline-variant dark:border-dark-outline-variant hover:border-light-primary dark:hover:border-dark-primary'
                  }`}
                >
                  <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    No Pocketed Sales
                  </span>
                  <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Authentic serialized thermal slip or A4 PDF required on every transaction.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveControlTab(1)}
                  className={`text-left p-gutter-lg rounded-md transition-colors cursor-pointer flex flex-col gap-gutter-xs ${
                    activeControlTab === 1
                      ? 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-2 border-light-primary dark:border-dark-primary shadow-sm'
                      : 'bg-light-surface-container-lowest/60 dark:bg-dark-surface-container-low/60 border border-light-outline-variant dark:border-dark-outline-variant hover:border-light-primary dark:hover:border-dark-primary'
                  }`}
                >
                  <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    Locked Invoices &amp; Voids
                  </span>
                  <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Finalized invoices cannot be edited, discounted, or deleted by staff.
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveControlTab(2)}
                  className={`text-left p-gutter-lg rounded-md transition-colors cursor-pointer flex flex-col gap-gutter-xs ${
                    activeControlTab === 2
                      ? 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-2 border-light-primary dark:border-dark-primary shadow-sm'
                      : 'bg-light-surface-container-lowest/60 dark:bg-dark-surface-container-low/60 border border-light-outline-variant dark:border-dark-outline-variant hover:border-light-primary dark:hover:border-dark-primary'
                  }`}
                >
                  <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    Live Branch Visibility
                  </span>
                  <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Watch every depot cashier&#39;s live collections directly from your phone.
                  </span>
                </button>
              </div>

              {/* Right Dynamic Detail Stage (7 cols) */}
              <div className="lg:col-span-7 rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant p-gutter-xl flex flex-col justify-between gap-gutter-xl">
                <div className="flex flex-col gap-gutter-md">
                  <div className="flex items-center justify-between gap-gutter-md">
                    <div className="w-11 h-11 rounded bg-light-surface-variant dark:bg-dark-surface-container-high flex items-center justify-center text-light-primary dark:text-dark-primary">
                      <span className="material-symbols-outlined text-[22px]" aria-hidden="true">
                        {currentControl.icon}
                      </span>
                    </div>
                    <span className="font-mono text-mono-sm px-gutter-sm py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-primary dark:text-dark-primary font-semibold">
                      {currentControl.badge}
                    </span>
                  </div>

                  <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
                    {currentControl.title}
                  </h3>

                  <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                    {currentControl.body}
                  </p>
                </div>

                {/* Sectors Covered */}
                <div className="pt-gutter-lg border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 flex flex-col gap-gutter-sm">
                  <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Trusted across Nigerian trade &amp; retail
                  </span>
                  <div className="flex flex-wrap items-center gap-gutter-sm">
                    <span className="font-label text-label-sm px-gutter-md py-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface">
                      Building Materials
                    </span>
                    <span className="font-label text-label-sm px-gutter-md py-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface">
                      Supermarkets &amp; Retail
                    </span>
                    <span className="font-label text-label-sm px-gutter-md py-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface">
                      Wholesale Depots
                    </span>
                    <span className="font-label text-label-sm px-gutter-md py-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface">
                      Auto Spare Parts
                    </span>
                    <span className="font-label text-label-sm px-gutter-md py-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface">
                      Multi-Branch Outlets
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Section 2: Capabilities Specification Sheet (Hairline-Divided Rows, No Card Grid) */}
        <section
          id="capabilities"
          className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin py-section-md md:py-section-lg flex flex-col gap-section-sm"
        >
          <div className="max-w-2xl flex flex-col gap-gutter-sm">
            <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-surface dark:text-dark-on-surface text-balance">
              Everything you need to run your invoice pipeline.
            </h2>
            <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
              Reliable, straightforward tools tailored for Nigerian wholesale, trade, and retail businesses.
            </p>
          </div>

          <div className="border-y border-light-outline-variant/50 dark:border-dark-outline-variant/50 divide-y divide-light-outline-variant/50 dark:divide-dark-outline-variant/50">
            {/* Row 1 */}
            <div className="py-gutter-xl grid grid-cols-1 md:grid-cols-12 gap-gutter-md md:gap-gutter-xl items-start md:items-center">
              <div className="md:col-span-4 flex items-center gap-gutter-md">
                <span className="material-symbols-outlined text-[22px] text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true">
                  print
                </span>
                <h3 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                  Thermal Receipt &amp; A4 Invoices
                </h3>
              </div>
              <p className="md:col-span-6 font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                Connects with standard 58mm/80mm thermal receipt printers for quick customer slips, or downloads official A4 PDF invoices with custom tax breakdowns.
              </p>
              <div className="md:col-span-2 md:text-right">
                <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary font-semibold">
                  58mm · 80mm · A4
                </span>
              </div>
            </div>

            {/* Row 2 */}
            <div className="py-gutter-xl grid grid-cols-1 md:grid-cols-12 gap-gutter-md md:gap-gutter-xl items-start md:items-center">
              <div className="md:col-span-4 flex items-center gap-gutter-md">
                <span className="material-symbols-outlined text-[22px] text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true">
                  history
                </span>
                <h3 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                  Immutable Cashier Audit Trails
                </h3>
              </div>
              <p className="md:col-span-6 font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                Every action—from invoice creation to payment verification and reprints—is permanently logged with exact cashier name and timestamp.
              </p>
              <div className="md:col-span-2 md:text-right">
                <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary font-semibold">
                  TAMPER-PROOF LOG
                </span>
              </div>
            </div>

            {/* Row 3 */}
            <div className="py-gutter-xl grid grid-cols-1 md:grid-cols-12 gap-gutter-md md:gap-gutter-xl items-start md:items-center">
              <div className="md:col-span-4 flex items-center gap-gutter-md">
                <span className="material-symbols-outlined text-[22px] text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true">
                  storefront
                </span>
                <h3 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                  Multi-Branch Depot Management
                </h3>
              </div>
              <p className="md:col-span-6 font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                Assign sub-admins to supervise branch cashiers while you keep complete company-wide consolidated sales control from a single owner dashboard.
              </p>
              <div className="md:col-span-2 md:text-right">
                <span className="font-mono text-mono-sm text-light-secondary dark:text-dark-secondary font-semibold">
                  CONSOLIDATED SYNC
                </span>
              </div>
            </div>

            {/* Row 4 */}
            <div className="py-gutter-xl grid grid-cols-1 md:grid-cols-12 gap-gutter-md md:gap-gutter-xl items-start md:items-center">
              <div className="md:col-span-4 flex items-center gap-gutter-md">
                <span className="material-symbols-outlined text-[22px] text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true">
                  document_scanner
                </span>
                <h3 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                  Smart Paper Slip Scanning (OCR)
                </h3>
              </div>
              <p className="md:col-span-6 font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                Take a quick photo of handwritten order notes, supplier bills, or delivery slips to automatically extract line items into the invoice system in seconds.
              </p>
              <div className="md:col-span-2 md:text-right">
                <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary font-semibold">
                  INSTANT OCR
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Section 3: Transparent Subscription Plans */}
        <section
          id="pricing"
          className="border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 bg-light-surface-container-low/40 dark:bg-dark-surface-container-lowest/40"
        >
          <div className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin py-section-md md:py-section-lg flex flex-col gap-section-sm">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-gutter-lg">
              <div className="max-w-xl flex flex-col gap-gutter-sm">
                <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-surface dark:text-dark-on-surface text-balance">
                  Simple, transparent subscription plans.
                </h2>
                <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                  No per-invoice commissions. Zero hidden charges. Free Guided Onboarding Included.
                </p>
              </div>

              {/* Billing Cycle Switch */}
              <div className="inline-flex items-center p-1 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant self-start">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-gutter-md py-2 rounded-full font-label text-label-lg transition-colors cursor-pointer whitespace-nowrap ${
                    billingCycle === 'monthly'
                      ? 'bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-semibold'
                      : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                  }`}
                >
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-gutter-md py-2 rounded-full font-label text-label-lg transition-colors cursor-pointer flex items-center gap-gutter-xs whitespace-nowrap ${
                    billingCycle === 'annual'
                      ? 'bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-semibold'
                      : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                  }`}
                >
                  <span>Annual (2 Months Free)</span>
                  <span className="text-label-sm text-light-primary dark:text-dark-primary font-bold">Save 17%</span>
                </button>
              </div>
            </div>

            {/* 3-Tier Architectural Pricing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg items-stretch">
              {/* Starter */}
              <article className="h-full p-gutter-xl rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant flex flex-col justify-between gap-gutter-xl shadow-sm">
                <div className="flex flex-col gap-gutter-lg">
                  <header className="flex flex-col gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant font-bold">
                      Starter
                    </span>
                    <div className="flex items-baseline gap-gutter-xs">
                      <span className="font-mono text-mono-lg-mobile md:text-mono-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                        {prices[billingCycle].starter}
                      </span>
                      <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        /mo
                      </span>
                    </div>
                    <p className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {prices[billingCycle].cadence}
                    </p>
                  </header>

                  <ul className="flex flex-col gap-gutter-md">
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>3 Users:</strong> 1 Admin + 2 Cashiers
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Unlimited Thermal &amp; PDF Receipts
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Cashier Reprint &amp; Void Approvals
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        10 Smart OCR scans/month
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0 mt-0.5" aria-hidden="true">
                        close
                      </span>
                      <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant line-through">
                        Excel Export &amp; Activity Logs
                      </span>
                    </li>
                  </ul>
                </div>

                <footer className="flex flex-col gap-gutter-md">
                  <div className="px-gutter-md py-2 rounded bg-light-surface-variant/60 dark:bg-dark-surface-container text-center">
                    <span className="font-label text-label-sm text-light-primary dark:text-dark-primary font-semibold">
                      Free Setup &amp; Guided Onboarding Included
                    </span>
                  </div>
                  <Link
                    href={user ? '/subscriptions/manage' : '/register?plan=STARTER'}
                    className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg"
                  >
                    Choose Starter
                  </Link>
                </footer>
              </article>

              {/* Business (Most Popular) */}
              <article className="h-full p-gutter-xl rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-2 border-light-primary dark:border-dark-primary flex flex-col justify-between gap-gutter-xl shadow-md relative">
                <div className="flex flex-col gap-gutter-lg">
                  <header className="flex flex-col gap-gutter-sm">
                    <div className="flex items-center justify-between gap-gutter-sm">
                      <span className="font-label text-label-sm uppercase tracking-wider text-light-primary dark:text-dark-primary font-bold">
                        Business
                      </span>
                      <span className="font-label text-label-sm px-gutter-sm py-0.5 rounded-full bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-semibold">
                        Most Popular
                      </span>
                    </div>
                    <div className="flex items-baseline gap-gutter-xs">
                      <span className="font-mono text-mono-lg-mobile md:text-mono-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                        {prices[billingCycle].business}
                      </span>
                      <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        /mo
                      </span>
                    </div>
                    <p className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {prices[billingCycle].cadence}
                    </p>
                  </header>

                  <ul className="flex flex-col gap-gutter-md">
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>5 Users:</strong> 1 Admin + 4 Cashiers
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Thermal Slip &amp; A4 Invoices
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>Excel (.xlsx) Export</strong> included
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>Activity &amp; Audit Logs</strong> included
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Cashier Approvals &amp; Shift Verification
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        60 Smart OCR scans/month
                      </span>
                    </li>
                  </ul>
                </div>

                <footer className="flex flex-col gap-gutter-md">
                  <div className="px-gutter-md py-2 rounded bg-light-surface-variant/60 dark:bg-dark-surface-container-high text-center">
                    <span className="font-label text-label-sm text-light-primary dark:text-dark-primary font-semibold">
                      Free Setup &amp; Guided Onboarding Included
                    </span>
                  </div>
                  <Link
                    href={user ? '/subscriptions/manage' : '/register?plan=BUSINESS'}
                    className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-colors font-label text-label-lg"
                  >
                    Choose Business
                  </Link>
                </footer>
              </article>

              {/* Enterprise */}
              <article className="h-full p-gutter-xl rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant flex flex-col justify-between gap-gutter-xl shadow-sm">
                <div className="flex flex-col gap-gutter-lg">
                  <header className="flex flex-col gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant font-bold">
                      Enterprise
                    </span>
                    <div className="flex items-baseline gap-gutter-xs">
                      <span className="font-mono text-mono-lg-mobile md:text-mono-lg tabular-nums text-light-on-surface dark:text-dark-on-surface">
                        {prices[billingCycle].enterprise}
                      </span>
                      <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        /mo
                      </span>
                    </div>
                    <p className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      {prices[billingCycle].cadence}
                    </p>
                  </header>

                  <ul className="flex flex-col gap-gutter-md">
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>11 Users:</strong> 1 Owner + 2 Managers + 8 Cashiers
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>2 Physical Branches Included</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        PDF &amp; Excel Export Unlocked
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Enterprise Audit History &amp; Logs
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        150 Smart OCR scans/month
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <span className="material-symbols-outlined text-[18px] text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true">
                        check
                      </span>
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Priority Onboarding &amp; Staff Training
                      </span>
                    </li>
                  </ul>
                </div>

                <footer className="flex flex-col gap-gutter-md">
                  <div className="px-gutter-md py-2 rounded bg-light-surface-variant/60 dark:bg-dark-surface-container text-center">
                    <span className="font-label text-label-sm text-light-primary dark:text-dark-primary font-semibold">
                      Free Setup &amp; Dedicated Support Included
                    </span>
                  </div>
                  <Link
                    href={user ? '/subscriptions/manage' : '/register?plan=ENTERPRISE'}
                    className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg"
                  >
                    Choose Enterprise
                  </Link>
                </footer>
              </article>
            </div>
          </div>
        </section>

        {/* Section 4: Unified Closing Split (Left CTA + Right Hairline FAQ) */}
        <section id="faq" className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin py-section-md md:py-section-lg">
          <div id="closing" className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl lg:gap-section-sm items-start">
            {/* Left Conversion Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-gutter-lg">
              <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-surface dark:text-dark-on-surface text-balance">
                Ready to stop revenue theft in your business?
              </h2>
              <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                Get started with BOLXolve Invoice today. Fast 24-hour onboarding for businesses and branches across Nigeria with ₦0 setup fee.
              </p>

              <div className="flex flex-wrap items-center gap-gutter-md pt-gutter-xs">
                <a
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-colors whitespace-nowrap font-label text-label-lg"
                >
                  <span className="material-symbols-outlined text-[18px]" aria-hidden="true">
                    chat
                  </span>
                  <span>Chat with Onboarding</span>
                </a>

                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg"
                >
                  <span>Existing Staff? Sign In</span>
                </Link>
              </div>
            </div>

            {/* Right Hairline FAQ Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="mb-gutter-md">
                <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant font-bold">
                  Frequently Asked Questions
                </span>
              </div>

              <div className="border-t border-light-outline-variant/50 dark:border-dark-outline-variant/50 divide-y divide-light-outline-variant/50 dark:divide-dark-outline-variant/50">
                <details name="faq-group" className="group py-gutter-lg" open>
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      How does BOLXolve Invoice prevent cashier fraud?
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-light-primary dark:text-dark-primary transition-transform duration-150 group-open:rotate-180 shrink-0" aria-hidden="true">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Once an invoice is finalized and marked paid or printed, cashiers cannot edit the amounts, delete records, or issue secret discounts behind the owner&#39;s back. Any reprint or cancellation requires an authorized manager or owner approval. Every action is recorded in a tamper-proof audit log.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      Can I monitor my branches without visiting in person?
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-light-primary dark:text-dark-primary transition-transform duration-150 group-open:rotate-180 shrink-0" aria-hidden="true">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Yes. Every depot and outlet syncs in real time to your owner dashboard, giving you live revenue totals, cashier activity logs, and mobile approval controls from anywhere.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      Can we use our existing thermal receipt printer?
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-light-primary dark:text-dark-primary transition-transform duration-150 group-open:rotate-180 shrink-0" aria-hidden="true">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Yes. BOLXolve Invoice works directly with standard 58mm and 80mm thermal receipt printers as well as regular A4 PDF office printers.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      Are there any hidden setup or onboarding charges?
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-light-primary dark:text-dark-primary transition-transform duration-150 group-open:rotate-180 shrink-0" aria-hidden="true">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    No. Every plan includes ₦0 setup fee and free guided onboarding within 24 hours so your cashiers and managers can start issuing verified invoices immediately.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg border-b border-light-outline-variant/50 dark:border-dark-outline-variant/50">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      Can we connect custom domain or add extra branches?
                    </span>
                    <span className="material-symbols-outlined text-[20px] text-light-primary dark:text-dark-primary transition-transform duration-150 group-open:rotate-180 shrink-0" aria-hidden="true">
                      expand_more
                    </span>
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Yes. Enterprise accounts include 2 physical branches out of the box and support adding extra depots or custom company branding on request.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Minimal Architectural Footer */}
      <footer className="border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 bg-light-surface-container-low/40 dark:bg-dark-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin py-section-sm md:py-section-md flex flex-col gap-section-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-xl">
            <div className="md:col-span-5 flex flex-col items-start gap-gutter-md">
              <div className="flex items-center gap-3">
                <svg width="28" height="28" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M16 2L28 9L16 16L4 9L16 2Z" className="fill-light-primary dark:fill-dark-primary"></path>
                  <path
                    d="M4 9L16 16V30L4 23V9Z"
                    className="fill-light-secondary dark:fill-dark-secondary"
                    fillOpacity="0.85"
                  ></path>
                  <path
                    d="M28 9L16 16V30L28 23V9Z"
                    className="fill-light-primary-container dark:fill-dark-primary-container"
                  ></path>
                </svg>
                <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                  BOLXolve <span className="text-light-primary dark:text-dark-primary">Invoice</span>
                </span>
              </div>
              <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-sm text-pretty">
                The tamper-proof invoice pipeline and revenue assurance platform built for Nigerian business owners. Eliminate cashier fraud, track branch revenue, and secure every transaction in real-time.
              </p>
            </div>

            <div className="md:col-span-2 flex flex-col gap-gutter-sm">
              <h3 className="font-label text-label-sm uppercase tracking-wider text-light-on-surface dark:text-dark-on-surface font-bold">
                Product
              </h3>
              <ul className="flex flex-col gap-gutter-xs text-light-on-surface-variant dark:text-dark-on-surface-variant text-sm">
                <li>
                  <a href="#pipeline" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    How It Works
                  </a>
                </li>
                <li>
                  <a href="#anti-theft" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Anti-Theft Approvals
                  </a>
                </li>
                <li>
                  <a href="#capabilities" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Multi-Branch Sync
                  </a>
                </li>
                <li>
                  <a href="#capabilities" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Thermal &amp; A4 Invoices
                  </a>
                </li>
                <li>
                  <a href="#capabilities" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Smart Slip OCR
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-2 flex flex-col gap-gutter-sm">
              <h3 className="font-label text-label-sm uppercase tracking-wider text-light-on-surface dark:text-dark-on-surface font-bold">
                Businesses
              </h3>
              <ul className="flex flex-col gap-gutter-xs text-light-on-surface-variant dark:text-dark-on-surface-variant text-sm">
                <li>
                  <a href="#anti-theft" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Building Materials
                  </a>
                </li>
                <li>
                  <a href="#anti-theft" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Supermarkets &amp; Retail
                  </a>
                </li>
                <li>
                  <a href="#anti-theft" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Wholesale Depots
                  </a>
                </li>
                <li>
                  <a href="#anti-theft" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Pharmacies &amp; Stores
                  </a>
                </li>
                <li>
                  <a href="#anti-theft" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Auto Spare Parts
                  </a>
                </li>
              </ul>
            </div>

            <div className="md:col-span-3 flex flex-col gap-gutter-sm">
              <h3 className="font-label text-label-sm uppercase tracking-wider text-light-on-surface dark:text-dark-on-surface font-bold">
                Commercial
              </h3>
              <ul className="flex flex-col gap-gutter-xs text-light-on-surface-variant dark:text-dark-on-surface-variant text-sm">
                <li>
                  <a href="#pricing" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Starter (₦6,500/mo)
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Business (₦10,500/mo)
                  </a>
                </li>
                <li>
                  <a href="#pricing" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Enterprise (₦20,000/mo)
                  </a>
                </li>
                <li>
                  <a href="#faq" className="hover:text-light-on-surface dark:hover:text-dark-on-surface transition-colors">
                    Frequently Asked Questions
                  </a>
                </li>
                <li>
                  <Link
                    href="/login"
                    className="font-label text-label-lg text-light-primary dark:text-dark-primary pt-gutter-xs inline-block hover:underline"
                  >
                    Staff &amp; Owner Login →
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-gutter-lg border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-gutter-md">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              © 2026 BOLXolve Technologies. All rights reserved.
            </span>
            <div className="flex items-center gap-gutter-xs">
              <span
                className="material-symbols-outlined text-[14px] text-light-primary dark:text-dark-primary"
                style={{ fontVariationSettings: "'FILL' 1" }}
                aria-hidden="true"
              >
                circle
              </span>
              <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
                Platform Service: All Systems Operational
              </span>
            </div>
            <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              invoice.bolxolve.com
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
