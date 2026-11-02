'use client';

import React from 'react';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { Loader2 } from 'lucide-react';
import {
  MainAdminReports,
  SubAdminReports,
  CashierReports,
  SuperAdminReports,
} from '../../../features/reports/components';

export default function ReportsPage() {
  const { user, isLoading } = useAuth();

  if (isLoading || !user) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center justify-center space-y-3">
          <div className="h-10 w-10 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500">
            <Loader2 className="h-5 w-5 animate-spin" />
          </div>
          <p className="text-xs text-muted-foreground font-medium">Loading Financial Reports...</p>
        </div>
      </div>
    );
  }

  // 1. Super Admin Platform Oversight
  if (user.role === 'SUPER_ADMIN') {
    return <SuperAdminReports user={user} />;
  }

  // 2. Sub-Admin (Branch Head Manager)
  if (user.role === 'ADMIN' && user.branchId) {
    return <SubAdminReports user={user} branchId={user.branchId} />;
  }

  // 3. Main Admin (Executive / HQ)
  if (user.role === 'ADMIN') {
    return <MainAdminReports user={user} />;
  }

  // 4. Cashier (POS Terminal Operator)
  return <CashierReports user={user} />;
}
