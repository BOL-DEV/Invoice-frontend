'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../features/auth/context/AuthContext';
import {
  Sparkles,
  Printer,
  FileSpreadsheet,
  Layers,
  ShieldCheck,
  Check,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  Store,
  Users,
  Lock,
  Zap,
  Globe,
  Receipt,
  CheckCircle2,
  TrendingUp,
  Cpu,
  BadgeCheck,
  Building2,
  ShieldAlert,
  Smartphone,
  ExternalLink,
  MessageCircle,
  Clock,
  HelpCircle,
  Menu,
  X,
  Plus,
} from 'lucide-react';
import { Button } from '../components/ui/button';
import { Badge } from '../components/ui/badge';

export default function LandingPage() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');

  // Interactive Product Demo Tab
  const [activeTab, setActiveTab] = useState<'pos' | 'ai' | 'branches'>('pos');

  // Interactive Add-on Calculator State
  const [calcPlan, setCalcPlan] = useState<'STARTER' | 'BUSINESS' | 'ENTERPRISE'>('BUSINESS');
  const [calcExtraCashiers, setCalcExtraCashiers] = useState<number>(0);
  const [calcExtraBranches, setCalcExtraBranches] = useState<number>(0);
  const [calcAiPacks, setCalcAiPacks] = useState<number>(0);
  const [calcCustomDomain, setCalcCustomDomain] = useState<boolean>(false);
  const [calcTemplateComplexity, setCalcTemplateComplexity] = useState<'none' | 'simple' | 'advanced' | 'bespoke'>('simple');

  // FAQ open/close state
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Pricing calculations
  const planPrices = {
    STARTER: { monthly: 6000, annual: 60000, setup: 10000, staffDesc: '3 Users (1 Admin + 2 Cashiers)', aiDesc: '15 AI Vision scans/mo', format: 'PDF Only' },
    BUSINESS: { monthly: 20000, annual: 200000, setup: 15000, staffDesc: '5 Users (1 Admin + 4 Cashiers)', aiDesc: '150 AI Vision scans/mo', format: 'PDF & Excel Export' },
    ENTERPRISE: { monthly: 40000, annual: 400000, setup: 25000, staffDesc: '11 Users (1 Admin + 2 Sub-admins + 8 Cashiers)', aiDesc: '300 AI Vision scans/mo', format: 'PDF & Excel Export' },
  };

  const templatePrices = {
    none: 0,
    simple: 5000,
    advanced: 10000,
    bespoke: 15000,
  };

  const selectedPlanData = planPrices[calcPlan];
  const baseSubPrice = billingCycle === 'monthly' ? selectedPlanData.monthly : Math.round(selectedPlanData.annual / 12);
  const extraCashiersTotal = calcExtraCashiers * 2000;
  const extraBranchesTotal = calcExtraBranches * 5000;
  const extraAiTotal = calcAiPacks * 5000;
  const totalMonthlySpend = baseSubPrice + extraCashiersTotal + extraBranchesTotal + extraAiTotal;

  const oneOffSetupTotal = selectedPlanData.setup + (calcCustomDomain ? 10000 : 0) + templatePrices[calcTemplateComplexity];

  // WhatsApp Pre-filled message generator
  const getWhatsAppLink = () => {
    const text = encodeURIComponent(
      `Hello BOLXolve Team, I would like to onboard on the ${calcPlan} plan with ${billingCycle} billing.\n` +
      `- Extra Cashiers: ${calcExtraCashiers}\n` +
      `- Extra Branches: ${calcExtraBranches}\n` +
      `- AI Packs: ${calcAiPacks} (100 scans each)\n` +
      `- Custom Domain: ${calcCustomDomain ? 'Yes (₦10,000)' : 'No'}\n` +
      `- Template Customization: ${calcTemplateComplexity.toUpperCase()} (₦${templatePrices[calcTemplateComplexity].toLocaleString()})\n` +
      `Estimated Monthly: ₦${totalMonthlySpend.toLocaleString()} | One-off Setup: ₦${oneOffSetupTotal.toLocaleString()}`
    );
    return `https://wa.me/2348000000000?text=${text}`;
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-slate-100 selection:bg-emerald-500 selection:text-white font-sans antialiased overflow-x-hidden">
      
      {/* Background Radial Glow Effects */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-[-10%] left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-gradient-to-b from-emerald-500/15 via-teal-500/5 to-transparent blur-[120px] rounded-full" />
        <div className="absolute top-[35%] left-[-150px] w-[500px] h-[500px] bg-emerald-600/10 blur-[140px] rounded-full" />
        <div className="absolute top-[60%] right-[-150px] w-[500px] h-[500px] bg-indigo-600/10 blur-[140px] rounded-full" />
      </div>

      {/* ========================================================= */}
      {/* TOP USER BANNER (IF LOGGED IN)                            */}
      {/* ========================================================= */}
      {user && (
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-emerald-950 border-b border-emerald-500/30 py-2.5 px-4 sticky top-0 z-50 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center space-x-2 text-emerald-300">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Active session detected for <strong>{user.firstName || 'User'}</strong> ({user.role})</span>
          </div>
          <Link href="/dashboard">
            <Button size="sm" className="h-7 text-xs bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-lg px-3 flex items-center space-x-1">
              <span>Go to Workspace Dashboard</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </Link>
        </div>
      )}

      {/* ========================================================= */}
      {/* NAVIGATION BAR                                            */}
      {/* ========================================================= */}
      <header className={`relative z-40 w-full border-b border-slate-800/80 backdrop-blur-xl bg-[#090D16]/80 ${user ? '' : 'sticky top-0'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 group">
            <div className="h-10 w-10 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <Receipt className="h-5 w-5 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <span className="text-lg font-bold font-heading tracking-tight text-white block">
                BOLXolve <span className="text-emerald-400">Invoice</span>
              </span>
              <span className="text-[10px] text-slate-400 block font-mono">Retail POS & Cloud Ledger</span>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-emerald-400 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-emerald-400 transition-colors">Industries</a>
            <a href="#pricing" className="hover:text-emerald-400 transition-colors">Pricing & Plans</a>
            <a href="#calculator" className="hover:text-emerald-400 transition-colors">Cost Calculator</a>
            <a href="#faq" className="hover:text-emerald-400 transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="hidden md:flex items-center space-x-3.5">
            <Link href="/login">
              <Button variant="ghost" className="text-xs font-semibold text-slate-300 hover:text-white hover:bg-slate-800/60 rounded-xl h-10 px-4">
                Sign In to Terminal
              </Button>
            </Link>
            <a href="#pricing">
              <Button className="h-10 text-xs font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-xl px-5 shadow-lg shadow-emerald-500/25 transition-all">
                Get Started
              </Button>
            </a>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800/60"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Dropdown */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden border-b border-slate-800 bg-[#090D16] px-4 pt-2 pb-6 space-y-4"
            >
              <div className="flex flex-col space-y-3 text-sm font-medium">
                <a href="#features" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-emerald-400 py-1">Features</a>
                <a href="#solutions" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-emerald-400 py-1">Industries</a>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-emerald-400 py-1">Pricing & Plans</a>
                <a href="#calculator" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-emerald-400 py-1">Cost Calculator</a>
                <a href="#faq" onClick={() => setMobileMenuOpen(false)} className="text-slate-300 hover:text-emerald-400 py-1">FAQ</a>
              </div>
              <div className="pt-2 flex flex-col space-y-2">
                <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs font-semibold border-slate-800 rounded-xl h-11">
                    Sign In to Terminal
                  </Button>
                </Link>
                <a href="#pricing" onClick={() => setMobileMenuOpen(false)}>
                  <Button className="w-full text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl h-11">
                    Get Started
                  </Button>
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>

      {/* ========================================================= */}
      {/* HERO SECTION                                              */}
      {/* ========================================================= */}
      <section className="relative z-10 pt-16 pb-20 md:pt-24 md:pb-32 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-4xl mx-auto space-y-6">
          
          {/* Top Tag Pill */}
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-medium shadow-inner"
          >
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>The Retail POS & Invoicing Platform Built for Nigerian Commerce</span>
          </motion.div>

          {/* Hero Headline */}
          <motion.h1
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-5xl md:text-6xl font-extrabold font-heading tracking-tight text-white leading-[1.12]"
          >
            Lightning-Fast POS,{' '}
            <span className="bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent">
              AI Document Scanning
            </span>{' '}
            & Multi-Branch Sync.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-base sm:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed"
          >
            Generate professional receipts in seconds, prevent cashier fraud with manager reprint approvals, digitize handwritten paper invoices with AI Vision, and manage multiple outlets seamlessly.
          </motion.p>

          {/* CTAs */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-3.5 pt-2"
          >
            <a href="#pricing">
              <Button className="w-full sm:w-auto h-12 px-8 text-sm font-bold bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2 cursor-pointer transition-all hover:scale-[1.02]">
                <span>Choose Your Subscription</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </a>
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-7 text-sm font-semibold border-slate-700/80 bg-slate-900/60 hover:bg-slate-800 text-slate-200 rounded-2xl flex items-center justify-center space-x-2 cursor-pointer">
                <span>Cashier Terminal Login</span>
                <Lock className="h-4 w-4 text-emerald-400" />
              </Button>
            </Link>
          </motion.div>

          {/* Micro Trust Indicators */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-400 font-medium"
          >
            <div className="flex items-center space-x-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Thermal (58mm/80mm) & A4 PDF</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Tamper-Proof Audit History</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <Check className="h-4 w-4 text-emerald-400" />
              <span>Runs on Any Laptop, Phone or Tablet</span>
            </div>
          </motion.div>
        </div>

        {/* ========================================================= */}
        {/* INTERACTIVE PRODUCT TERMINAL SHOWCASE                     */}
        {/* ========================================================= */}
        <motion.div
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35, duration: 0.4 }}
          className="mt-14 max-w-5xl mx-auto rounded-3xl border border-slate-700/60 bg-slate-900/40 backdrop-blur-2xl p-4 sm:p-7 shadow-2xl shadow-emerald-950/40 relative overflow-hidden group"
        >
          {/* Top Bar Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-5 border-b border-slate-800/90">
            <div className="flex items-center space-x-2">
              <div className="flex space-x-1.5">
                <span className="h-3 w-3 rounded-full bg-rose-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
                <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
              </div>
              <span className="text-xs text-slate-400 font-mono ml-2 hidden sm:inline">terminal.invoice.bolxolve.com</span>
            </div>

            {/* Showcase Mode Switcher */}
            <div className="flex items-center p-1 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <button
                onClick={() => setActiveTab('pos')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${activeTab === 'pos' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                POS Checkout & Receipt
              </button>
              <button
                onClick={() => setActiveTab('ai')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${activeTab === 'ai' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Sparkles className="h-3 w-3" />
                <span>AI Vision Scanner</span>
              </button>
              <button
                onClick={() => setActiveTab('branches')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 ${activeTab === 'branches' ? 'bg-emerald-500 text-slate-950 font-bold shadow' : 'text-slate-400 hover:text-white'}`}
              >
                <Layers className="h-3 w-3" />
                <span>Branch HQ Sync</span>
              </button>
            </div>
          </div>

          {/* Interactive Preview Canvas */}
          <div className="pt-6">
            {activeTab === 'pos' && (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Simulated Order Items */}
                <div className="lg:col-span-7 space-y-3.5">
                  <div className="flex items-center justify-between text-xs text-slate-400 border-b border-slate-800 pb-2">
                    <span>Item Description</span>
                    <span>Qty × Unit Price = Total</span>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">16mm TMT High-Tensile Steel Rebar</p>
                      <p className="text-[11px] text-slate-400">Construction Grade 500B • Length: 12m</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-emerald-400">₦450,000.00</p>
                      <p className="text-[10px] text-slate-400">30 lengths @ ₦15,000</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">Portland Limestone Cement (50kg)</p>
                      <p className="text-[11px] text-slate-400">Grade 42.5R Fast-setting</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-emerald-400">₦425,000.00</p>
                      <p className="text-[10px] text-slate-400">50 bags @ ₦8,500</p>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between text-xs">
                    <div>
                      <p className="font-bold text-white">Heavy-Duty Binding Wire (25kg Bundle)</p>
                      <p className="text-[11px] text-slate-400">Annealed Steel Coil</p>
                    </div>
                    <div className="text-right font-mono">
                      <p className="font-bold text-emerald-400">₦76,000.00</p>
                      <p className="text-[10px] text-slate-400">2 bundles @ ₦38,000</p>
                    </div>
                  </div>
                </div>

                {/* Simulated POS Summary & Actions */}
                <div className="lg:col-span-5 rounded-2xl bg-gradient-to-b from-slate-950 to-slate-900 border border-emerald-500/25 p-5 space-y-4">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <span className="text-xs font-semibold text-slate-300">Invoice: INV-2026-0841</span>
                    <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-[10px]">
                      READY TO PRINT
                    </Badge>
                  </div>

                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Subtotal (82 items)</span>
                      <span className="font-mono text-slate-200">₦951,000.00</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>VAT (7.5%)</span>
                      <span className="font-mono text-slate-200">₦71,325.00</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Discount (Bulk)</span>
                      <span className="font-mono text-rose-400">-₦22,325.00</span>
                    </div>
                    <div className="pt-2 border-t border-slate-800 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-white">Grand Total</span>
                      <span className="text-xl font-extrabold font-mono text-emerald-400">₦1,000,000.00</span>
                    </div>
                  </div>

                  <div className="pt-2 grid grid-cols-2 gap-2">
                    <Button className="h-10 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center space-x-1.5 shadow">
                      <Printer className="h-3.5 w-3.5" />
                      <span>Print Thermal</span>
                    </Button>
                    <Button variant="outline" className="h-10 text-xs font-semibold border-slate-700 rounded-xl hover:bg-slate-800 flex items-center justify-center space-x-1.5">
                      <Receipt className="h-3.5 w-3.5 text-emerald-400" />
                      <span>Download PDF</span>
                    </Button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'ai' && (
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 flex flex-col md:flex-row items-center gap-6">
                <div className="h-28 w-28 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center shrink-0">
                  <Sparkles className="h-12 w-12 text-emerald-400 animate-pulse" />
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <h3 className="text-base font-bold text-white font-heading">AI Receipt & Handwritten Slip Parser</h3>
                    <Badge className="bg-purple-500/10 text-purple-300 border-purple-500/20 text-[10px]">Zero Manual Typing</Badge>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Cashiers or managers can take a photo of handwritten customer order slips, paper delivery invoices, or WhatsApp receipts. The AI instantly extracts item names, unit quantities, dimensions, and prices directly into structured line items ready for checkout.
                  </p>
                  <p className="text-[11px] text-emerald-400 font-mono">
                    Included scans: Starter (15/mo) • Business (150/mo) • Enterprise (300/mo) • Top-up (+100 for ₦5,000)
                  </p>
                </div>
              </div>
            )}

            {activeTab === 'branches' && (
              <div className="p-6 rounded-2xl bg-slate-950/80 border border-emerald-500/30 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-white font-heading">HQ Command Center & Multi-Depot Synchronization</h3>
                    <p className="text-xs text-slate-400">Live consolidated ledger across physical branches and depot warehouses.</p>
                  </div>
                  <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
                    2 Branches Included on Enterprise
                  </Badge>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                    <p className="text-xs font-bold text-white">Central Head Depot (Lagos)</p>
                    <p className="text-[11px] text-slate-400 mt-1">1 Sub-admin • 4 Active Cashiers</p>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-2">₦4,850,000 today</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-slate-800 bg-slate-900/60">
                    <p className="text-xs font-bold text-white">Abuja Satellite Branch</p>
                    <p className="text-[11px] text-slate-400 mt-1">1 Sub-admin • 3 Active Cashiers</p>
                    <p className="text-sm font-mono font-bold text-emerald-400 mt-2">₦2,180,000 today</p>
                  </div>
                  <div className="p-3.5 rounded-xl border border-dashed border-slate-800 flex flex-col items-center justify-center text-center p-3">
                    <Plus className="h-5 w-5 text-slate-500" />
                    <p className="text-xs font-semibold text-slate-400 mt-1">Add Another Branch</p>
                    <p className="text-[10px] text-emerald-400 font-mono mt-0.5">+₦5,000/mo (or ₦10k with 4 cashiers)</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </section>

      {/* ========================================================= */}
      {/* INDUSTRIES & USE CASES                                    */}
      {/* ========================================================= */}
      <section id="solutions" className="py-16 border-y border-slate-800/80 bg-slate-950/60 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <h2 className="text-xs font-bold uppercase tracking-widest text-emerald-400">Built for High-Transaction Businesses</h2>
            <p className="text-2xl font-bold font-heading text-white mt-1.5">
              Engineered for Nigerian Retail & Wholesale Environments
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {[
              { title: 'Building Materials', desc: 'Rebar, cement & iron rods' },
              { title: 'Supermarkets & FMCG', desc: 'Fast barcoding & receipts' },
              { title: 'Pharmacies', desc: 'Medication billing & records' },
              { title: 'Wholesale Depots', desc: 'Bulk cart & truck dispatch' },
              { title: 'Fashion & Boutiques', desc: 'Customer receipts & orders' },
              { title: 'Tech & Electronics', desc: 'Serial numbers & warranties' },
            ].map((ind, i) => (
              <div key={i} className="p-4 rounded-2xl border border-slate-800/80 bg-slate-900/40 hover:border-emerald-500/40 transition-all text-center">
                <Store className="h-5 w-5 text-emerald-400 mx-auto mb-2" />
                <h4 className="text-xs font-bold text-white">{ind.title}</h4>
                <p className="text-[10px] text-slate-400 mt-0.5">{ind.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* 5 CORE PILLARS / FEATURES SHOWCASE                        */}
      {/* ========================================================= */}
      <section id="features" className="py-20 md:py-28 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
            Complete Operational Suite
          </Badge>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
            Everything Required to Operate a Modern Cashier Terminal
          </h2>
          <p className="text-sm text-slate-400">
            Eliminate messy paper invoice books, stop unrecorded cashier sales, and access daily performance analytics anywhere in the world.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Feature 1 */}
          <div className="p-7 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all duration-300 space-y-3.5 relative group">
            <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
              <Printer className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Thermal (58mm/80mm) & A4 PDF Printing</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connect to any standard USB, Bluetooth, or network thermal receipt printer. Generate instant customer slip receipts or download official A4 invoices with dynamic tax breakdowns.
            </p>
            <div className="pt-2 text-xs font-semibold text-emerald-400 flex items-center space-x-1">
              <span>Included across all tiers</span>
              <Check className="h-3.5 w-3.5" />
            </div>
          </div>

          {/* Feature 2 */}
          <div className="p-7 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all duration-300 space-y-3.5 relative group">
            <div className="h-12 w-12 rounded-2xl bg-purple-500/10 text-purple-400 flex items-center justify-center">
              <Sparkles className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">AI Vision Document & Jotting Slip Scanning</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never retype handwritten order slips manually again. Snap a phone photo and our Google Gemini Vision parser auto-detects products, quantities, and prices in seconds.
            </p>
            <div className="pt-2 text-xs font-semibold text-purple-400 flex items-center space-x-1">
              <span>15 / 150 / 300 scans included monthly</span>
            </div>
          </div>

          {/* Feature 3 */}
          <div className="p-7 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all duration-300 space-y-3.5 relative group">
            <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
              <ShieldCheck className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Anti-Fraud Approval Workflows</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prevent cashiers from printing duplicate receipts or modifying finalized orders without authorization. Reprint and invoice revision tickets require verified manager approval.
            </p>
            <div className="pt-2 text-xs font-semibold text-indigo-400 flex items-center space-x-1">
              <span>Active on Starter, Business & Enterprise</span>
            </div>
          </div>

          {/* Feature 4 */}
          <div className="p-7 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all duration-300 space-y-3.5 relative group">
            <div className="h-12 w-12 rounded-2xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Layers className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Multi-Branch Depot Architecture</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Manage head office and multiple physical branch locations in real-time. Sub-admins oversee branch cashiers while the business owner views company-wide consolidated analytics.
            </p>
            <div className="pt-2 text-xs font-semibold text-cyan-400 flex items-center space-x-1">
              <span>2 Branches included in Enterprise</span>
            </div>
          </div>

          {/* Feature 5 */}
          <div className="p-7 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all duration-300 space-y-3.5 relative group">
            <div className="h-12 w-12 rounded-2xl bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <Globe className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Custom Branded Domain Portals</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Run your invoicing platform on your own branded portal like <code>invoice.companyname.com</code>. White-label receipt logos, contact headers, and customer-facing templates.
            </p>
            <div className="pt-2 text-xs font-semibold text-teal-400 flex items-center space-x-1">
              <span>Available on ANY tier (₦10,000 add-on)</span>
            </div>
          </div>

          {/* Feature 6 */}
          <div className="p-7 rounded-3xl border border-slate-800 bg-slate-900/40 hover:border-emerald-500/40 transition-all duration-300 space-y-3.5 relative group">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
              <FileSpreadsheet className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-bold text-white font-heading">Audit Trails & Excel Exports</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Every invoice created, printed, or edited is recorded in an immutable audit ledger. Export monthly transaction spreadsheets directly to Microsoft Excel (.xlsx) for accounting.
            </p>
            <div className="pt-2 text-xs font-semibold text-amber-400 flex items-center space-x-1">
              <span>Included on Business & Enterprise tiers</span>
            </div>
          </div>

        </div>
      </section>

      {/* ========================================================= */}
      {/* PRICING SECTION                                           */}
      {/* ========================================================= */}
      <section id="pricing" className="py-20 md:py-28 border-t border-slate-800/80 bg-slate-950/80 relative z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
              Transparent Commercial Plans
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Predictable Pricing Built for Scaling Businesses
            </h2>
            <p className="text-sm text-slate-400">
              No hidden fees, no per-invoice commissions. Simple flat subscriptions tailored to your team size.
            </p>

            {/* Billing Toggle */}
            <div className="pt-4 flex items-center justify-center">
              <div className="p-1 rounded-2xl bg-slate-900 border border-slate-800 flex items-center space-x-2 text-xs">
                <button
                  type="button"
                  onClick={() => setBillingCycle('monthly')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all ${billingCycle === 'monthly' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  Monthly Billing
                </button>
                <button
                  type="button"
                  onClick={() => setBillingCycle('annual')}
                  className={`px-4 py-2 rounded-xl font-bold transition-all flex items-center space-x-1.5 ${billingCycle === 'annual' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-400 hover:text-white'}`}
                >
                  <span>Annual (2 Months Free)</span>
                  <span className="px-1.5 py-0.5 rounded-md bg-emerald-400/20 text-emerald-300 text-[10px]">SAVE 17%</span>
                </button>
              </div>
            </div>
          </div>

          {/* Pricing Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
            
            {/* Starter Plan */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-7 sm:p-8 flex flex-col justify-between space-y-6 relative hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold tracking-wider uppercase text-slate-400">STARTER</span>
                  <Badge variant="outline" className="border-slate-700 text-slate-300 text-[10px]">Small Retail</Badge>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                      ₦{billingCycle === 'monthly' ? '6,000' : '60,000'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === 'annual' ? '₦5,000/mo effective (Save ₦12,000/yr)' : 'Billed monthly recurring'}
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-300 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>3 Users Total:</strong> 1 Admin + 2 Cashiers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>15 AI Vision Scans</strong> per month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Unlimited PDF & Thermal Receipts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Cashier Reprint Approvals</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500">
                    <X className="h-4 w-4 text-slate-600 shrink-0" />
                    <span>Excel (.xlsx) Export (Locked)</span>
                  </div>
                  <div className="flex items-center space-x-2 text-slate-500">
                    <X className="h-4 w-4 text-slate-600 shrink-0" />
                    <span>Audit & Activity Logs (Locked)</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Setup & Onboarding:</span> ₦10,000 one-off fee
                </div>
              </div>

              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-11 text-xs font-bold rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white">
                  Get Started on Starter
                </Button>
              </a>
            </div>

            {/* Business Plan (FEATURED) */}
            <div className="rounded-3xl border-2 border-emerald-500 bg-gradient-to-b from-slate-900 via-slate-900/90 to-slate-950 p-7 sm:p-8 flex flex-col justify-between space-y-6 relative shadow-2xl shadow-emerald-950/50 scale-105 z-20">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full bg-emerald-500 text-slate-950 text-[10px] font-extrabold uppercase tracking-wider shadow">
                Most Popular
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold tracking-wider uppercase text-emerald-400">BUSINESS</span>
                  <Badge className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30 text-[10px]">Growing Shops</Badge>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                      ₦{billingCycle === 'monthly' ? '20,000' : '200,000'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === 'annual' ? '₦16,666/mo effective (Save ₦40,000/yr)' : 'Billed monthly recurring'}
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-300 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>5 Users Total:</strong> 1 Admin + 4 Cashiers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>150 AI Vision Scans</strong> per month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>PDF & Thermal Receipts</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Excel (.xlsx) Export</strong> unlocked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>Full Audit & Activity Logs</strong> unlocked</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Staff Management & Approvals</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Setup & Onboarding:</span> ₦15,000 one-off fee
                </div>
              </div>

              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-11 text-xs font-bold rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25">
                  Get Started on Business
                </Button>
              </a>
            </div>

            {/* Enterprise Plan */}
            <div className="rounded-3xl border border-slate-800 bg-slate-900/50 p-7 sm:p-8 flex flex-col justify-between space-y-6 relative hover:border-slate-700 transition-all">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-bold tracking-wider uppercase text-purple-400">ENTERPRISE</span>
                  <Badge variant="outline" className="border-purple-500/40 text-purple-300 text-[10px]">Multi-Branch</Badge>
                </div>
                <div>
                  <div className="flex items-baseline space-x-1">
                    <span className="text-3xl sm:text-4xl font-extrabold font-mono text-white">
                      ₦{billingCycle === 'monthly' ? '40,000' : '400,000'}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">/{billingCycle === 'monthly' ? 'month' : 'year'}</span>
                  </div>
                  <p className="text-[11px] text-slate-400 mt-1">
                    {billingCycle === 'annual' ? '₦33,333/mo effective (Save ₦80,000/yr)' : 'Billed monthly recurring'}
                  </p>
                </div>

                <div className="pt-2 text-xs text-slate-300 border-t border-slate-800 space-y-2.5">
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>11 Users Total:</strong> 1 Admin + 2 Sub-admins + 8 Cashiers</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>2 Branches Included</strong> with Depot Sync</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span><strong>300 AI Vision Scans</strong> per month</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>PDF + Excel Export</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Enterprise Audit History & Logs</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="h-4 w-4 text-emerald-400 shrink-0" />
                    <span>Priority Onboarding & Dedicated Support</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 text-[11px] text-slate-400">
                  <span className="font-semibold text-slate-300">Setup & Onboarding:</span> ₦25,000 one-off fee
                </div>
              </div>

              <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                <Button className="w-full h-11 text-xs font-bold rounded-xl border border-purple-500/50 bg-purple-950/50 hover:bg-purple-900/70 text-purple-200">
                  Deploy Enterprise
                </Button>
              </a>
            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* INTERACTIVE ADD-ONS & QUOTE ESTIMATOR                     */}
      {/* ========================================================= */}
      <section id="calculator" className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-4xl mx-auto rounded-3xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-6 sm:p-10 shadow-2xl space-y-8">
          
          <div className="text-center space-y-2">
            <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
              Modular Add-on Calculator
            </Badge>
            <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
              Customize Your Workspace Package
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Need extra cashiers, more branches, a branded domain, or a custom thermal receipt design? Calculate your exact total:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
            
            {/* Left Controls */}
            <div className="space-y-5">
              
              {/* Select Plan */}
              <div className="space-y-2">
                <label className="text-xs font-bold text-slate-300">1. Base Plan</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['STARTER', 'BUSINESS', 'ENTERPRISE'] as const).map((p) => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setCalcPlan(p)}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${calcPlan === p ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400' : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'}`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              {/* Extra Cashier Seats */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Extra Cashier Seats</span>
                  <span className="font-mono text-emerald-400">+₦2,000 / seat / mo</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Total extra cashier accounts:</span>
                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setCalcExtraCashiers(Math.max(0, calcExtraCashiers - 1))}
                      className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >-</button>
                    <span className="font-mono font-bold text-sm w-5 text-center">{calcExtraCashiers}</span>
                    <button
                      type="button"
                      onClick={() => setCalcExtraCashiers(calcExtraCashiers + 1)}
                      className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Extra Branches */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">Extra Branch Outlets</span>
                  <span className="font-mono text-emerald-400">+₦5,000 / branch / mo</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">Add physical depot locations:</span>
                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setCalcExtraBranches(Math.max(0, calcExtraBranches - 1))}
                      className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >-</button>
                    <span className="font-mono font-bold text-sm w-5 text-center">{calcExtraBranches}</span>
                    <button
                      type="button"
                      onClick={() => setCalcExtraBranches(calcExtraBranches + 1)}
                      className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >+</button>
                  </div>
                </div>
                <p className="text-[10px] text-emerald-400 italic">Tip: Special Bundle is ₦10,000/mo for 1 branch + 4 cashiers.</p>
              </div>

              {/* Extra AI Vision Scans Pack */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-white">AI Vision Top-Up Packs</span>
                  <span className="font-mono text-emerald-400">+₦5,000 per 100 scans</span>
                </div>
                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400">100 scans per pack:</span>
                  <div className="flex items-center space-x-2.5">
                    <button
                      type="button"
                      onClick={() => setCalcAiPacks(Math.max(0, calcAiPacks - 1))}
                      className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >-</button>
                    <span className="font-mono font-bold text-sm w-5 text-center">{calcAiPacks}</span>
                    <button
                      type="button"
                      onClick={() => setCalcAiPacks(calcAiPacks + 1)}
                      className="h-7 w-7 rounded-lg bg-slate-800 text-white font-bold flex items-center justify-center hover:bg-slate-700"
                    >+</button>
                  </div>
                </div>
              </div>

              {/* Custom Domain Toggle */}
              <label className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-950 border border-slate-800 cursor-pointer">
                <div>
                  <span className="text-xs font-semibold text-white block">Custom Domain Routing</span>
                  <span className="text-[10px] text-slate-400">e.g. invoice.companyname.com</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="font-mono text-xs text-purple-400">+₦10,000 setup</span>
                  <input
                    type="checkbox"
                    checked={calcCustomDomain}
                    onChange={(e) => setCalcCustomDomain(e.target.checked)}
                    className="h-4 w-4 rounded accent-emerald-500"
                  />
                </div>
              </label>

              {/* Custom Invoice Template Setup */}
              <div className="space-y-1.5 p-3.5 rounded-2xl bg-slate-950 border border-slate-800">
                <label className="text-xs font-semibold text-white block">Custom Invoice / Receipt Template</label>
                <select
                  value={calcTemplateComplexity}
                  onChange={(e) => setCalcTemplateComplexity(e.target.value as any)}
                  className="w-full h-9 rounded-xl border border-slate-700 bg-slate-900 text-xs px-3 text-slate-200"
                >
                  <option value="none">Default System Templates (Free / ₦0)</option>
                  <option value="simple">Simple Customization (Logo, Colors, Bank Details) - ₦5,000</option>
                  <option value="advanced">Advanced Layout (Warranty, Terms, Custom QR) - ₦10,000</option>
                  <option value="bespoke">Bespoke Physical Stationery Replica - ₦15,000</option>
                </select>
              </div>

            </div>

            {/* Right Summary Card */}
            <div className="rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-slate-950 to-slate-900 p-6 space-y-6 shadow-xl">
              <div className="pb-4 border-b border-slate-800">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-400">Estimated Total Quote</span>
                <h3 className="text-lg font-extrabold text-white font-heading mt-1">Package Breakdown</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Base Plan ({calcPlan}):</span>
                  <span className="font-mono text-white">₦{baseSubPrice.toLocaleString()}/mo</span>
                </div>
                {calcExtraCashiers > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{calcExtraCashiers} Extra Cashier(s):</span>
                    <span className="font-mono text-emerald-400">+₦{extraCashiersTotal.toLocaleString()}/mo</span>
                  </div>
                )}
                {calcExtraBranches > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{calcExtraBranches} Extra Branch(es):</span>
                    <span className="font-mono text-emerald-400">+₦{extraBranchesTotal.toLocaleString()}/mo</span>
                  </div>
                )}
                {calcAiPacks > 0 && (
                  <div className="flex justify-between">
                    <span className="text-slate-400">{calcAiPacks * 100} Extra AI Scans:</span>
                    <span className="font-mono text-emerald-400">+₦{extraAiTotal.toLocaleString()}/mo</span>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-800 flex justify-between items-baseline">
                  <span className="text-sm font-bold text-white">Recurring Total</span>
                  <span className="text-2xl font-black font-mono text-emerald-400">₦{totalMonthlySpend.toLocaleString()}<span className="text-xs text-slate-400 font-normal">/mo</span></span>
                </div>

                <div className="pt-3 border-t border-slate-800 space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-300 block">One-Off Setup & Onboarding Fees:</span>
                  <div className="flex justify-between text-slate-400 text-[11px]">
                    <span>Workspace Setup & Training:</span>
                    <span className="font-mono text-slate-300">₦{selectedPlanData.setup.toLocaleString()}</span>
                  </div>
                  {calcCustomDomain && (
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Custom Domain Routing Setup:</span>
                      <span className="font-mono text-slate-300">₦10,000</span>
                    </div>
                  )}
                  {calcTemplateComplexity !== 'none' && (
                    <div className="flex justify-between text-slate-400 text-[11px]">
                      <span>Custom Template Design:</span>
                      <span className="font-mono text-slate-300">₦{templatePrices[calcTemplateComplexity].toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-xs font-bold text-white pt-1">
                    <span>Total One-Off Setup:</span>
                    <span className="font-mono text-purple-400">₦{oneOffSetupTotal.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full h-12 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20">
                    <MessageCircle className="h-4 w-4" />
                    <span>Confirm & Setup via WhatsApp</span>
                  </Button>
                </a>
                <p className="text-[10px] text-center text-slate-400 mt-2">
                  Our deployment engineer will set up your terminal within 24 hours.
                </p>
              </div>

            </div>

          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FREQUENTLY ASKED QUESTIONS                                */}
      {/* ========================================================= */}
      <section id="faq" className="py-20 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center space-y-2 mb-12">
          <Badge className="bg-emerald-500/10 text-emerald-400 border-emerald-500/20 text-xs">
            Got Questions?
          </Badge>
          <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-white">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {[
            {
              q: 'Can we use our existing thermal receipt printer?',
              a: 'Yes! BOLXolve Invoice is fully compatible with standard 58mm and 80mm thermal printers (USB, Bluetooth, and network IP printers). It also generates standard A4 PDF invoices for corporate clients.',
            },
            {
              q: 'How does the AI Vision Document Scanner work?',
              a: 'You can snap a photo of any handwritten paper order note, supplier receipt, or WhatsApp screenshot. The Google Gemini Vision model parses the quantities, item descriptions, and prices into line items in under 3 seconds, eliminating manual data entry.',
            },
            {
              q: 'How do the anti-fraud cashier approval workflows operate?',
              a: 'Cashiers can create drafts and finalize sales. However, if a receipt is already printed and customer requests a reprint, or if an invoice requires alteration, the cashier must submit a reprint reason which an authorized store manager must digitally approve.',
            },
            {
              q: 'Can we use our own company domain name (e.g. invoice.company.com)?',
              a: 'Yes! Custom domain routing is available as a ₦10,000 modular add-on for ANY tier. We provide DNS CNAME instructions or can purchase and register the domain on your behalf.',
            },
            {
              q: 'What is included in the onboarding and setup fee?',
              a: 'Our team provisions your database workspace, configures your business identity, sets up cashier login accounts, tests your receipt printer connection, and conducts a 30-minute training session with your staff.',
            },
          ].map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl border border-slate-800/80 bg-slate-900/40 overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-5 text-left flex items-center justify-between text-sm font-bold text-white hover:text-emerald-400"
                >
                  <span>{item.q}</span>
                  {isOpen ? <ChevronUp className="h-4 w-4 text-emerald-400 shrink-0" /> : <ChevronDown className="h-4 w-4 text-slate-500 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-5 pb-5 text-xs text-slate-400 leading-relaxed border-t border-slate-800/50 pt-3">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* ========================================================= */}
      {/* FINAL HIGH-CONVERTING CTA                                 */}
      {/* ========================================================= */}
      <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-950/60 via-slate-900 to-teal-950/60 p-8 sm:p-14 text-center space-y-6 shadow-2xl relative overflow-hidden">
          <div className="max-w-2xl mx-auto space-y-3">
            <h2 className="text-3xl sm:text-4xl font-extrabold font-heading text-white">
              Ready to Stop Revenue Leakage and Modernize Your Invoicing?
            </h2>
            <p className="text-xs sm:text-sm text-slate-300">
              Join retail outlets, depots, and distributors across Nigeria running on BOLXolve Invoice. Onboarding takes less than 24 hours.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <a href={getWhatsAppLink()} target="_blank" rel="noopener noreferrer">
              <Button className="w-full sm:w-auto h-12 px-8 text-xs font-bold bg-emerald-500 hover:bg-emerald-400 text-slate-950 rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center space-x-2">
                <MessageCircle className="h-4 w-4" />
                <span>Chat with an Onboarding Specialist</span>
              </Button>
            </a>
            <Link href="/login">
              <Button variant="outline" className="w-full sm:w-auto h-12 px-7 text-xs font-semibold border-slate-700 bg-slate-950/60 text-slate-200 rounded-2xl">
                <span>Existing User? Sign In</span>
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ========================================================= */}
      {/* FOOTER                                                    */}
      {/* ========================================================= */}
      <footer className="border-t border-slate-800/80 bg-[#06080F] py-12 relative z-10 text-xs text-slate-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center space-x-3">
            <div className="h-8 w-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center">
              <Receipt className="h-4 w-4 text-slate-950 stroke-[2.5]" />
            </div>
            <div>
              <p className="font-bold text-white">BOLXolve Invoice</p>
              <p className="text-[10px] text-slate-500">Official Production Service: invoice.bolxolve.com</p>
            </div>
          </div>

          <div className="flex items-center space-x-6 text-xs text-slate-400">
            <a href="#features" className="hover:text-emerald-400">Features</a>
            <a href="#pricing" className="hover:text-emerald-400">Pricing</a>
            <a href="#calculator" className="hover:text-emerald-400">Calculator</a>
            <Link href="/login" className="hover:text-emerald-400">Terminal Login</Link>
          </div>

          <p className="text-[11px] text-slate-500">
            © {new Date().getFullYear()} BOLXolve Ecosystem. All rights reserved.
          </p>
        </div>
      </footer>

    </div>
  );
}
