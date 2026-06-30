'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../features/auth/context/AuthContext';
import { usePermission } from '../../features/auth/hooks/usePermission';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  FileText,
  CheckSquare,
  Users,
  Settings as SettingsIcon,
  Activity,
  LogOut,
  Menu,
  X,
  Sun,
  Moon,
  Building2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { useTheme } from 'next-themes';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, active, onClick }) => {
  return (
    <Link href={href} onClick={onClick}>
      <motion.span
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center space-x-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 group relative ${
          active
            ? 'bg-primary text-white shadow-premium'
            : 'text-slate-400 hover:bg-slate-800/60 hover:text-white'
        }`}
      >
        <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span className="font-medium">{label}</span>
      </motion.span>
    </Link>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const { isAdmin } = usePermission();
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const navItems = [
    ...(isAdmin
      ? [{ href: '/', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' }]
      : []),
    { href: '/invoices', icon: <FileText className="h-5 w-5" />, label: 'Invoices' },
    { href: '/approvals', icon: <CheckSquare className="h-5 w-5" />, label: 'Approvals' },
    ...(isAdmin
      ? [
          { href: '/users', icon: <Users className="h-5 w-5" />, label: 'Cashiers' },
          { href: '/settings', icon: <SettingsIcon className="h-5 w-5" />, label: 'Settings' },
          { href: '/activity', icon: <Activity className="h-5 w-5" />, label: 'Activity Logs' },
        ]
      : []),
  ];

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      {/* Desktop Sidebar (Lock to premium Dark theme Slate-900) */}
      <aside className="hidden md:flex md:w-64 bg-[#0F172A] border-r border-slate-800 flex-col shrink-0 text-slate-300">
        <div className="p-6 flex items-center space-x-3 border-b border-slate-800">
          <div className="bg-primary text-white p-2 rounded-xl">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide uppercase leading-tight text-white font-heading">Lagos Iron</h1>
            <p className="text-xs text-slate-400">& Steel Co. Ltd</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => (
            <SidebarItem
              key={item.href}
              href={item.href}
              icon={item.icon}
              label={item.label}
              active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
            />
          ))}
        </nav>

        <div className="p-4 border-t border-slate-800 space-y-3">
          {user && (
            <div className="px-4 py-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
              <p className="text-sm font-semibold truncate text-white">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-[10px] text-primary font-mono tracking-wider uppercase font-bold mt-0.5">
                {user.role} MODE
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start space-x-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-medium py-6 rounded-xl"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation (Side-in overlay menu) */}
      <AnimatePresence>
        {isMobileOpen && (
          <div className="fixed inset-0 z-50 flex md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-background/80 backdrop-blur-sm"
              onClick={() => setIsMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative flex flex-col w-full max-w-xs bg-[#0F172A] border-r border-slate-800 p-6 shadow-xl text-slate-300"
            >
              <div className="flex items-center justify-between pb-6 border-b border-slate-800">
                <div className="flex items-center space-x-3">
                  <div className="bg-primary text-white p-2 rounded-xl">
                    <Building2 className="h-6 w-6" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm tracking-wide uppercase leading-tight text-white">Lagos Iron</h1>
                    <p className="text-xs text-slate-400">& Steel Co. Ltd</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)} className="text-slate-400 hover:text-white">
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <nav className="flex-1 py-6 space-y-1.5 overflow-y-auto">
                {navItems.map((item) => (
                  <SidebarItem
                    key={item.href}
                    href={item.href}
                    icon={item.icon}
                    label={item.label}
                    active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
                    onClick={handleLinkClick}
                  />
                ))}
              </nav>

              <div className="border-t border-slate-800 pt-4 space-y-3">
                {user && (
                  <div className="px-4 py-3 bg-slate-800/40 border border-slate-800/60 rounded-xl">
                    <p className="text-sm font-semibold truncate text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-[10px] text-primary font-mono tracking-wider uppercase font-bold mt-0.5">
                      {user.role} MODE
                    </p>
                  </div>
                )}
                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start space-x-3 text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 font-medium py-6 rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header toolbar */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6 shadow-sm">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-heading font-bold text-lg md:text-xl tracking-tight capitalize select-none text-[#0F172A] dark:text-[#F8FAFC]">
              {pathname === '/'
                ? 'Analytics Dashboard'
                : pathname.split('/')[1] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle switch */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full hover:bg-secondary">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0 text-amber-500" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100 text-blue-400" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user && (
              <div className="hidden sm:flex items-center space-x-2 bg-[#D1FAE5] dark:bg-[#10B981]/25 px-3 py-1.5 rounded-full border border-[#10B981]/20">
                <div className="h-2 w-2 rounded-full bg-[#10B981] animate-pulse" />
                <span className="text-[10px] font-bold tracking-wider uppercase font-mono text-[#059669] dark:text-[#10B981]">
                  {user.role} MODE
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content body with Framer Motion Page Animations */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={pathname}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -15 }}
              transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="h-full w-full"
            >
              {children}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};
