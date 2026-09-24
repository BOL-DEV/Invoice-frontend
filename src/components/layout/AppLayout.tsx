'use client';

import { useIdleTimeout } from '../../features/auth/hooks/useIdleTimeout';
import { SessionTimeoutModal } from '../shared/SessionTimeoutModal';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../../features/auth/context/AuthContext';
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
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Skeleton } from '../ui/skeleton';
import { useTheme } from 'next-themes';

interface SidebarItemProps {
  href: string;
  icon: React.ReactNode;
  label: string;
  active: boolean;
  isCollapsed?: boolean;
  onClick?: () => void;
}

const SidebarItem: React.FC<SidebarItemProps> = ({ href, icon, label, active, isCollapsed, onClick }) => {
  return (
    <Link href={href} onClick={onClick} title={isCollapsed ? label : undefined}>
      <motion.span
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        className={`flex items-center ${
          isCollapsed ? 'justify-center px-2 py-3' : 'space-x-3 px-4 py-3'
        } rounded-xl text-sm font-medium group relative transition-colors ${
          active
            ? 'bg-primary text-white shadow-sm font-semibold'
            : 'text-muted-foreground hover:text-foreground hover:bg-secondary'
        }`}
      >
        <span className={`shrink-0 transition-transform duration-150 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        {!isCollapsed && <span className="font-medium whitespace-nowrap truncate">{label}</span>}
      </motion.span>
    </Link>
  );
};

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const { user, logout, isLoading } = useAuth();
  const { isWarningOpen, secondsRemaining, stayLoggedIn, logOutNow } = useIdleTimeout();
  const { theme, setTheme } = useTheme();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    try {
      const saved = localStorage.getItem('sidebar_collapsed');
      if (saved === 'true') {
        setIsCollapsed(true);
      }
    } catch {
      // localStorage may be disabled
    }
  }, []);

  const toggleSidebar = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('sidebar_collapsed', String(next));
      } catch {}
      return next;
    });
  };

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  const router = useRouter();

  // If auth has finished loading and there is NO user, redirect to login
  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    }
  }, [isLoading, user, router]);

  // Strictly role-based navigation: NEVER default to Apprentice links if user is null or unauthenticated
  const navItems = user
    ? [
        { href: '/', icon: <LayoutDashboard className="h-5 w-5" />, label: 'Dashboard' },
        { href: '/invoices', icon: <FileText className="h-5 w-5" />, label: 'Invoices' },
        { href: '/approvals', icon: <CheckSquare className="h-5 w-5" />, label: 'Approvals' },
        ...(user.role === 'ADMIN'
          ? [
              { href: '/users', icon: <Users className="h-5 w-5" />, label: 'Cashiers' },
              { href: '/activity', icon: <Activity className="h-5 w-5" />, label: 'Activity Logs' },
            ]
          : []),
        { href: '/settings', icon: <SettingsIcon className="h-5 w-5" />, label: 'Settings' },
      ]
    : [];

  const handleLinkClick = () => {
    setIsMobileOpen(false);
  };

  const renderNavList = (onItemClick?: () => void, collapsed = false) => {
    if (isLoading && !user) {
      return (
        <div className="space-y-2 py-1">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className={`flex items-center ${collapsed ? 'justify-center' : 'space-x-3 px-4'} py-3 rounded-xl bg-secondary/50`}
            >
              <Skeleton className="h-5 w-5 rounded-lg shrink-0" />
              {!collapsed && <Skeleton className="h-4 w-28 rounded" />}
            </div>
          ))}
        </div>
      );
    }

    return (
      <div className="space-y-1.5">
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            icon={item.icon}
            label={item.label}
            active={pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href))}
            isCollapsed={collapsed}
            onClick={onItemClick}
          />
        ))}
      </div>
    );
  };

  const renderUserCard = () => {
    if (isLoading && !user) {
      return (
        <div className="px-4 py-3 bg-secondary/50 border border-border rounded-xl space-y-2">
          <Skeleton className="h-4 w-24 rounded" />
          <Skeleton className="h-3 w-36 rounded" />
        </div>
      );
    }

    if (user) {
      return (
        <div className="px-4 py-3 bg-secondary/50 border border-border rounded-xl">
          <p className="text-sm font-semibold truncate text-foreground">
            {user.firstName} {user.lastName}
          </p>
          <p className="text-xs text-muted-foreground truncate mt-0.5">{user.email}</p>
        </div>
      );
    }

    return null;
  };

  // When auth is resolving or user is unauthenticated/logging out, render clean loading screen
  // This prevents child routes from rendering in an unauthorized state
  if (isLoading || !user) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-background text-foreground space-y-4">
        <div className="h-12 w-12 rounded-2xl bg-white dark:bg-slate-900 border border-border p-1.5 flex items-center justify-center shadow-lg animate-pulse">
          <Image src="/logo.svg" alt="Lao Steel Ventures" width={40} height={40} className="w-9 h-9 object-contain" priority />
        </div>
        <div className="flex items-center space-x-2 text-xs text-muted-foreground font-mono">
          <Loader2 className="h-4 w-4 animate-spin text-emerald-500" />
          <span>Authenticating session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-screen overflow-hidden bg-background text-foreground flex">
      {/* Desktop Sidebar */}
      <aside
        className={`hidden md:flex ${
          isCollapsed ? 'w-20' : 'w-64'
        } h-screen sticky top-0 bg-card border-r border-border flex-col shrink-0 text-foreground z-30 select-none transition-all duration-300 ease-in-out`}
      >
        <div
          className={`p-4 flex items-center ${
            isCollapsed ? 'justify-center' : 'justify-between'
          } border-b border-border h-16 shrink-0`}
        >
          <div className="flex items-center space-x-3 overflow-hidden">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-border p-1 flex items-center justify-center shadow-sm shrink-0">
              <Image src="/logo.svg" alt="Lao Steel Ventures" width={36} height={36} className="w-8 h-8 object-contain" priority />
            </div>
            {!isCollapsed && (
              <div className="min-w-0">
                <h1 className="font-bold text-sm tracking-wide uppercase leading-tight text-foreground font-heading truncate">
                  Lao Steel
                </h1>
                <p className="text-xs text-muted-foreground truncate">Ventures</p>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="h-8 w-8 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary shrink-0"
              title="Collapse sidebar"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
        </div>

        <nav className="flex-1 px-3 py-6 overflow-y-auto space-y-1">
          {renderNavList(undefined, isCollapsed)}
        </nav>

        <div className="p-3 border-t border-border space-y-2">
          {isCollapsed ? (
            <div className="flex flex-col items-center space-y-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleSidebar}
                className="h-9 w-9 rounded-xl text-muted-foreground hover:text-foreground hover:bg-secondary"
                title="Expand sidebar"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                className="h-9 w-9 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-500/10"
                title="Logout"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          ) : (
            <>
              {renderUserCard()}
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start space-x-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-medium py-2.5 h-auto rounded-xl"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </>
          )}
        </div>
      </aside>

      {/* Mobile Drawer Navigation */}
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
              className="relative flex flex-col w-full max-w-xs bg-card border-r border-border p-6 shadow-2xl text-foreground"
            >
              <div className="flex items-center justify-between pb-6 border-b border-border">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-border p-1 flex items-center justify-center shadow-sm shrink-0">
                    <Image src="/logo.svg" alt="Lao Steel Ventures" width={36} height={36} className="w-8 h-8 object-contain" />
                  </div>
                  <div>
                    <h1 className="font-bold text-sm tracking-wide uppercase leading-tight text-foreground">
                      Lao Steel
                    </h1>
                    <p className="text-xs text-muted-foreground">Ventures</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setIsMobileOpen(false)}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="h-6 w-6" />
                </Button>
              </div>

              <nav className="flex-1 py-6 overflow-y-auto">
                {renderNavList(handleLinkClick)}
              </nav>

              <div className="border-t border-border pt-4 space-y-3">
                {renderUserCard()}

                <Button
                  variant="ghost"
                  onClick={logout}
                  className="w-full justify-start space-x-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-medium py-3 h-auto rounded-xl"
                >
                  <LogOut className="h-5 w-5" />
                  <span>Logout</span>
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Session Inactivity Timeout Modal */}
            <SessionTimeoutModal
        isOpen={isWarningOpen}
        secondsRemaining={secondsRemaining}
        onStayLoggedIn={stayLoggedIn}
        onLogOutNow={logOutNow}
      />

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-y-auto overflow-x-hidden">
        {/* Header toolbar */}
        <header className="h-16 border-b border-border bg-card/90 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-4 sm:px-6 shadow-sm shrink-0">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-foreground h-9 w-9"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </Button>

            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex text-muted-foreground hover:text-foreground hover:bg-secondary rounded-lg h-9 w-9 shrink-0"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-4 w-4" />
              ) : (
                <PanelLeftClose className="h-4 w-4" />
              )}
            </Button>

            <span className="font-heading font-bold text-base sm:text-lg md:text-xl tracking-tight capitalize select-none text-foreground truncate">
              {pathname === '/'
                ? 'Analytics Dashboard'
                : pathname.split('/')[1] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle switch */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full hover:bg-secondary"
              title="Toggle theme"
            >
              {mounted && (
                <>
                  <Sun className="h-5 w-5 rotate-0 scale-100 transition-transform dark:-rotate-90 dark:scale-0 text-amber-500" />
                  <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-transform dark:rotate-0 dark:scale-100 text-blue-400" />
                </>
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user && (
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setIsUserMenuOpen((prev) => !prev)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-full bg-secondary hover:bg-secondary/80 border border-border text-xs shadow-sm transition-colors cursor-pointer select-none focus:outline-none"
                >
                  <div className="h-6 w-6 rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-[10px] uppercase font-mono">
                    {user.firstName?.[0] || 'U'}{user.lastName?.[0] || ''}
                  </div>
                  <span className="hidden sm:inline font-semibold text-foreground text-xs">
                    {user.firstName} {user.lastName}
                  </span>
                  <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />
                </button>

                {isUserMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setIsUserMenuOpen(false)}
                    />
                    <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-border shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2 duration-150">
                      <div className="p-2.5 border-b border-border/80">
                        <p className="text-xs font-bold text-foreground truncate">{user.firstName} {user.lastName}</p>
                        <p className="text-[11px] text-muted-foreground font-mono truncate">{user.email}</p>
                        <div className="mt-1.5">
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold font-mono tracking-wider bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                            {user.role === 'ADMIN' ? 'ADMINISTRATOR' : 'CASHIER'}
                          </span>
                        </div>
                      </div>

                      <div className="py-1">
                        <button
                          type="button"
                          onClick={() => {
                            setIsUserMenuOpen(false);
                            logout();
                          }}
                          className="w-full flex items-center space-x-2.5 px-2.5 py-2 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4" />
                          <span>Log Out</span>
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-3.5 sm:p-6 md:p-8 pb-32 sm:pb-12 md:pb-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
