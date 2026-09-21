'use client';

import React, { useState } from 'react';
import { useUsersList, useCreateUser, useToggleSuspendUser } from '../../../features/users/hooks/useUsers';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, CreateUserInput } from '../../../features/users/schemas';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Plus, ShieldAlert, UserCheck, UserX, Loader2, Mail, Lock as LockIcon, Eye, EyeOff } from 'lucide-react';
import { AxiosErrorLike } from '../../../types/api';
import { Skeleton } from '../../../components/ui/skeleton';
import { useModal } from '../../../components/ui/modal-provider';

export default function UsersPage() {
  const { isAdmin } = usePermission();
  const modal = useModal();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  // Queries & Mutations
  const { data: users, isLoading, isError } = useUsersList();
  const createMutation = useCreateUser();
  const toggleSuspendMutation = useToggleSuspendUser();

  // Exclusively filter for Cashiers/Apprentices (Admins are managed outside this page)
  const cashiers = users?.filter((u) => u.role === 'APPRENTICE') || [];

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      password: '',
      role: 'APPRENTICE',
      firstName: '',
      lastName: '',
    },
  });

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center h-[50vh]">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h2 className="text-xl font-bold font-heading">Access Restricted</h2>
        <p className="text-sm text-muted-foreground mt-2 max-w-sm">
          Cashier management is strictly restricted to system administrators.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: CreateUserInput) => {
    setErrorMsg(null);
    try {
      await createMutation.mutateAsync({
        ...data,
        role: 'APPRENTICE',
      });
      setIsAddOpen(false);
      reset();
      modal.alert('Cashier Added', `Cashier ${data.firstName} ${data.lastName} registered successfully.`, 'success');
    } catch (err) {
      const msg = (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to create cashier account';
      setErrorMsg(msg);
    }
  };

  const handleToggleSuspend = async (id: string, name: string, isSuspended: boolean) => {
    const actionName = isSuspended ? 'Reactivate' : 'Suspend';
    const isConfirmed = await modal.confirm(
      `${actionName} Cashier Account`,
      isSuspended
        ? `Are you sure you want to reactivate access for ${name}? They will immediately be permitted to sign in.`
        : `Are you sure you want to suspend access for ${name}? Their active sessions will be terminated and they will be blocked from logging in.`
    );

    if (isConfirmed) {
      try {
        await toggleSuspendMutation.mutateAsync(id);
        modal.alert(
          'Status Updated',
          `Cashier ${name} has been ${isSuspended ? 'reactivated' : 'suspended'} successfully.`,
          'success'
        );
      } catch (err) {
        const errorMsg = (err as AxiosErrorLike).response?.data?.error?.message || `Failed to ${actionName.toLowerCase()} cashier`;
        modal.alert('Operation Failed', errorMsg, 'error');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-foreground font-heading">Cashier Management</h2>
          <p className="text-xs text-muted-foreground mt-1">
            Register and manage authorized system cashiers and shift permissions.
          </p>
        </div>

        <Button
          onClick={() => {
            setErrorMsg(null);
            reset();
            setIsAddOpen(true);
          }}
          className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl shadow-premium h-10 text-xs font-semibold px-4 flex items-center space-x-2 shrink-0 cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span>Add Cashier</span>
        </Button>
      </div>

      {/* Cashiers Table Card */}
      <Card className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40 hover:bg-secondary/40 border-b border-border">
              <TableHead className="py-4 pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Full Name</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Email Address</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Role</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</TableHead>
              <TableHead className="py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Date Registered</TableHead>
              <TableHead className="py-4 pr-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider text-right">Access Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="border-b border-border/60">
                  <TableCell className="py-4 pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-20 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-4 pr-6 text-right"><Skeleton className="h-8 w-24 rounded-xl ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-8 text-rose-500 font-medium">
                  Failed to fetch cashier accounts.
                </TableCell>
              </TableRow>
            ) : cashiers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center p-10 text-muted-foreground text-xs">
                  No cashiers registered yet. Click &quot;Add Cashier&quot; to create the first account.
                </TableCell>
              </TableRow>
            ) : (
              cashiers.map((item) => {
                const isSuspended = !!item.isSuspended;
                return (
                  <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 border-b border-border/60">
                    <TableCell className="font-bold text-foreground py-4 pl-6">
                      {item.firstName} {item.lastName}
                    </TableCell>
                    <TableCell className="text-muted-foreground text-xs py-4 font-mono">{item.email}</TableCell>
                    <TableCell className="py-4">
                      <Badge className="bg-slate-100 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold tracking-wider px-2 rounded-full border">
                        Cashier
                      </Badge>
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
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleToggleSuspend(item.id, `${item.firstName} ${item.lastName}`, isSuspended)}
                        className={`h-8 px-3 rounded-xl text-xs font-semibold transition-colors flex items-center space-x-1.5 ml-auto cursor-pointer ${
                          isSuspended
                            ? 'border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-600 dark:text-emerald-400'
                            : 'border-amber-500/30 text-amber-600 hover:bg-amber-500/10 hover:text-amber-600 dark:text-amber-400'
                        }`}
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
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </Card>

      {/* Add Cashier modal */}
      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent className="bg-card border-border rounded-2xl p-6 shadow-2xl">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader className="border-b border-border pb-4">
              <DialogTitle className="flex items-center space-x-2.5 font-bold font-heading">
                <UserCheck className="h-5 w-5 text-emerald-500" />
                <span>Create New Cashier</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-1">
                Assign credential access keys to register cashier ledger entries.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-5">
              {errorMsg && (
                <div className="flex items-center space-x-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold text-muted-foreground">
                    First Name
                  </Label>
                  <Input id="firstName" {...register('firstName')} className="bg-background h-10 rounded-xl" />
                  {errors.firstName && <p className="text-xs text-rose-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold text-muted-foreground">
                    Last Name
                  </Label>
                  <Input id="lastName" {...register('lastName')} className="bg-background h-10 rounded-xl" />
                  {errors.lastName && <p className="text-xs text-rose-500">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="email" type="email" placeholder="e.g. cashier@laosteel.com" {...register('email')} className="bg-background pl-9 h-10 rounded-xl" />
                </div>
                {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                  Access Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Min 6 characters..."
                    {...register('password')}
                    className="bg-background pl-10 pr-10 h-10 rounded-xl text-xs"
                  />
                  <button
                    type="button"
                    tabIndex={-1}
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 rounded-md transition-colors"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              {/* Locked Role Notification */}
              <div className="p-3.5 rounded-xl bg-secondary/50 border border-border flex items-center justify-between text-xs">
                <span className="text-muted-foreground font-medium">Assigned System Role:</span>
                <Badge className="bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 font-mono text-[10px] font-bold tracking-wider px-2.5 py-0.5 rounded-full">
                  Cashier (Apprentice Access)
                </Badge>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-10 text-xs px-4 cursor-pointer">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 text-xs px-5 shadow-premium font-semibold cursor-pointer">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Create Cashier</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
