'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '../../features/auth/context/AuthContext';
import { usePermission } from '../../features/auth/hooks/usePermission';
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
      <span
        className={`flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all duration-200 group ${
          active
            ? 'bg-primary text-primary-foreground shadow-md'
            : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
        }`}
      >
        <span className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-110'}`}>
          {icon}
        </span>
        <span>{label}</span>
      </span>
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
      {/* Desktop Sidebar (Sidebar stays fixed on larger screens) */}
      <aside className="hidden md:flex md:w-64 bg-card border-r border-border flex-col shrink-0">
        <div className="p-6 flex items-center space-x-3 border-b border-border">
          <div className="bg-primary text-primary-foreground p-2 rounded-lg">
            <Building2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="font-bold text-sm tracking-wide uppercase leading-tight">Lagos Iron</h1>
            <p className="text-xs text-muted-foreground">& Steel Co. Ltd</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
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

        <div className="p-4 border-t border-border space-y-2">
          {user && (
            <div className="px-4 py-3 bg-secondary/50 rounded-lg">
              <p className="text-sm font-semibold truncate">
                {user.firstName} {user.lastName}
              </p>
              <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                {user.role}
              </p>
            </div>
          )}

          <Button
            variant="ghost"
            onClick={logout}
            className="w-full justify-start space-x-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-medium py-6"
          >
            <LogOut className="h-5 w-5" />
            <span>Logout</span>
          </Button>
        </div>
      </aside>

      {/* Mobile Drawer Navigation (Side-in overlay menu) */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div className="fixed inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setIsMobileOpen(false)} />
          <aside className="relative flex flex-col w-full max-w-xs bg-card border-r border-border p-6 shadow-xl animate-in slide-in-from-left duration-250">
            <div className="flex items-center justify-between pb-6 border-b border-border">
              <div className="flex items-center space-x-3">
                <div className="bg-primary text-primary-foreground p-2 rounded-lg">
                  <Building2 className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="font-bold text-sm tracking-wide uppercase leading-tight">Lagos Iron</h1>
                  <p className="text-xs text-muted-foreground">& Steel Co. Ltd</p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsMobileOpen(false)}>
                <X className="h-6 w-6" />
              </Button>
            </div>

            <nav className="flex-1 py-6 space-y-2 overflow-y-auto">
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

            <div className="border-t border-border pt-4 space-y-2">
              {user && (
                <div className="px-4 py-3 bg-secondary/50 rounded-lg">
                  <p className="text-sm font-semibold truncate">
                    {user.firstName} {user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground uppercase font-mono tracking-wider">
                    {user.role}
                  </p>
                </div>
              )}
              <Button
                variant="ghost"
                onClick={logout}
                className="w-full justify-start space-x-3 text-rose-500 hover:text-rose-600 hover:bg-rose-500/10 font-medium py-6"
              >
                <LogOut className="h-5 w-5" />
                <span>Logout</span>
              </Button>
            </div>
          </aside>
        </div>
      )}

      {/* Main Panel Content Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-hidden">
        {/* Header toolbar */}
        <header className="h-16 border-b border-border bg-card/60 backdrop-blur-md sticky top-0 z-40 flex items-center justify-between px-6">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-6 w-6" />
            </Button>
            <span className="font-bold text-lg md:text-xl tracking-tight capitalize select-none">
              {pathname === '/'
                ? 'Analytics Dashboard'
                : pathname.split('/')[1] || 'Dashboard'}
            </span>
          </div>

          <div className="flex items-center space-x-4">
            {/* Theme toggle switch */}
            <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full">
              <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>

            {user && (
              <div className="hidden sm:flex items-center space-x-3 bg-secondary px-3 py-1.5 rounded-full border border-border">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-xs font-semibold tracking-wide uppercase font-mono">
                  {user.role} Mode
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Content body */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};
