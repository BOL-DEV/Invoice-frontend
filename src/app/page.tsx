'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useTheme } from 'next-themes';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth/context/AuthContext';
import {
  Sun,
  Moon,
  ArrowRight,
  ArrowUpRight,
  MessageCircle,
  Activity,
  FileText,
  Lock,
  ShieldCheck,
  Printer,
  Clock,
  Building2,
  ScanLine,
  Check,
  X,
  ChevronDown,
} from 'lucide-react';

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
      tabTitle: 'No Pocketed Sales',
      tabSubtitle: 'Authentic serialized thermal slip or A4 PDF required on every transaction.',
      icon: FileText,
      badge: 'SERIALIZED RECEIPT',
      title: 'Every sale leaves a verifiable paper & digital trail.',
      body: 'Every sale must be issued with an authentic, serialized 58mm/80mm thermal slip or A4 PDF with custom tax rates (7.5% VAT, 2% WHT) and customer debt tracking. Customers demand the receipt, leaving cashiers zero room for unrecorded sales.',
    },
    {
      tabTitle: 'Locked Invoices & Voids',
      tabSubtitle: 'Finalized invoices cannot be edited, discounted, or deleted by staff.',
      icon: ShieldCheck,
      badge: 'MANAGER APPROVAL',
      title: 'Finalized invoices are locked against silent edits.',
      body: 'Once an invoice is finalized or printed, cashiers cannot edit prices, change quantities, or void records. Any reprint, void, or unauthorized price drop pauses for manager authorization.',
    },
    {
      tabTitle: 'Live Branch Visibility',
      tabSubtitle: "Watch every depot cashier's live collections directly from your phone.",
      icon: Building2,
      badge: 'REAL-TIME SYNC',
      title: 'Live branch collections from anywhere on your phone.',
      body: 'Never wait for "end of day reports" or rough phone estimates again. Watch what every branch cashier has collected live on your phone, complete with cashier shift logs, timestamps, and IP tracking.',
    },
  ];

  const currentControl = controlData[activeControlTab];
  const CurrentControlIcon = currentControl.icon;

  const capabilities = [
    {
      icon: Printer,
      title: 'Thermal Receipts (58/80mm) & Official A4 Invoices',
      desc: 'Instant direct printing to standard 58mm and 80mm thermal receipt printers for fast checkout, or download official A4 PDF invoices with custom tax breakdowns (7.5% VAT, 2% WHT) and customer balance tracking.',
      tag: '58mm · 80mm · A4 PDF',
      tagColor: 'text-light-primary dark:text-dark-primary',
    },
    {
      icon: FileText,
      title: 'Quotation Conversion & Goods Delivery Waybills',
      desc: 'Issue verified commercial quotes with validity date ranges and convert accepted quotes to invoices in 1 click. Dispatch goods with official delivery waybills including driver, vehicle plate, and receiver sign-off.',
      tag: 'QUOTES & WAYBILLS',
      tagColor: 'text-light-secondary dark:text-dark-secondary',
    },
    {
      icon: Clock,
      title: 'Cashier Shift Logs & Approval Gatekeeper',
      desc: 'Every action—from invoice issuance to payments, reprints, and voids—is permanently logged with cashier identity, shift, and timestamp. Risky actions pause until the owner or manager approves.',
      tag: 'TAMPER-PROOF AUDIT',
      tagColor: 'text-light-primary dark:text-dark-primary',
    },
    {
      icon: ScanLine,
      title: 'Smart AI Paper Slip Scanning (Gemini OCR)',
      desc: 'Take a quick smartphone photo of handwritten order notes, supplier bills, or delivery slips. Gemini AI automatically extracts line items, quantities, and prices straight into the invoice system in seconds.',
      tag: 'GEMINI AI OCR',
      tagColor: 'text-light-primary dark:text-dark-primary',
    },
  ];

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
    return `https://wa.me/2347087035189?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-light-background dark:bg-dark-background text-light-on-background dark:text-dark-on-background font-body antialiased selection:bg-light-primary/20 dark:selection:bg-dark-primary/20 transition-colors duration-200 relative overflow-hidden">
      {/* Ambient Architectural Gradient Glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-6xl h-[520px] bg-gradient-to-b from-light-primary/12 via-light-primary/4 to-transparent dark:from-dark-primary/15 dark:via-dark-primary/4 dark:to-transparent blur-3xl pointer-events-none -z-10"
        aria-hidden="true"
      />

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
            className="font-semibold text-light-primary dark:text-dark-primary hover:underline flex items-center space-x-1.5 transition-transform hover:translate-x-0.5"
          >
            <span>Go to Dashboard</span>
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}

      {/* Ultra-Minimal Top Navigation */}
      <header className="sticky top-0 z-40 bg-light-background/90 dark:bg-dark-background/90 border-b border-light-outline-variant/30 dark:border-dark-outline-variant/30 backdrop-blur-md transition-colors duration-200">
        <div className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin h-20 flex items-center justify-between gap-gutter-lg">
          {/* Brand Mark */}
          <Link
            href="/"
            className="flex items-center gap-3 shrink-0 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-light-primary dark:focus-visible:outline-dark-primary rounded-sm group"
          >
            <div className="transition-transform duration-300 group-hover:scale-105">
              <Image
                src="/platform-logo.svg"
                alt="BOLXolve Logo"
                width={34}
                height={36}
                className="h-8 w-auto object-contain shrink-0"
                priority
              />
            </div>
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
            <motion.button
              whileTap={{ scale: 0.92 }}
              onClick={toggleTheme}
              type="button"
              aria-label="Switch between dark and light theme"
              className="inline-flex items-center justify-center w-11 h-11 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors cursor-pointer"
            >
              {isDark ? (
                <Sun className="h-5 w-5 text-dark-primary transition-transform duration-300 rotate-0 hover:rotate-45" aria-hidden="true" />
              ) : (
                <Moon className="h-5 w-5 text-light-on-surface transition-transform duration-300 rotate-0 hover:-rotate-12" aria-hidden="true" />
              )}
            </motion.button>

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

            <motion.a
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              href="#pricing"
              className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-all font-label text-label-lg shadow-sm"
            >
              <span>Get Started</span>
            </motion.a>
          </div>
        </div>
      </header>

      <main>
        {/* Hero: Centered Editorial Statement + Panoramic 3-Stage Pipeline Strip */}
        <section
          id="pipeline"
          className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin pt-section-md pb-section-md md:pt-section-lg md:pb-section-lg flex flex-col gap-section-sm"
        >
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="max-w-4xl mx-auto text-center flex flex-col items-center gap-gutter-lg"
          >
            <motion.span
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.45, delay: 0.1 }}
              className="font-label text-label-sm uppercase tracking-widest text-light-primary dark:text-dark-primary px-3 py-1 rounded-full bg-light-primary/10 dark:bg-dark-primary/10 border border-light-primary/20 dark:border-dark-primary/20"
            >
              Invoice Pipeline &amp; Revenue Assurance
            </motion.span>

            <motion.h1
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="font-headline text-display-lg-mobile md:text-display-lg text-light-on-surface dark:text-dark-on-surface text-balance"
            >
              The simple invoice pipeline that stops cashier theft.
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.25, ease: [0.16, 1, 0.3, 1] }}
              className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-2xl text-pretty"
            >
              Monitor every sale in real-time, approve discounts and receipt reprints from your phone, and prevent revenue
              leakages across all your branches.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.35 }}
              className="flex flex-wrap items-center justify-center gap-gutter-md pt-gutter-xs"
            >
              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href="#pricing"
                className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-all shadow-sm"
              >
                <span className="font-label text-label-lg">View Subscription Plans</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </motion.a>

              <motion.a
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                href={getWhatsAppLink()}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-all"
              >
                <MessageCircle className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true" />
                <span className="font-label text-label-lg">Talk to Us on WhatsApp</span>
              </motion.a>
            </motion.div>
          </motion.div>

          {/* Panoramic 3-Stage Revenue Assurance Architecture */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="rounded-xl bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant overflow-hidden shadow-sm"
          >
            {/* Stage Header Bar */}
            <div className="px-gutter-lg md:px-gutter-xl py-gutter-md border-b border-light-outline-variant/40 dark:border-dark-outline-variant/40 flex flex-wrap items-center justify-between gap-gutter-md bg-light-surface-container-low/30 dark:bg-dark-surface-container/20">
              <div className="flex items-center gap-gutter-sm">
                <Activity className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true" />
                <span className="font-label text-label-lg text-light-on-surface dark:text-dark-on-surface font-semibold">
                  Live Assurance Flow
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-gutter-lg text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <span className="font-mono text-mono-sm">Thermal slip &amp; A4 PDF</span>
                <span className="font-mono text-mono-sm">Quotes &amp; Delivery Waybills</span>
                <span className="font-mono text-mono-sm">Tamper-proof audit log</span>
                <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary font-medium">
                  Multi-branch sync
                </span>
              </div>
            </div>

            {/* 3-Column Horizontal Pipeline */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-light-outline-variant/40 dark:divide-dark-outline-variant/40">
              {/* Stage 1: Cashier Desk */}
              <div className="p-gutter-lg md:p-gutter-xl flex flex-col justify-between gap-gutter-lg hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/30 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex flex-col gap-gutter-sm">
                  <div className="flex items-center justify-between gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      01 · Cashier Desk
                    </span>
                    <FileText className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true" />
                  </div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    Serialized Slip Issued
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Every sale locks immediately on print—no silent edits, price drops, or pocketed cash.
                  </p>
                </div>
                <div className="p-gutter-md rounded-md bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between gap-gutter-sm border border-light-outline-variant/30 dark:border-dark-outline-variant/30">
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">#INV-0482 · 80mm</span>
                  <span className="font-mono text-mono-sm text-light-primary dark:text-dark-primary font-semibold">
                    LOCKED
                  </span>
                </div>
              </div>

              {/* Stage 2: Owner Approval */}
              <div className="p-gutter-lg md:p-gutter-xl flex flex-col justify-between gap-gutter-lg hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/30 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex flex-col gap-gutter-sm">
                  <div className="flex items-center justify-between gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      02 · Owner Mobile
                    </span>
                    <Lock className="h-4 w-4 text-light-secondary dark:text-dark-secondary shrink-0" aria-hidden="true" />
                  </div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    Approval Gatekeeper
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Reprints, discounts, or voids pause for your one-tap authorization from anywhere.
                  </p>
                </div>
                <div className="p-gutter-md rounded-md bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between gap-gutter-sm border border-light-outline-variant/30 dark:border-dark-outline-variant/30">
                  <span className="font-mono text-mono-sm text-light-on-surface dark:text-dark-on-surface">Reprint · ₦42,500</span>
                  <span className="font-mono text-mono-sm text-light-secondary dark:text-dark-secondary font-semibold">
                    PENDING
                  </span>
                </div>
              </div>

              {/* Stage 3: Consolidated Ledger */}
              <div className="p-gutter-lg md:p-gutter-xl flex flex-col justify-between gap-gutter-lg hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/30 hover:-translate-y-0.5 transition-all duration-300">
                <div className="flex flex-col gap-gutter-sm">
                  <div className="flex items-center justify-between gap-gutter-sm">
                    <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                      03 · Owner Dashboard
                    </span>
                    <ShieldCheck className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true" />
                  </div>
                  <h2 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                    All Depots Synced
                  </h2>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Real-time consolidated revenue across every physical branch and cashier shift.
                  </p>
                </div>
                <div className="p-gutter-md rounded-md bg-light-surface-container-low dark:bg-dark-surface-container flex items-center justify-between gap-gutter-sm border border-light-outline-variant/30 dark:border-dark-outline-variant/30">
                  <span className="font-mono text-mono-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">30D Total</span>
                  <span className="font-mono text-mono-sm tabular-nums text-light-primary dark:text-dark-primary font-bold">₦17,510,675.00</span>
                </div>
              </div>
            </div>
          </motion.div>
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
                {controlData.map((tab, idx) => {
                  const isSelected = activeControlTab === idx;
                  return (
                    <button
                      key={tab.badge}
                      type="button"
                      onClick={() => setActiveControlTab(idx)}
                      className={`relative text-left p-gutter-lg rounded-md transition-all duration-200 cursor-pointer flex flex-col gap-gutter-xs overflow-hidden ${
                        isSelected
                          ? 'bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-2 border-light-primary dark:border-dark-primary shadow-sm'
                          : 'bg-light-surface-container-lowest/60 dark:bg-dark-surface-container-low/60 border border-light-outline-variant dark:border-dark-outline-variant hover:border-light-primary/50 dark:hover:border-dark-primary/50'
                      }`}
                    >
                      {isSelected && (
                        <motion.div
                          layoutId="activeTabIndicator"
                          className="absolute left-0 top-0 bottom-0 w-1.5 bg-light-primary dark:bg-dark-primary"
                          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                        />
                      )}
                      <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                        {tab.tabTitle}
                      </span>
                      <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant">
                        {tab.tabSubtitle}
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right Dynamic Detail Stage (7 cols) */}
              <div className="lg:col-span-7 rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant p-gutter-xl flex flex-col justify-between gap-gutter-xl shadow-sm">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={activeControlTab}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -12 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                    className="flex flex-col gap-gutter-md"
                  >
                    <div className="flex items-center justify-between gap-gutter-md">
                      <div className="w-12 h-12 rounded-lg bg-light-surface-variant dark:bg-dark-surface-container-high flex items-center justify-center text-light-primary dark:text-dark-primary shadow-sm">
                        <CurrentControlIcon className="h-6 w-6" aria-hidden="true" />
                      </div>
                      <span className="font-mono text-mono-sm px-gutter-sm py-1 rounded bg-light-surface-container-low dark:bg-dark-surface-container text-light-primary dark:text-dark-primary font-semibold border border-light-outline-variant/30 dark:border-dark-outline-variant/30">
                        {currentControl.badge}
                      </span>
                    </div>

                    <h3 className="font-headline text-headline-md text-light-on-surface dark:text-dark-on-surface">
                      {currentControl.title}
                    </h3>

                    <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty leading-relaxed">
                      {currentControl.body}
                    </p>
                  </motion.div>
                </AnimatePresence>

                {/* Sectors Covered */}
                <div className="pt-gutter-lg border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 flex flex-col gap-gutter-sm">
                  <span className="font-label text-label-sm uppercase tracking-wider text-light-on-surface-variant dark:text-dark-on-surface-variant">
                    Trusted across Nigerian trade &amp; wholesale
                  </span>
                  <div className="flex flex-wrap items-center gap-gutter-sm">
                    {['Building Materials', 'Supermarkets & Retail', 'Wholesale Depots', 'Auto Spare Parts', 'Multi-Branch Outlets'].map((sector) => (
                      <span
                        key={sector}
                        className="font-label text-label-sm px-gutter-md py-gutter-xs rounded-full bg-light-surface-container-low dark:bg-dark-surface-container text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant/20 dark:border-dark-outline-variant/20"
                      >
                        {sector}
                      </span>
                    ))}
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
            {capabilities.map((cap, i) => {
              const CapIcon = cap.icon;
              return (
                <motion.div
                  key={cap.title}
                  initial={{ opacity: 0, y: 14 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-30px' }}
                  transition={{ duration: 0.45, delay: i * 0.08, ease: 'easeOut' }}
                  className="group py-gutter-xl grid grid-cols-1 md:grid-cols-12 gap-gutter-md md:gap-gutter-xl items-start md:items-center px-gutter-md -mx-gutter-md rounded-lg hover:bg-light-surface-container-low/50 dark:hover:bg-dark-surface-container/30 transition-all duration-200"
                >
                  <div className="md:col-span-4 flex items-center gap-gutter-md">
                    <div className="w-10 h-10 rounded-md bg-light-surface-variant/60 dark:bg-dark-surface-container flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform duration-200 border border-light-outline-variant/20 dark:border-dark-outline-variant/20">
                      <CapIcon className="h-5 w-5 text-light-primary dark:text-dark-primary shrink-0" aria-hidden="true" />
                    </div>
                    <h3 className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                      {cap.title}
                    </h3>
                  </div>
                  <p className="md:col-span-6 font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                    {cap.desc}
                  </p>
                  <div className="md:col-span-2 md:text-right">
                    <span className={`font-mono text-mono-sm font-semibold ${cap.tagColor}`}>
                      {cap.tag}
                    </span>
                  </div>
                </motion.div>
              );
            })}
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

              {/* Smooth Animated Billing Cycle Switch with Sliding Pill */}
              <div className="relative inline-flex items-center p-1 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant self-start">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`relative z-10 px-gutter-md py-2 rounded-full font-label text-label-lg transition-colors cursor-pointer whitespace-nowrap ${
                    billingCycle === 'monthly'
                      ? 'text-light-on-primary dark:text-dark-on-primary font-semibold'
                      : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                  }`}
                >
                  {billingCycle === 'monthly' && (
                    <motion.span
                      layoutId="billingPill"
                      className="absolute inset-0 rounded-full bg-light-primary dark:bg-dark-primary -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  Monthly
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`relative z-10 px-gutter-md py-2 rounded-full font-label text-label-lg transition-colors cursor-pointer flex items-center gap-gutter-xs whitespace-nowrap ${
                    billingCycle === 'annual'
                      ? 'text-light-on-primary dark:text-dark-on-primary font-semibold'
                      : 'text-light-on-surface-variant dark:text-dark-on-surface-variant hover:text-light-on-surface dark:hover:text-dark-on-surface'
                  }`}
                >
                  {billingCycle === 'annual' && (
                    <motion.span
                      layoutId="billingPill"
                      className="absolute inset-0 rounded-full bg-light-primary dark:bg-dark-primary -z-10 shadow-sm"
                      transition={{ type: 'spring', stiffness: 450, damping: 32 }}
                    />
                  )}
                  <span>Annual (2 Months Free)</span>
                  <span
                    className={`text-label-sm font-bold ${
                      billingCycle === 'annual'
                        ? 'text-light-on-primary/90 dark:text-dark-on-primary/90'
                        : 'text-light-primary dark:text-dark-primary'
                    }`}
                  >
                    Save 17%
                  </span>
                </button>
              </div>
            </div>

            {/* 3-Tier Architectural Pricing Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-gutter-lg items-stretch">
              {/* Starter */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                whileHover={{ y: -8, scale: 1.01 }}
                transition={{ duration: 0.25, ease: 'easeOut' }}
                className="h-full p-gutter-xl rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant flex flex-col justify-between gap-gutter-xl shadow-sm hover:shadow-xl transition-shadow"
              >
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
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>3 Users:</strong> 1 Admin + 2 Cashiers
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Unlimited Thermal (58/80mm) &amp; A4 Invoices
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Cashier Reprint &amp; Void Approvals
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        10 Smart AI OCR scans/month
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <X className="h-4 w-4 text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant line-through">
                        Quotations &amp; Delivery Waybills
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <X className="h-4 w-4 text-light-on-surface-variant dark:text-dark-on-surface-variant shrink-0 mt-0.5" aria-hidden="true" />
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
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link
                      href={user ? '/subscriptions/manage' : '/register?plan=STARTER'}
                      className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg"
                    >
                      Choose Starter
                    </Link>
                  </motion.div>
                </footer>
              </motion.article>

              {/* Business (Most Popular) */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="h-full p-gutter-xl rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border-2 border-light-primary dark:border-dark-primary flex flex-col justify-between gap-gutter-xl shadow-md hover:shadow-2xl transition-shadow relative"
              >
                <div className="flex flex-col gap-gutter-lg">
                  <header className="flex flex-col gap-gutter-sm">
                    <div className="flex items-center justify-between gap-gutter-sm">
                      <span className="font-label text-label-sm uppercase tracking-wider text-light-primary dark:text-dark-primary font-bold">
                        Business
                      </span>
                      <span className="font-label text-label-sm px-gutter-sm py-0.5 rounded-full bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary font-semibold shadow-xs">
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
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>5 Users:</strong> 1 Admin + 4 Cashiers
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Thermal Slip &amp; A4 Invoices
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>Quotations + 1-Click Convert</strong> included
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>Goods Delivery Waybills &amp; Letters</strong> included
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>Custom Domain</strong> (portal.yourcompany.com)
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>Excel Export &amp; Shift Audit Logs</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        60 Smart AI OCR scans/month
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
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link
                      href={user ? '/subscriptions/manage' : '/register?plan=BUSINESS'}
                      className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-colors font-label text-label-lg shadow-sm"
                    >
                      Choose Business
                    </Link>
                  </motion.div>
                </footer>
              </motion.article>

              {/* Enterprise */}
              <motion.article
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.2 }}
                whileHover={{ y: -8, scale: 1.01 }}
                className="h-full p-gutter-xl rounded-lg bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant dark:border-dark-outline-variant flex flex-col justify-between gap-gutter-xl shadow-sm hover:shadow-xl transition-shadow"
              >
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
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>11 Users:</strong> 1 Owner + 2 Managers + 8 Cashiers
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        <strong>2 Physical Branches / Depots Included</strong>
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Full Suite: Invoices, Quotes, Waybills &amp; Letters
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Custom White-Label Domain &amp; Logo Branding
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Enterprise Audit History &amp; Real-Time Consolidation
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        150 Smart AI OCR scans/month
                      </span>
                    </li>
                    <li className="flex items-start gap-gutter-sm">
                      <Check className="h-4 w-4 text-light-primary dark:text-dark-primary shrink-0 mt-0.5" aria-hidden="true" />
                      <span className="font-body text-body-md text-light-on-surface dark:text-dark-on-surface">
                        Priority Dedicated Onboarding &amp; Cashier Training
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
                  <motion.div whileTap={{ scale: 0.98 }}>
                    <Link
                      href={user ? '/subscriptions/manage' : '/register?plan=ENTERPRISE'}
                      className="w-full inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg"
                    >
                      Choose Enterprise
                    </Link>
                  </motion.div>
                </footer>
              </motion.article>
            </div>
          </div>
        </section>

        {/* Section 4: Unified Closing Split (Left CTA + Right Hairline FAQ) */}
        <motion.section
          id="faq"
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin py-section-md md:py-section-lg"
        >
          <div id="closing" className="grid grid-cols-1 lg:grid-cols-12 gap-gutter-xl lg:gap-section-sm items-start">
            {/* Left Conversion Column (5 cols) */}
            <div className="lg:col-span-5 flex flex-col gap-gutter-lg">
              <h2 className="font-headline text-headline-lg-mobile md:text-headline-lg text-light-on-surface dark:text-dark-on-surface text-balance">
                Ready to stop revenue theft in your business?
              </h2>
              <p className="font-body text-body-lg text-light-on-surface-variant dark:text-dark-on-surface-variant text-pretty">
                Get started with BOLXolve Invoice today. Fast 24-hour onboarding for businesses and wholesale depots across Nigeria with ₦0 setup fee.
              </p>

              <div className="flex flex-wrap items-center gap-gutter-md pt-gutter-xs">
                <motion.a
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  href={getWhatsAppLink()}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-primary dark:bg-dark-primary text-light-on-primary dark:text-dark-on-primary hover:bg-light-primary-container dark:hover:bg-dark-primary-container transition-all whitespace-nowrap font-label text-label-lg shadow-sm"
                >
                  <MessageCircle className="h-4 w-4 shrink-0" aria-hidden="true" />
                  <span>Chat on WhatsApp (+234 708 703 5189)</span>
                </motion.a>

                <motion.div whileTap={{ scale: 0.98 }}>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center gap-gutter-sm px-gutter-lg py-3 rounded bg-light-surface-container-lowest dark:bg-dark-surface-container-low text-light-on-surface dark:text-dark-on-surface border border-light-outline-variant dark:border-dark-outline-variant hover:bg-light-surface-container-low dark:hover:bg-dark-surface-container transition-colors font-label text-label-lg"
                  >
                    <span>Existing Staff? Sign In</span>
                  </Link>
                </motion.div>
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
                    <ChevronDown className="h-5 w-5 text-light-primary dark:text-dark-primary transition-transform duration-200 group-open:rotate-180 shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Once an invoice is finalized and marked paid or printed, cashiers cannot edit the amounts, delete records, or issue secret discounts behind the owner&#39;s back. Any reprint or cancellation requires an authorized manager or owner approval. Every action is recorded in a tamper-proof audit log with exact cashier identity, timestamp, and device info.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      Can I create Quotations and Delivery Waybills too?
                    </span>
                    <ChevronDown className="h-5 w-5 text-light-primary dark:text-dark-primary transition-transform duration-200 group-open:rotate-180 shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Yes! BOLXolve Invoice includes a complete 4-in-1 document suite: Invoices, Quotations, Goods Delivery Waybills, and Formal Business Letters. You can create a quotation with validity terms and convert it directly to a paid invoice and delivery waybill in 1 click.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      Can I connect our custom domain (e.g. portal.mycompany.com)?
                    </span>
                    <ChevronDown className="h-5 w-5 text-light-primary dark:text-dark-primary transition-transform duration-200 group-open:rotate-180 shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Yes. Both Business and Enterprise plans include custom white-label domain mapping. Your cashiers and customers will log into your own portal with your company name, custom logo, and branded receipts.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      Can we use our existing thermal receipt printer?
                    </span>
                    <ChevronDown className="h-5 w-5 text-light-primary dark:text-dark-primary transition-transform duration-200 group-open:rotate-180 shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    Yes. BOLXolve Invoice connects directly with standard 58mm and 80mm thermal receipt printers without proprietary hardware, as well as regular A4 office laser printers.
                  </p>
                </details>

                <details name="faq-group" className="group py-gutter-lg border-b border-light-outline-variant/50 dark:border-dark-outline-variant/50">
                  <summary className="flex items-center justify-between gap-gutter-md cursor-pointer list-none select-none">
                    <span className="font-title text-title-lg text-light-on-surface dark:text-dark-on-surface">
                      How do payments work and how fast is activation?
                    </span>
                    <ChevronDown className="h-5 w-5 text-light-primary dark:text-dark-primary transition-transform duration-200 group-open:rotate-180 shrink-0" aria-hidden="true" />
                  </summary>
                  <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant pt-gutter-md text-pretty">
                    You can pay in Naira via instant automated bank transfer powered by Squad (GTCO) and Lenco Virtual Accounts. Once your transfer is sent, your account and staff quotas activate automatically within seconds with ₦0 setup fee.
                  </p>
                </details>
              </div>
            </div>
          </div>
        </motion.section>
      </main>

      {/* Enhanced Architectural Footer with Noticeable Micro-Interactions */}
      <motion.footer
        initial={{ opacity: 0, y: 35 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: '-30px' }}
        transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
        className="border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 bg-light-surface-container-low/50 dark:bg-dark-surface-container-lowest relative overflow-hidden"
      >
        {/* Subtle Bottom Ambient Glow */}
        <div
          className="absolute bottom-0 right-1/4 w-96 h-48 bg-gradient-to-t from-light-primary/5 dark:from-dark-primary/10 to-transparent blur-3xl pointer-events-none -z-10"
          aria-hidden="true"
        />

        <div className="max-w-7xl mx-auto px-gutter-lg md:px-page-margin py-section-sm md:py-section-md flex flex-col gap-section-sm">
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter-xl">
            {/* Brand Statement */}
            <div className="md:col-span-5 flex flex-col items-start gap-gutter-md">
              <Link href="/" className="flex items-center gap-3 group">
                <div className="transition-transform duration-300 group-hover:scale-105 group-hover:rotate-3">
                  <Image
                    src="/platform-logo.svg"
                    alt="BOLXolve Logo"
                    width={32}
                    height={34}
                    className="h-8 w-auto object-contain shrink-0"
                  />
                </div>
                <span className="font-headline text-headline-sm text-light-on-surface dark:text-dark-on-surface">
                  BOLXolve <span className="text-light-primary dark:text-dark-primary">Invoice</span>
                </span>
              </Link>
              <p className="font-body text-body-md text-light-on-surface-variant dark:text-dark-on-surface-variant max-w-sm text-pretty leading-relaxed">
                The tamper-proof invoice pipeline and revenue assurance platform built for Nigerian business owners. Eliminate cashier fraud, track branch revenue, and secure every transaction in real-time.
              </p>
              <div className="pt-1 flex items-center gap-2 text-xs font-mono text-light-on-surface-variant dark:text-dark-on-surface-variant">
                <span>WhatsApp:</span>
                <a
                  href="https://wa.me/2347087035189"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-light-primary dark:text-dark-primary hover:underline font-semibold"
                >
                  +234 708 703 5189
                </a>
              </div>
            </div>

            {/* Product Column */}
            <div className="md:col-span-2 flex flex-col gap-gutter-sm">
              <h3 className="font-label text-label-sm uppercase tracking-wider text-light-on-surface dark:text-dark-on-surface font-bold">
                Product
              </h3>
              <ul className="flex flex-col gap-2.5 text-light-on-surface-variant dark:text-dark-on-surface-variant text-sm">
                {[
                  { label: 'How It Works', href: '#pipeline' },
                  { label: 'Anti-Theft Approvals', href: '#anti-theft' },
                  { label: 'Multi-Branch Sync', href: '#capabilities' },
                  { label: 'Quotations & Waybills', href: '#capabilities' },
                  { label: 'Thermal & A4 Invoices', href: '#capabilities' },
                  { label: 'Smart AI Slip OCR', href: '#capabilities' },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="inline-flex items-center transition-all duration-200 hover:translate-x-1.5 hover:text-light-primary dark:hover:text-dark-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Businesses Column */}
            <div className="md:col-span-2 flex flex-col gap-gutter-sm">
              <h3 className="font-label text-label-sm uppercase tracking-wider text-light-on-surface dark:text-dark-on-surface font-bold">
                Businesses
              </h3>
              <ul className="flex flex-col gap-2.5 text-light-on-surface-variant dark:text-dark-on-surface-variant text-sm">
                {[
                  { label: 'Building Materials', href: '#anti-theft' },
                  { label: 'Supermarkets & Retail', href: '#anti-theft' },
                  { label: 'Wholesale Depots', href: '#anti-theft' },
                  { label: 'Pharmacies & Stores', href: '#anti-theft' },
                  { label: 'Auto Spare Parts', href: '#anti-theft' },
                ].map((item) => (
                  <li key={item.label}>
                    <a
                      href={item.href}
                      className="inline-flex items-center transition-all duration-200 hover:translate-x-1.5 hover:text-light-primary dark:hover:text-dark-primary"
                    >
                      {item.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            {/* Commercial Column */}
            <div className="md:col-span-3 flex flex-col gap-gutter-sm">
              <h3 className="font-label text-label-sm uppercase tracking-wider text-light-on-surface dark:text-dark-on-surface font-bold">
                Commercial
              </h3>
              <ul className="flex flex-col gap-2.5 text-light-on-surface-variant dark:text-dark-on-surface-variant text-sm">
                <li>
                  <a
                    href="#pricing"
                    className="inline-flex items-center transition-all duration-200 hover:translate-x-1.5 hover:text-light-primary dark:hover:text-dark-primary"
                  >
                    Starter (₦6,500/mo)
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="inline-flex items-center transition-all duration-200 hover:translate-x-1.5 hover:text-light-primary dark:hover:text-dark-primary"
                  >
                    Business (₦10,500/mo)
                  </a>
                </li>
                <li>
                  <a
                    href="#pricing"
                    className="inline-flex items-center transition-all duration-200 hover:translate-x-1.5 hover:text-light-primary dark:hover:text-dark-primary"
                  >
                    Enterprise (₦20,000/mo)
                  </a>
                </li>
                <li>
                  <a
                    href="#faq"
                    className="inline-flex items-center transition-all duration-200 hover:translate-x-1.5 hover:text-light-primary dark:hover:text-dark-primary"
                  >
                    Frequently Asked Questions
                  </a>
                </li>
                <li className="pt-1">
                  <Link
                    href="/login"
                    className="font-label text-label-lg text-light-primary dark:text-dark-primary inline-flex items-center gap-1 group transition-all duration-200 hover:translate-x-1"
                  >
                    <span>Staff &amp; Owner Login</span>
                    <ArrowRight className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1" aria-hidden="true" />
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar with Enhanced Interactive Backlink */}
          <div className="pt-gutter-lg border-t border-light-outline-variant/40 dark:border-dark-outline-variant/40 flex flex-col sm:flex-row items-center justify-between gap-gutter-md">
            <span className="font-label text-label-sm text-light-on-surface-variant dark:text-dark-on-surface-variant">
              © 2026 BOLXOLVE LTD (RC: 9940684). All rights reserved.
            </span>
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://bolxolve.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-light-surface-container-lowest dark:bg-dark-surface-container-low border border-light-outline-variant/60 dark:border-dark-outline-variant/60 text-light-on-surface-variant dark:text-dark-on-surface-variant hover:border-light-primary dark:hover:border-dark-primary hover:text-light-primary dark:hover:text-dark-primary transition-all duration-200 font-mono text-mono-sm group shadow-xs cursor-pointer"
            >
              <span>bolxolve.com</span>
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden="true" />
            </motion.a>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}
