'use client';

import React, { useState } from 'react';
import {
  MapPin,
  Store,
  Plus,
  Edit2,
  Trash2,
  Star,
  Phone,
  Mail,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Lock,
  Building2,
  Loader2,
  Users,
  FileText,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { useModal } from '../../../components/ui/modal-provider';
import {
  useBranches,
  useCreateBranch,
  useUpdateBranch,
  useDeleteBranch,
} from '../hooks/useBranches';
import { useSubscription } from '../../subscriptions/hooks/useSubscription';
import { Branch } from '../../../types/api';
import { cn } from '../../../lib/utils';

export const BranchManagementSection: React.FC = () => {
  const modal = useModal();
  const { data: branches = [], isLoading, isError, refetch } = useBranches();
  const { data: subDetails } = useSubscription();

  const createBranchMutation = useCreateBranch();
  const updateBranchMutation = useUpdateBranch();
  const deleteBranchMutation = useDeleteBranch();

  // Multi-branch capability check
  const hasMultiBranchCapability = Boolean(
    subDetails?.capabilities?.multipleBranches ??
    subDetails?.subscription?.hasMultipleBranches ??
    false
  );

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBranch, setEditingBranch] = useState<Branch | null>(null);

  // Form inputs
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [address, setAddress] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [isMain, setIsMain] = useState(false);
  const [isActive, setIsActive] = useState(true);
  const [formError, setFormError] = useState<string | null>(null);

  const openCreateModal = () => {
    // If not enterprise/multi-branch and already has at least 1 branch, warn and block
    if (!hasMultiBranchCapability && branches.length >= 1) {
      modal.alert(
        'Feature Restricted',
        'Your current subscription allows a single primary location. Upgrade to the Enterprise plan to unlock multi-depot branches and aggregated location reporting.',
        'warning'
      );
      return;
    }

    setEditingBranch(null);
    setName('');
    setCode('');
    setAddress('');
    setPhone('');
    setEmail('');
    setIsMain(branches.length === 0);
    setIsActive(true);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (branch: Branch) => {
    setEditingBranch(branch);
    setName(branch.name);
    setCode(branch.code || '');
    setAddress(branch.address);
    setPhone(branch.phone || '');
    setEmail(branch.email || '');
    setIsMain(branch.isMain);
    setIsActive(branch.isActive);
    setFormError(null);
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!name.trim()) {
      setFormError('Branch name is required.');
      return;
    }
    if (!address.trim()) {
      setFormError('Branch physical address is required.');
      return;
    }
    if (phone.trim()) {
      const parts = phone.split(/[,/]/).map((p) => p.trim()).filter(Boolean);
      const isInvalid = parts.some((p) => {
        if (!/^\+?[0-9\s\-()]{7,20}$/.test(p)) return true;
        const digits = p.replace(/\D/g, '');
        return digits.length < 8 || digits.length > 15;
      });
      if (isInvalid) {
        setFormError('Please provide a valid phone number (8 to 15 digits, e.g. +234 803 000 0000).');
        return;
      }
    }

    try {
      if (editingBranch) {
        await updateBranchMutation.mutateAsync({
          id: editingBranch.id,
          payload: {
            name: name.trim(),
            code: code.trim() || null,
            address: address.trim(),
            phone: phone.trim() || null,
            email: email.trim() || null,
            isMain,
            isActive,
          },
        });
        modal.alert('Branch Updated', `Branch "${name}" has been updated.`, 'success');
      } else {
        await createBranchMutation.mutateAsync({
          name: name.trim(),
          code: code.trim() || null,
          address: address.trim(),
          phone: phone.trim() || null,
          email: email.trim() || null,
          isMain,
        });
        modal.alert('Branch Created', `New branch "${name}" created successfully.`, 'success');
      }
      setIsModalOpen(false);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Failed to save branch. Please check inputs.';
      setFormError(msg);
    }
  };

  const handleDelete = async (branch: Branch) => {
    if (branch.isMain && branches.length > 1) {
      modal.alert(
        'Action Denied',
        'Cannot delete the primary/main branch while other branches exist. Designate another branch as primary first.',
        'error'
      );
      return;
    }

    const isConfirmed = await modal.confirm(
      'Delete Branch',
      `Are you sure you want to delete branch "${branch.name}"? Staff and invoices linked to this branch will have their branch reference set to unassigned.`,
      'Delete Branch',
      'Cancel'
    );

    if (isConfirmed) {
      try {
        await deleteBranchMutation.mutateAsync(branch.id);
        modal.alert('Deleted', `Branch "${branch.name}" removed successfully.`, 'success');
      } catch (err: any) {
        const msg = err?.response?.data?.message || err?.message || 'Failed to delete branch.';
        modal.alert('Error', msg, 'error');
      }
    }
  };

  const handleSetMain = async (branch: Branch) => {
    try {
      await updateBranchMutation.mutateAsync({
        id: branch.id,
        payload: { isMain: true },
      });
      modal.alert('Primary Branch Updated', `"${branch.name}" is now the primary branch.`, 'success');
    } catch (err: any) {
      modal.alert('Error', err?.response?.data?.message || 'Failed to update primary branch.', 'error');
    }
  };

  const [isInitializingDefaults, setIsInitializingDefaults] = useState(false);

  const handleInitDefaultBranches = async () => {
    setIsInitializingDefaults(true);
    try {
      await createBranchMutation.mutateAsync({
        name: 'Main Branch / Head Office',
        code: 'MAIN',
        address: 'Headquarters / Primary Operational Depot',
        isMain: true,
        isActive: true,
      });
      await createBranchMutation.mutateAsync({
        name: 'Branch 2 (Depot)',
        code: 'BR-02',
        address: 'Secondary Depot / Warehouse Location',
        isMain: false,
        isActive: true,
      });
      modal.alert(
        'Default Branches Configured',
        'Default 2 branches have been initialized. You can assign Sub-Admins and Cashiers or add additional branches anytime.',
        'success'
      );
    } catch (err: any) {
      modal.alert('Initialization Failed', err?.response?.data?.message || err?.message || 'Failed to setup default branches', 'error');
    } finally {
      setIsInitializingDefaults(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Capability Notification / Upgrade Prompt */}
      {!hasMultiBranchCapability && (
        <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 shrink-0">
              <Lock className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <p className="text-sm font-bold text-foreground">Single Branch Plan</p>
                <Badge className="bg-amber-500/15 text-amber-600 border-amber-500/30 text-[10px] font-mono">
                  {subDetails?.subscription?.plan || 'STARTER'}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
                Your organization is currently configured for a single primary location. Upgrade to an Enterprise plan to manage multiple warehouses, branch-level invoicing, and multi-depot cashiers.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Card */}
      <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
        <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
              <Store className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                Branch & Depot Network
              </CardTitle>
              <CardDescription className="text-xs">
                Manage physical depots, warehouses, and secondary outlets for staff and billing allocation.
              </CardDescription>
            </div>
          </div>

          <Button
            type="button"
            onClick={openCreateModal}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl h-9 px-4 text-xs font-semibold shadow-sm transition-all flex items-center space-x-1.5 shrink-0"
          >
            <Plus className="h-4 w-4" />
            <span>Add Branch</span>
          </Button>
        </CardHeader>

        <CardContent className="p-4 sm:p-6">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center space-y-3">
              <Loader2 className="h-6 w-6 animate-spin text-emerald-500" />
              <p className="text-xs text-muted-foreground font-mono">Loading organization branches...</p>
            </div>
          ) : isError ? (
            <div className="p-6 text-center space-y-3">
              <AlertCircle className="h-8 w-8 text-rose-500 mx-auto" />
              <p className="text-sm font-semibold text-foreground">Failed to load branch records.</p>
              <Button onClick={() => refetch()} variant="outline" size="sm" className="rounded-xl text-xs">
                Retry
              </Button>
            </div>
          ) : branches.length === 0 ? (
            <div className="p-8 text-center border-2 border-dashed border-border/70 rounded-2xl space-y-4">
              <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center mx-auto">
                <Store className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-foreground">No Branches Registered</h3>
                <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                  {hasMultiBranchCapability
                    ? 'Configure your default 2 branches (Main Branch & Branch 2 Depot) or create custom locations.'
                    : 'Set up your primary head office location to begin assigning staff and tracking invoices per branch.'}
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                {hasMultiBranchCapability && (
                  <Button
                    onClick={handleInitDefaultBranches}
                    disabled={isInitializingDefaults}
                    size="sm"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-premium h-9 px-4 cursor-pointer"
                  >
                    {isInitializingDefaults ? (
                      <>
                        <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                        <span>Configuring Defaults...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-3.5 w-3.5 mr-1.5 text-emerald-200" />
                        <span>Setup Default 2 Branches (Main & Depot)</span>
                      </>
                    )}
                  </Button>
                )}

                <Button
                  onClick={openCreateModal}
                  variant={hasMultiBranchCapability ? 'outline' : 'default'}
                  size="sm"
                  className={cn(
                    "rounded-xl text-xs h-9 px-4 cursor-pointer",
                    !hasMultiBranchCapability && "bg-emerald-600 hover:bg-emerald-500 text-white"
                  )}
                >
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  <span>Register Custom Branch</span>
                </Button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {branches.map((b) => (
                <div
                  key={b.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all ${
                    b.isMain
                      ? 'border-emerald-500/40 bg-emerald-500/[0.02] dark:bg-emerald-500/[0.04] shadow-sm'
                      : 'border-border/80 bg-card hover:border-border'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                          {b.name}
                        </h4>
                        {b.isMain && (
                          <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30 text-[10px] font-bold">
                            <Star className="h-3 w-3 fill-emerald-500 mr-1" />
                            Main Branch
                          </Badge>
                        )}
                        {!b.isActive && (
                          <Badge className="bg-slate-200 dark:bg-slate-800 text-slate-500 text-[10px]">
                            Inactive
                          </Badge>
                        )}
                      </div>
                      {b.code && (
                        <p className="text-[11px] font-mono font-semibold text-muted-foreground">
                          Code: {b.code}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center space-x-1 shrink-0">
                      {!b.isMain && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSetMain(b)}
                          title="Set as Primary Branch"
                          className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-emerald-500"
                        >
                          <Star className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditModal(b)}
                        className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-foreground"
                      >
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(b)}
                        className="h-8 w-8 p-0 rounded-lg text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  <div className="mt-3.5 space-y-2 text-xs text-muted-foreground">
                    <div className="flex items-start space-x-2">
                      <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400 mt-0.5" />
                      <span className="line-clamp-2">{b.address}</span>
                    </div>
                    {b.phone && (
                      <div className="flex items-center space-x-2 font-mono">
                        <Phone className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{b.phone}</span>
                      </div>
                    )}
                    {b.email && (
                      <div className="flex items-center space-x-2">
                        <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span className="truncate">{b.email}</span>
                      </div>
                    )}
                  </div>

                  {/* Branch Stats */}
                  <div className="mt-4 pt-3 border-t border-border/60 flex items-center justify-between text-[11px] font-mono text-muted-foreground">
                    <div className="flex items-center space-x-1.5">
                      <Users className="h-3.5 w-3.5 text-slate-400" />
                      <span>{b.userCount || 0} Staff</span>
                    </div>
                    <div className="flex items-center space-x-1.5">
                      <FileText className="h-3.5 w-3.5 text-slate-400" />
                      <span>{b.invoiceCount || 0} Invoices</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* CREATE / EDIT MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in-0 duration-200">
          <div className="bg-card border border-border/90 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            <div className="p-5 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-500">
                  <Store className="h-4 w-4" />
                </div>
                <h3 className="font-bold text-sm text-foreground">
                  {editingBranch ? 'Edit Branch Details' : 'Register New Branch'}
                </h3>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsModalOpen(false)}
                className="h-8 w-8 p-0 rounded-lg text-muted-foreground hover:text-foreground"
              >
                ✕
              </Button>
            </div>

            <form onSubmit={handleSubmit} className="p-5 space-y-4">
              {formError && (
                <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 text-xs flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2 space-y-1.5">
                  <Label className="text-xs font-semibold">Branch Name *</Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ikeja Warehouse"
                    className="h-9 text-xs rounded-xl"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Code / Prefix</Label>
                  <Input
                    value={code}
                    onChange={(e) => setCode(e.target.value.toUpperCase())}
                    placeholder="e.g. IKJ-01"
                    className="h-9 text-xs font-mono rounded-xl uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Physical Address *</Label>
                <Input
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Plot 12 Commercial Way, Industrial Estate"
                  className="h-9 text-xs rounded-xl"
                  required
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Contact Phone</Label>
                  <Input
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +234 803 000 0000"
                    className="h-9 text-xs font-mono rounded-xl"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">Branch Email</Label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ikeja@company.com"
                    className="h-9 text-xs rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex flex-col space-y-2.5">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMain}
                    onChange={(e) => setIsMain(e.target.checked)}
                    className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                  />
                  <span className="text-xs font-semibold text-foreground">
                    Set as Primary / Main Branch
                  </span>
                </label>

                {editingBranch && (
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={isActive}
                      onChange={(e) => setIsActive(e.target.checked)}
                      className="rounded border-border text-emerald-600 focus:ring-emerald-500 h-4 w-4"
                    />
                    <span className="text-xs font-semibold text-foreground">
                      Branch is Active
                    </span>
                  </label>
                )}
              </div>

              <div className="pt-4 border-t border-border/80 flex items-center justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                  className="rounded-xl text-xs h-9"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createBranchMutation.isPending || updateBranchMutation.isPending}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs h-9 font-semibold"
                >
                  {createBranchMutation.isPending || updateBranchMutation.isPending ? (
                    <>
                      <Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />
                      Saving...
                    </>
                  ) : editingBranch ? (
                    'Save Changes'
                  ) : (
                    'Create Branch'
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
