'use client';

import React, { useState, useMemo } from 'react';
import {
  useUsersList,
  useCreateUser,
  useToggleSuspendUser,
  useAdminUpdateUser,
} from '../../../features/users/hooks/useUsers';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { useBusinessSettings } from '../../../features/business/hooks/useBusinessSettings';
import { useSubscription } from '../../../features/subscriptions/hooks/useSubscription';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  createUserSchema,
  CreateUserInput,
  createBranchWithHeadSchema,
  CreateBranchWithHeadFormInput,
} from '../../../features/users/schemas';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import {
  Plus,
  ShieldAlert,
  UserCheck,
  UserX,
  Loader2,
  Mail,
  Lock as LockIcon,
  Eye,
  EyeOff,
  AlertCircle,
  Store,
  Shield,
  User as UserIcon,
  Crown,
  Search,
  Building2,
  Sparkles,
  MapPin,
  ArrowRight,
  Filter,
  Users,
} from 'lucide-react';
import { useBranches, useCreateBranchWithHead } from '../../../features/branches';
import { getErrorMessage, getErrorDialog } from '../../../lib/api-error';
import { Skeleton } from '../../../components/ui/skeleton';
import { useModal } from '../../../components/ui/modal-provider';
import { cn } from '../../../lib/utils';
import { User, Branch } from '../../../types/api';

