'use client';

import React from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { Loader2 } from 'lucide-react';
import { SuperAdminDashboard } from '../../../features/admin/components/SuperAdminDashboard';
import {
  MainAdminDashboard,
  SubAdminDashboard,
  CashierDashboard,
} from '../../../features/dashboard/components';

export default function DashboardPage() {
  const { user, isLoading: authLoading } = useAuth();

  if (authLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Loading Workspace Dashboard...</p>
        </div>
      </div>
    );
  }

  // 1. Super Admin Platform Command Center
  if (user.role === 'SUPER_ADMIN') {
    return <SuperAdminDashboard user={user} />;
  }

  // 2. Sub-Admin (Branch Head Manager)
  if (user.role === 'ADMIN' && user.branchId) {
    return <SubAdminDashboard user={user} branchId={user.branchId} />;
  }

  // 3. Main Admin (Executive / Headquarters)
  if (user.role === 'ADMIN') {
    return <MainAdminDashboard user={user} />;
  }

  // 4. Cashier (Point-of-Sale Terminal Operator)
  return <CashierDashboard user={user} branchId={user.branchId || undefined} />;
}