export default function UsersPage() {
  const { user, isAdmin, isMainAdmin, isSubAdmin, userBranchId, isLoading: isAuthLoading } = usePermission();
  const modal = useModal();

  // Queries & Mutations
  const { data: users = [], isLoading: isUsersLoading, isError: isUsersError } = useUsersList();
  const { data: businessSettings } = useBusinessSettings();
  const { data: branches = [], isLoading: isBranchesLoading } = useBranches();
  const { data: subDetails } = useSubscription();

  const createCashierMutation = useCreateUser();
  const createBranchWithHeadMutation = useCreateBranchWithHead();
  const toggleSuspendMutation = useToggleSuspendUser();
  const adminUpdateMutation = useAdminUpdateUser();

  // Modal states
  const [isBranchWithHeadOpen, setIsBranchWithHeadOpen] = useState(false);
  const [isCashierOpen, setIsCashierOpen] = useState(false);
  const [isReassignOpen, setIsReassignOpen] = useState(false);
  const [selectedUserToReassign, setSelectedUserToReassign] = useState<User | null>(null);
  const [reassignBranchId, setReassignBranchId] = useState<string>('');

  // Password visibility
  const [showManagerPassword, setShowManagerPassword] = useState(false);
  const [showCashierPassword, setShowCashierPassword] = useState(false);

  // Filter & Search states
  const [selectedBranchFilter, setSelectedBranchFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [formErrorMsg, setFormErrorMsg] = useState<string | null>(null);

  const subscription = businessSettings?.subscription ?? subDetails?.subscription;
  const isEnterprise = subscription?.plan === 'ENTERPRISE';
  const hasMultiBranch = Boolean(
    subDetails?.capabilities?.multipleBranches ??
    subDetails?.subscription?.hasMultipleBranches ??
    businessSettings?.subscription?.hasMultipleBranches ??
    false
  );

  // Unified Staff Quota:
  // Apart from the main business admin (ADMIN without branchId), all other users (branch head managers & cashiers)
  // are staff members counting against the tenant's maxStaffCount quota.
  const maxStaffQuota = subscription?.maxStaffCount ?? subDetails?.usage?.maxStaffCount ?? (isEnterprise ? 10 : 2);

  const subAdmins = useMemo(
    () => users.filter((u) => u.role === 'ADMIN' && Boolean(u.branchId) && !u.isDeleted),
    [users]
  );
  const cashiers = useMemo(
    () => users.filter((u) => u.role === 'APPRENTICE' && !u.isDeleted),
    [users]
  );

  const activeSubAdminCount = subAdmins.length;
  const activeCashierCount = cashiers.length;
  const totalStaffCount = activeSubAdminCount + activeCashierCount;
  const isStaffQuotaReached = totalStaffCount >= maxStaffQuota;


  // Filtered staff list based on role and active filters
  const displayedUsers = useMemo(() => {
    let list = isSubAdmin
      ? users.filter((u) => u.role === 'APPRENTICE' && u.branchId === userBranchId)
      : users.filter((u) => !u.isDeleted);

    if (selectedBranchFilter !== 'ALL') {
      list = list.filter((u) => u.branchId === selectedBranchFilter);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (u) =>
          u.firstName.toLowerCase().includes(q) ||
          u.lastName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q)
      );
    }

    return list;
  }, [users, isSubAdmin, userBranchId, selectedBranchFilter, searchQuery]);

  // Form for Creating Branch & Head Manager
  const branchForm = useForm<CreateBranchWithHeadFormInput>({
    resolver: zodResolver(createBranchWithHeadSchema),
    defaultValues: {
      branchName: '',
      branchAddress: '',
      managerFirstName: '',
      managerLastName: '',
      managerEmail: '',
      managerPassword: '',
    },
  });

  // Form for Creating Cashier (branchId is strictly mandatory)
  const cashierForm = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'APPRENTICE',
      firstName: '',
      lastName: '',
      branchId: isSubAdmin && userBranchId ? userBranchId : '',
    },
  });

  if (isAuthLoading) {
    return (
      <div className="flex items-center justify-center p-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold font-heading">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Branch & staff management is strictly restricted to authorized business administrators.
        </p>
      </div>
    );
  }

  // Open "Create Branch & Head Manager"
  const handleOpenBranchWithHead = () => {
    if (isStaffQuotaReached) {
      modal.alert(
        'Staff Quota Limit',
        `Your organization has reached the maximum quota of ${maxStaffQuota} staff members (${totalStaffCount}/${maxStaffQuota} allocated across branch managers and cashiers). Upgrade your subscription or manage existing staff before creating a new branch with head.`,
        'warning'
      );
      return;
    }
    setFormErrorMsg(null);
    setShowManagerPassword(false);
    branchForm.reset();
    setIsBranchWithHeadOpen(true);
  };

  // Open "Add Cashier"
  const handleOpenAddCashier = (preselectedBranchId?: string) => {
    if (isStaffQuotaReached) {
      modal.alert(
        'Staff Quota Limit',
        `Your organization has reached the limit of ${maxStaffQuota} staff members (${totalStaffCount}/${maxStaffQuota} allocated across branch managers and cashiers). Upgrade your subscription or deactivate unused accounts to add more cashiers.`,
        'warning'
      );
      return;
    }

    if (hasMultiBranch && branches.length === 0 && !isSubAdmin) {
      modal.alert(
        'No Branches Available',
        'A cashier can only be created under a branch. Please create a branch and its head manager first before adding cashiers.',
        'warning'
      );
      return;
    }

    setFormErrorMsg(null);
    setShowCashierPassword(false);
    cashierForm.reset({
      email: '',
      password: '',
      role: 'APPRENTICE',
      firstName: '',
      lastName: '',
      branchId: hasMultiBranch ? (isSubAdmin ? (userBranchId || '') : (preselectedBranchId || (branches[0]?.id ?? ''))) : '',
    });
    setIsCashierOpen(true);
  };

  // Submit "Create Branch & Head Manager"
  const onSubmitBranchWithHead = async (data: CreateBranchWithHeadFormInput) => {
    setFormErrorMsg(null);

    try {
      await createBranchWithHeadMutation.mutateAsync({
        branch: {
          name: data.branchName,
          address: data.branchAddress,
        },
        headManager: {
          firstName: data.managerFirstName,
          lastName: data.managerLastName,
          email: data.managerEmail,
          password: data.managerPassword,
        },
      });

      setIsBranchWithHeadOpen(false);
      branchForm.reset();
      modal.alert(
        'Branch & Head Manager Created',
        `Branch "${data.branchName}" and Head Manager ${data.managerFirstName} ${data.managerLastName} registered successfully.`,
        'success'
      );
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to create branch and head manager');
      setFormErrorMsg(msg);
    }
  };

  // Submit "Create Cashier"
  const onSubmitCashier = async (data: CreateUserInput) => {
    setFormErrorMsg(null);

    const effectiveBranchId = isSubAdmin ? userBranchId : data.branchId;

    if (hasMultiBranch && !effectiveBranchId) {
      setFormErrorMsg('A cashier can only be registered under a specific branch. Please select a branch.');
      return;
    }

    try {
      await createCashierMutation.mutateAsync({
        ...data,
        branchId: hasMultiBranch ? (effectiveBranchId || '') : '',
        role: 'APPRENTICE',
      });

      setIsCashierOpen(false);
      cashierForm.reset();
      modal.alert(
        'Cashier Registered',
        hasMultiBranch
          ? `Cashier ${data.firstName} ${data.lastName} registered successfully under the assigned branch.`
          : `Cashier ${data.firstName} ${data.lastName} registered successfully.`,
        'success'
      );
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to register cashier');
      setFormErrorMsg(msg);
    }
  };

  // Open Reassign Modal
  const handleOpenReassign = (targetUser: User) => {
    setSelectedUserToReassign(targetUser);
    setReassignBranchId(targetUser.branchId || (branches[0]?.id ?? ''));
    setIsReassignOpen(true);
  };

  // Submit Reassign Branch
  const onSubmitReassign = async () => {
    if (!selectedUserToReassign || !reassignBranchId) return;
    try {
      await adminUpdateMutation.mutateAsync({
        id: selectedUserToReassign.id,
        payload: {
          branchId: reassignBranchId,
        },
      });
      setIsReassignOpen(false);
      const bName = branches.find((b) => b.id === reassignBranchId)?.name || 'the selected branch';
      modal.alert(
        'Branch Assigned',
        `Staff member ${selectedUserToReassign.firstName} ${selectedUserToReassign.lastName} is now assigned to ${bName}.`,
        'success'
      );
    } catch (err) {
      const msg = getErrorMessage(err, 'Failed to reassign branch');
      modal.alert('Error', msg, 'error');
    }
  };

  // Suspend / Reactivate handler
  const handleToggleSuspend = async (targetUser: User) => {
    if (targetUser.id === user?.id) {
      modal.alert('Action Prohibited', 'You cannot suspend your own administrative account.', 'warning');
      return;
    }

    if (isSubAdmin && targetUser.role === 'ADMIN') {
      modal.alert('Permission Denied', 'Sub-admins cannot modify administrative accounts.', 'error');
      return;
    }

    const isSuspended = !!targetUser.isSuspended;
    const actionName = isSuspended ? 'Reactivate' : 'Suspend';
    const roleLabel = targetUser.role === 'ADMIN' ? 'Sub-Admin' : 'Cashier';

    const isConfirmed = await modal.confirm(
      `${actionName} ${roleLabel} Account`,
      isSuspended
        ? `Are you sure you want to reactivate access for ${targetUser.firstName} ${targetUser.lastName}? They will immediately be permitted to sign in.`
        : `Are you sure you want to suspend access for ${targetUser.firstName} ${targetUser.lastName}? Their active sessions will be terminated and they will be blocked from logging in.`
    );

    if (isConfirmed) {
      try {
        await toggleSuspendMutation.mutateAsync(targetUser.id);
        modal.alert(
          'Status Updated',
          `${roleLabel} ${targetUser.firstName} ${targetUser.lastName} has been ${isSuspended ? 'reactivated' : 'suspended'} successfully.`,
          'success'
        );
      } catch (err) {
        const { title, message, variant } = getErrorDialog(err, 'Operation Failed', `Failed to ${actionName.toLowerCase()} account`);
        modal.alert(title, message, variant);
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">
            {isMainAdmin && hasMultiBranch
              ? 'Branches & Staff Management'
              : isSubAdmin
              ? 'Branch Cashiers & Staff'
              : 'Cashier & Staff Management'}
          </h2>
          <p className="text-xs text-muted-foreground mt-1">
            {isMainAdmin && hasMultiBranch
              ? 'Create physical branches, appoint head managers (sub-admins), and provision branch cashiers.'
              : isSubAdmin
              ? 'Manage cashiers registered under your assigned branch location.'
              : 'Register and manage authorized system cashiers for point-of-sale invoicing.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {isSubAdmin ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs shadow-sm">
              <span className="text-muted-foreground">
                Cashiers:{' '}
                <strong className="text-foreground font-semibold">
                  {displayedUsers.length}
                </strong>
              </span>
            </div>
          ) : subscription ? (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-border bg-card text-xs shadow-sm">
              <span className="font-semibold text-foreground">
                Plan: <span className="uppercase text-emerald-600 dark:text-emerald-400 font-bold">{subscription.plan}</span>
              </span>
              <span className="text-muted-foreground">•</span>
              <span className="text-muted-foreground">
                Staff Quota:{' '}
                <strong className={isStaffQuotaReached ? 'text-rose-500 font-bold' : 'text-foreground font-semibold'}>
                  {totalStaffCount} / {maxStaffQuota}
                </strong>
                {hasMultiBranch && (
                  <span className="text-[11px] ml-1 text-muted-foreground">
                    ({activeSubAdminCount} managers, {activeCashierCount} cashiers)
                  </span>
                )}
              </span>
            </div>
          ) : null}

          {/* Action Buttons */}
          {isMainAdmin && hasMultiBranch ? (
            <div className="flex items-center gap-2">
              <Button
                onClick={handleOpenBranchWithHead}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-premium h-10 text-xs font-semibold px-4 flex items-center space-x-2 shrink-0 cursor-pointer transition-all"
              >
                <Store className="h-4 w-4" />
                <span>+ Create Branch & Head Manager</span>
              </Button>

              <Button
                onClick={() => handleOpenAddCashier()}
                variant="outline"
                className="rounded-xl h-10 text-xs font-semibold px-4 flex items-center space-x-1.5 shrink-0 cursor-pointer border-border hover:bg-secondary"
              >
                <Plus className="h-4 w-4 text-emerald-500" />
                <span>Add Cashier</span>
              </Button>
            </div>
          ) : (
            <Button
              onClick={() => handleOpenAddCashier()}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-premium h-10 text-xs font-semibold px-4 flex items-center space-x-2 shrink-0 cursor-pointer transition-all"
            >
              <Plus className="h-4 w-4" />
              <span>Add Cashier</span>
            </Button>
          )}
        </div>
      </div>

      {/* Quotas & Capacity Overview Cards */}
      {hasMultiBranch && isSubAdmin ? (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Branch Cashiers</p>
                <p className="text-[11px] text-muted-foreground">Assigned strictly under this branch</p>
              </div>
            </div>
            <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono text-xs font-bold">
              {displayedUsers.length}
            </Badge>
          </div>
        </div>
      ) : hasMultiBranch ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Registered Branches</p>
                <p className="text-[11px] text-muted-foreground">Depots & physical outlets</p>
              </div>
            </div>
            <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-xs font-bold">
              {branches.length} Branches
            </Badge>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500">
                <Shield className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Branch Head Managers</p>
                <p className="text-[11px] text-muted-foreground">Sub-admins assigned to branches</p>
              </div>
            </div>
            <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 font-mono text-xs font-bold">
              {activeSubAdminCount} Managers
            </Badge>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <UserIcon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Point-of-Sale Cashiers</p>
                <p className="text-[11px] text-muted-foreground">Assigned strictly under branches</p>
              </div>
            </div>
            <Badge className="bg-sky-500/10 text-sky-600 dark:text-sky-400 border border-sky-500/20 font-mono text-xs font-bold">
              {activeCashierCount} Cashiers
            </Badge>
          </div>

          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Total Staff Allocation</p>
                <p className="text-[11px] text-muted-foreground">Managers & cashiers combined</p>
              </div>
            </div>
            <Badge
              className={cn(
                'font-mono text-xs font-bold border',
                isStaffQuotaReached
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : totalStaffCount >= maxStaffQuota * 0.8
                  ? 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/30'
                  : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30'
              )}
            >
              {totalStaffCount} / {maxStaffQuota}
            </Badge>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-sky-500/10 text-sky-500">
                <Users className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-foreground">Staff & Cashiers</p>
                <p className="text-[11px] text-muted-foreground">Authorized staff operators</p>
              </div>
            </div>
            <Badge
              className={cn(
                'font-mono text-xs font-bold border',
                isStaffQuotaReached
                  ? 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/30'
                  : 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20'
              )}
            >
              {totalStaffCount} / {maxStaffQuota}
            </Badge>
          </div>
        </div>
      )}


      {/* ======================================================== */}
      {/* BRANCHES NETWORK OVERVIEW (Main Admin on Multi-Branch)   */}
      {/* ======================================================== */}
      {isMainAdmin && hasMultiBranch && (
        <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
          <div className="p-4 sm:p-5 border-b border-border bg-secondary/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-500">
                <Store className="h-4 w-4" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground font-heading">
                  Branch Depots & Head Managers
                </h3>
                <p className="text-xs text-muted-foreground">
                  Each branch operates with a dedicated Head Manager (Sub-Admin) and allocated cashiers.
                </p>
              </div>
            </div>

            <Button
              onClick={handleOpenBranchWithHead}
              size="sm"
              variant="outline"
              className="text-xs h-8 px-3 rounded-xl border-emerald-500/40 text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
            >
              <Plus className="h-3.5 w-3.5 mr-1 text-emerald-500" />
              <span>New Branch & Manager</span>
            </Button>
          </div>

          <div className="p-4 sm:p-5">
            {isBranchesLoading ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {[1, 2].map((i) => (
                  <div key={i} className="p-4 rounded-xl border border-border space-y-2">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-48" />
                    <Skeleton className="h-8 w-full rounded-lg" />
                  </div>
                ))}
              </div>
            ) : branches.length === 0 ? (
              <div className="p-8 text-center border-2 border-dashed border-border/80 rounded-2xl space-y-3">
                <Store className="h-8 w-8 text-muted-foreground mx-auto" />
                <h4 className="text-sm font-bold text-foreground">No Branches Registered Yet</h4>
                <p className="text-xs text-muted-foreground max-w-md mx-auto">
                  Create your first branch and immediately appoint a Sub-Admin as its Head Manager to start managing branch-isolated operations.
                </p>
                <Button
                  onClick={handleOpenBranchWithHead}
                  className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-xs h-9 px-4 font-semibold"
                >
                  <Plus className="h-3.5 w-3.5 mr-1.5" />
                  <span>Create First Branch & Manager</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                {branches.map((b) => {
                  const branchCashiersCount = users.filter(
                    (u) => u.role === 'APPRENTICE' && u.branchId === b.id && !u.isDeleted
                  ).length;
                  const branchSubAdmin = users.find(
                    (u) => u.role === 'ADMIN' && u.branchId === b.id && !u.isDeleted
                  );
                  const isSelected = selectedBranchFilter === b.id;

                  return (
                    <div
                      key={b.id}
                      className={cn(
                        'p-4 rounded-2xl border transition-all flex flex-col justify-between space-y-3',
                        b.isMain
                          ? 'border-emerald-500/40 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04]'
                          : 'border-border bg-card/60 hover:border-border',
                        isSelected && 'ring-2 ring-emerald-500 border-emerald-500 shadow-sm'
                      )}
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <h4 className="text-xs font-bold text-foreground truncate">{b.name}</h4>
                              {b.isMain && (
                                <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[9px] font-bold px-1.5 py-0">
                                  ★ Main
                                </Badge>
                              )}
                            </div>
                            {b.code && (
                              <p className="text-[10px] font-mono text-muted-foreground mt-0.5">
                                Code: <strong>{b.code}</strong>
                              </p>
                            )}
                          </div>

                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            {branchCashiersCount} Cashier{branchCashiersCount === 1 ? '' : 's'}
                          </Badge>
                        </div>

                        {b.address && (
                          <p className="text-[11px] text-muted-foreground flex items-center truncate">
                            <MapPin className="h-3 w-3 mr-1 text-muted-foreground shrink-0" />
                            <span className="truncate">{b.address}</span>
                          </p>
                        )}
                      </div>

                      {/* Head of Branch Display */}
                      <div className="p-2.5 rounded-xl bg-secondary/50 border border-border/80 flex items-center justify-between text-xs">
                        <div className="min-w-0 pr-2">
                          <p className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
                            Head Manager
                          </p>
                          {branchSubAdmin ? (
                            <div className="flex items-center space-x-1.5 mt-0.5">
                              <Shield className="h-3 w-3 text-indigo-500 shrink-0" />
                              <span className="font-semibold text-foreground truncate text-[11px]">
                                {branchSubAdmin.firstName} {branchSubAdmin.lastName}
                              </span>
                            </div>
                          ) : (
                            <span className="text-[11px] text-amber-600 dark:text-amber-400 font-medium">
                              No Manager Appointed
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => {
                              setSelectedBranchFilter(isSelected ? 'ALL' : b.id);
                            }}
                            className={cn(
                              'h-7 px-2 text-[10px] rounded-lg font-semibold cursor-pointer',
                              isSelected
                                ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                                : 'text-muted-foreground hover:text-foreground'
                            )}
                          >
                            {isSelected ? 'Viewing' : 'View Staff'}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleOpenAddCashier(b.id)}
                            className="h-7 px-2 text-[10px] rounded-lg font-semibold text-emerald-600 hover:bg-emerald-500/10 cursor-pointer"
                            title="Add Cashier directly to this branch"
                          >
                            <Plus className="h-3 w-3 mr-0.5" />
                            <span>Cashier</span>
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* ======================================================== */}
      {/* STAFF DIRECTORY TABLE                                    */}
      {/* ======================================================== */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        {/* Table Filter & Search Controls */}
        <div className="p-4 border-b border-border bg-secondary/20 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center space-x-2 w-full sm:w-auto">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
              <Input
                placeholder="Search staff by name or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-xs rounded-xl bg-background border-border"
              />
            </div>

            {/* Branch Filter dropdown */}
            {!isSubAdmin && hasMultiBranch && branches.length > 0 && (
              <div className="flex items-center space-x-1.5 shrink-0">
                <Store className="h-3.5 w-3.5 text-muted-foreground" />
                <select
                  value={selectedBranchFilter}
                  onChange={(e) => setSelectedBranchFilter(e.target.value)}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-xs text-foreground cursor-pointer focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="ALL">All Branches ({users.length})</option>
                  {branches.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name} {b.isMain ? '★' : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}
          </div>

          <div className="flex items-center space-x-2 self-end sm:self-auto text-xs text-muted-foreground font-mono">
            <span>Showing:</span>
            <strong className="text-foreground">{displayedUsers.length} staff members</strong>
            {selectedBranchFilter !== 'ALL' && (
              <button
                type="button"
                onClick={() => setSelectedBranchFilter('ALL')}
                className="text-xs text-emerald-500 hover:underline font-semibold ml-1 cursor-pointer"
              >
                (Clear Filter)
              </button>
            )}
          </div>
        </div>

        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40 border-b border-border">
              <TableHead className="py-4 pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</TableHead>
              {hasMultiBranch && (
                <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Assigned Branch</TableHead>
              )}
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Registered</TableHead>
              <TableHead className="py-4 pr-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Access Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isUsersLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="border-b border-border/60">
                  <TableCell className="py-4 pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                  {hasMultiBranch && (
                    <TableCell className="py-4"><Skeleton className="h-6 w-24 rounded-full" /></TableCell>
                  )}
                  <TableCell className="py-4"><Skeleton className="h-6 w-28 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-4 pr-6 text-right"><Skeleton className="h-8 w-24 rounded-xl ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isUsersError ? (
              <TableRow>
                <TableCell colSpan={hasMultiBranch ? 7 : 6} className="text-center p-8 text-rose-500 font-medium">
                  Failed to fetch staff accounts.
                </TableCell>
              </TableRow>
            ) : displayedUsers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={hasMultiBranch ? 7 : 6} className="text-center p-10 text-muted-foreground text-xs">
                  No staff members match the selected criteria. Click &quot;Add Cashier&quot; to register team members.
                </TableCell>
              </TableRow>
            ) : (
              displayedUsers.map((item) => {
                const isSuspended = !!item.isSuspended;
                const isItemSubAdmin = item.role === 'ADMIN' && Boolean(item.branchId);
                const isItemMainAdmin = item.role === 'ADMIN' && !item.branchId;
                const isSelf = item.id === user?.id;
                const isUnassigned = !item.branchId && item.role === 'APPRENTICE';

                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 border-b border-border/60">
                    <TableCell className="font-bold text-foreground py-4 pl-6">
                      <div className="flex items-center space-x-2">
                        <span>{item.firstName} {item.lastName}</span>
                        {isSelf && (
                          <Badge variant="outline" className="text-[10px] text-muted-foreground border-border">
                            You
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-4 font-mono">{item.email}</TableCell>
                    {hasMultiBranch && (
                      <TableCell className="py-4">
                        {item.branch ? (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 font-mono text-[10px] font-bold tracking-wide px-2 rounded-lg flex items-center space-x-1 w-fit">
                            <Store className="h-3 w-3 mr-1 shrink-0" />
                            <span>{item.branch.name}</span>
                          </Badge>
                        ) : isItemMainAdmin ? (
                          <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-mono text-[10px] font-bold tracking-wide px-2 rounded-lg flex items-center space-x-1 w-fit">
                            <Crown className="h-3 w-3 mr-1 shrink-0" />
                            <span>All Branches (Global)</span>
                          </Badge>
                        ) : (
                          <div className="flex items-center space-x-1.5">
                            <Badge variant="outline" className="text-[10px] text-amber-600 dark:text-amber-400 border-amber-500/40 bg-amber-500/10">
                              Unassigned
                            </Badge>
                            {isMainAdmin && (
                              <button
                                type="button"
                                onClick={() => handleOpenReassign(item)}
                                className="text-[10px] text-emerald-600 dark:text-emerald-400 hover:underline font-semibold cursor-pointer"
                              >
                                Assign Branch
                              </button>
                            )}
                          </div>
                        )}
                      </TableCell>
                    )}
                    <TableCell className="py-4">
                      {isItemMainAdmin ? (
                        <Badge className="bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/30 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border">
                          Main Admin
                        </Badge>
                      ) : isItemSubAdmin ? (
                        <Badge className="bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/30 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border flex items-center space-x-1 w-fit">
                          <Shield className="h-3 w-3 mr-1" />
                          <span>Head of Branch</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold tracking-wider px-2 rounded-full border">
                          Cashier
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="py-4">
                      {isSuspended ? (
                        <Badge className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border flex items-center space-x-1 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-amber-500 animate-pulse" />
                          <span>Suspended</span>
                        </Badge>
                      ) : (
                        <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full border flex items-center space-x-1 w-fit">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          <span>Active</span>
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono py-4">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right py-4 pr-6">
                      {isSelf || (isSubAdmin && item.role === 'ADMIN') ? (
                        <span className="text-[11px] text-muted-foreground italic">Protected</span>
                      ) : (
                        <div className="flex items-center justify-end space-x-1.5">
                          {isMainAdmin && hasMultiBranch && !isItemMainAdmin && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleOpenReassign(item)}
                              className="h-8 px-2 text-[11px] text-muted-foreground hover:text-foreground rounded-lg"
                              title="Reassign to another branch"
                            >
                              Transfer
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleToggleSuspend(item)}
                            className={cn(
                              'h-8 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 cursor-pointer',
                              isSuspended
                                ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400'
                                : 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400'
                            )}
                          >
                            {isSuspended ? (
                              <>
                                <UserCheck className="h-3.5 w-3.5" />
                                <span>Reactivate</span>
                              </>
                            ) : (
                              <>
                                <UserX className="h-3.5 w-3.5" />
                                <span>Suspend</span>
                              </>
                            )}
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* ======================================================== */}
      {/* MODAL 1: CREATE BRANCH & HEAD MANAGER SIMULTANEOUSLY     */}
      {/* ======================================================== */}
      {/* ======================================================== */}
      {/* MODAL 1: CREATE BRANCH & HEAD MANAGER SIMULTANEOUSLY     */}
      {/* ======================================================== */}
      <Dialog open={isBranchWithHeadOpen} onOpenChange={setIsBranchWithHeadOpen}>
        <DialogContent className="bg-card border-border/80 rounded-2xl p-6 sm:p-7 shadow-2xl sm:max-w-[700px] w-full max-h-[92vh] overflow-y-auto">
          <form onSubmit={branchForm.handleSubmit(onSubmitBranchWithHead)}>
            <DialogHeader className="border-b border-border/70 pb-4">
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-emerald-500/20 to-teal-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shadow-sm shrink-0">
                  <Store className="h-5 w-5" />
                </div>
                <div className="space-y-0.5">
                  <DialogTitle className="text-base sm:text-lg font-bold font-heading tracking-tight text-foreground flex items-center gap-2">
                    <span>Create Branch & Appoint Head Manager</span>
                  </DialogTitle>
                  <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                    Establish a new physical branch depot and automatically provision its dedicated Sub-Admin manager.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formErrorMsg && (
                <div className="flex items-center space-x-2.5 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl animate-in fade-in-50">
                  <ShieldAlert className="h-4 w-4 shrink-0" />
                  <span className="font-medium">{formErrorMsg}</span>
                </div>
              )}

              {/* Section 1: Branch Details */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-secondary/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                      <Building2 className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold font-heading text-foreground tracking-wide">
                      1. Physical Branch Location
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                    Location Info
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-3.5">
                  {/* Branch Name */}
                  <div className="col-span-12 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span>Branch / Depot Name <span className="text-rose-500">*</span></span>
                    </Label>
                    <div className="relative">
                      <Store className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="e.g. Lekki Central Depot"
                        {...branchForm.register('branchName')}
                        className="bg-background pl-9 h-10 rounded-xl text-xs border-border/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    {branchForm.formState.errors.branchName && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {branchForm.formState.errors.branchName.message}
                      </p>
                    )}
                  </div>

                  {/* Address */}
                  <div className="col-span-12 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground flex items-center justify-between">
                      <span>Address / Physical Location <span className="text-rose-500">*</span></span>
                    </Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        placeholder="e.g. Plot 14, Commercial Avenue, Lekki Phase 1, Lagos"
                        {...branchForm.register('branchAddress')}
                        className="bg-background pl-9 h-10 rounded-xl text-xs border-border/80 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                      />
                    </div>
                    {branchForm.formState.errors.branchAddress && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {branchForm.formState.errors.branchAddress.message}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Section 2: Head Manager (Sub-Admin) Details */}
              <div className="p-4 sm:p-5 rounded-2xl border border-border/70 bg-secondary/15 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className="h-6 w-6 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                      <Shield className="h-3.5 w-3.5" />
                    </div>
                    <span className="text-xs font-bold font-heading text-foreground tracking-wide">
                      2. Head Manager (Sub-Admin Credentials)
                    </span>
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
                    Account Access
                  </span>
                </div>

                <div className="grid grid-cols-12 gap-3.5">
                  {/* Manager First Name */}
                  <div className="col-span-12 sm:col-span-6 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Manager First Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. John"
                      {...branchForm.register('managerFirstName')}
                      className="bg-background h-10 rounded-xl text-xs border-border/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    {branchForm.formState.errors.managerFirstName && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {branchForm.formState.errors.managerFirstName.message}
                      </p>
                    )}
                  </div>

                  {/* Manager Last Name */}
                  <div className="col-span-12 sm:col-span-6 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Manager Last Name <span className="text-rose-500">*</span>
                    </Label>
                    <Input
                      placeholder="e.g. Doe"
                      {...branchForm.register('managerLastName')}
                      className="bg-background h-10 rounded-xl text-xs border-border/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                    />
                    {branchForm.formState.errors.managerLastName && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {branchForm.formState.errors.managerLastName.message}
                      </p>
                    )}
                  </div>

                  {/* Manager Work Email */}
                  <div className="col-span-12 space-y-1.5">
                    <Label className="text-xs font-semibold text-muted-foreground">
                      Manager Work Email Address <span className="text-rose-500">*</span>
                    </Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        type="email"
                        placeholder="e.g. manager.lekki@company.com"
                        {...branchForm.register('managerEmail')}
                        className="bg-background pl-9 h-10 rounded-xl text-xs font-mono border-border/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                    {branchForm.formState.errors.managerEmail && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {branchForm.formState.errors.managerEmail.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div className="col-span-12 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold text-muted-foreground">
                        Access Password <span className="text-rose-500">*</span>
                      </Label>
                      <span className="text-[10px] text-muted-foreground font-mono">Min 6 characters</span>
                    </div>
                    <div className="relative">
                      <LockIcon className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
                      <Input
                        type={showManagerPassword ? 'text' : 'password'}
                        placeholder="Enter secure password..."
                        {...branchForm.register('managerPassword')}
                        className="bg-background pl-9 pr-10 h-10 rounded-xl text-xs border-border/80 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowManagerPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
                      >
                        {showManagerPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {branchForm.formState.errors.managerPassword && (
                      <p className="text-[11px] text-rose-500 font-medium">
                        {branchForm.formState.errors.managerPassword.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Sub-Admin Scope Info Box */}
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-indigo-500/10 via-indigo-500/5 to-transparent border border-indigo-500/20 flex items-start space-x-2.5 text-xs text-indigo-700 dark:text-indigo-300">
                  <Sparkles className="h-4 w-4 shrink-0 text-indigo-500 mt-0.5" />
                  <span className="leading-relaxed text-[11px] sm:text-xs">
                    This manager will automatically receive <strong>Sub-Admin</strong> status locked to this branch depot. They will have access to create and manage cashiers, review sales records, and run reports for this location exclusively.
                  </span>
                </div>
              </div>
            </div>

            <DialogFooter className="border-t border-border/70 pt-4 flex flex-row items-center justify-end gap-2.5">
              <Button
                type="button"
                variant="ghost"
                onClick={() => setIsBranchWithHeadOpen(false)}
                className="rounded-xl h-10 text-xs px-4 text-muted-foreground hover:text-foreground cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createBranchWithHeadMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-xs px-5 shadow-lg shadow-emerald-500/20 font-semibold cursor-pointer active:scale-[0.98] transition-all flex items-center space-x-2"
              >
                {createBranchWithHeadMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Creating Branch & Manager...</span>
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4" />
                    <span>Create Branch & Head Manager</span>
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 2: ADD CASHIER (BRANCH SELECTION MANDATORY)        */}
      {/* ======================================================== */}
      <Dialog open={isCashierOpen} onOpenChange={setIsCashierOpen}>
        <DialogContent className="bg-card border-border rounded-2xl p-6 shadow-2xl sm:max-w-lg w-full">
          <form onSubmit={cashierForm.handleSubmit(onSubmitCashier)}>
            <DialogHeader className="border-b border-border pb-4">
              <DialogTitle className="flex items-center space-x-2.5 font-bold font-heading">
                <UserCheck className="h-5 w-5 text-emerald-500" />
                <span>Register Point-of-Sale Cashier</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                {hasMultiBranch
                  ? 'A cashier can only be registered under a specific physical branch location.'
                  : 'Register a cashier for your business point of sale and invoicing.'}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {formErrorMsg && (
                <div className="flex items-center space-x-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{formErrorMsg}</span>
                </div>
              )}

              {/* MANDATORY BRANCH SELECTION ONLY FOR MULTI-BRANCH BUSINESSES */}
              {hasMultiBranch && (
                <div className="space-y-1.5">
                  <Label htmlFor="branchId" className="text-xs font-semibold text-muted-foreground">
                    Assigned Branch Location <span className="text-rose-500 font-bold">* (Mandatory)</span>
                  </Label>
                  {isSubAdmin ? (
                    <div className="h-10 px-3 bg-secondary/60 border border-border rounded-xl flex items-center space-x-2 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                      <Store className="h-4 w-4 shrink-0 text-emerald-500" />
                      <span>{branches.find((b) => b.id === userBranchId)?.name || 'Assigned Branch'}</span>
                      <Badge variant="outline" className="ml-auto text-[10px]">Auto-Locked</Badge>
                    </div>
                  ) : (
                    <div className="relative">
                      <Store className="absolute left-3 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
                      <select
                        id="branchId"
                        {...cashierForm.register('branchId')}
                        className="w-full bg-background pl-9 pr-4 h-10 rounded-xl border border-input text-xs text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
                      >
                        <option value="">— Select Assigned Branch (Required) —</option>
                        {branches.map((b) => (
                          <option key={b.id} value={b.id}>
                            {b.name} {b.isMain ? '★ (Main Branch)' : ''} {b.code ? `[${b.code}]` : ''}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                  {cashierForm.formState.errors.branchId && (
                    <p className="text-[11px] text-rose-500">
                      {cashierForm.formState.errors.branchId.message}
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="cashierFirstName" className="text-xs font-semibold text-muted-foreground">
                    First Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="cashierFirstName"
                    placeholder="e.g. Amina"
                    {...cashierForm.register('firstName')}
                    className="bg-background h-10 rounded-xl text-xs"
                  />
                  {cashierForm.formState.errors.firstName && (
                    <p className="text-[11px] text-rose-500">
                      {cashierForm.formState.errors.firstName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="cashierLastName" className="text-xs font-semibold text-muted-foreground">
                    Last Name <span className="text-rose-500">*</span>
                  </Label>
                  <Input
                    id="cashierLastName"
                    placeholder="e.g. Bello"
                    {...cashierForm.register('lastName')}
                    className="bg-background h-10 rounded-xl text-xs"
                  />
                  {cashierForm.formState.errors.lastName && (
                    <p className="text-[11px] text-rose-500">
                      {cashierForm.formState.errors.lastName.message}
                    </p>
                  )}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cashierEmail" className="text-xs font-semibold text-muted-foreground">
                  Cashier Email Address <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="cashierEmail"
                    type="email"
                    placeholder="e.g. cashier.branch@business.com"
                    {...cashierForm.register('email')}
                    className="bg-background pl-9 h-10 rounded-xl text-xs font-mono"
                  />
                </div>
                {cashierForm.formState.errors.email && (
                  <p className="text-[11px] text-rose-500">
                    {cashierForm.formState.errors.email.message}
                  </p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="cashierPassword" className="text-xs font-semibold text-muted-foreground">
                  Access Password <span className="text-rose-500">*</span>
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="cashierPassword"
                    type={showCashierPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters..."
                    {...cashierForm.register('password')}
                    className="bg-background pl-10 pr-10 h-10 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowCashierPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors cursor-pointer"
                  >
                    {showCashierPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
                {cashierForm.formState.errors.password && (
                  <p className="text-[11px] text-rose-500">
                    {cashierForm.formState.errors.password.message}
                  </p>
                )}
              </div>

              <div className="p-3 rounded-xl bg-secondary/50 border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Assigned Role:</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                  Cashier (Apprentice Access)
                </Badge>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4 gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCashierOpen(false)}
                className="rounded-xl h-10 text-xs px-4 cursor-pointer"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={createCashierMutation.isPending}
                className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-xs px-5 shadow-premium font-semibold cursor-pointer"
              >
                {createCashierMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Registering...</span>
                  </>
                ) : (
                  <span>Register Cashier</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* ======================================================== */}
      {/* MODAL 3: REASSIGN / ASSIGN BRANCH TO STAFF MEMBER        */}
      {/* ======================================================== */}
      <Dialog open={isReassignOpen} onOpenChange={setIsReassignOpen}>
        <DialogContent className="bg-card border-border rounded-2xl p-6 shadow-2xl sm:max-w-md w-full">
          <DialogHeader className="border-b border-border pb-4">
            <DialogTitle className="flex items-center space-x-2.5 font-bold font-heading">
              <Store className="h-5 w-5 text-emerald-500" />
              <span>Assign Staff to Branch</span>
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1">
              Select which physical branch {selectedUserToReassign?.firstName} {selectedUserToReassign?.lastName} will be allocated to.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold text-muted-foreground">Select Branch Location</Label>
              <select
                value={reassignBranchId}
                onChange={(e) => setReassignBranchId(e.target.value)}
                className="w-full bg-background px-3 h-10 rounded-xl border border-input text-xs text-foreground focus:ring-2 focus:ring-emerald-500 focus:outline-none cursor-pointer"
              >
                <option value="">— Select Branch —</option>
                {branches.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} {b.isMain ? '★ (Main Branch)' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <DialogFooter className="border-t border-border pt-4 gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsReassignOpen(false)}
              className="rounded-xl h-10 text-xs px-4"
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!reassignBranchId || adminUpdateMutation.isPending}
              onClick={onSubmitReassign}
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-xs px-5 shadow-premium font-semibold"
            >
              {adminUpdateMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Assigning...</span>
                </>
              ) : (
                <span>Confirm Assignment</span>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
