'use client';

import React, { useState } from 'react';
import { useUsersList, useCreateUser, useDeleteUser } from '../../../features/users/hooks/useUsers';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, CreateUserInput } from '../../../features/users/schemas';
import { Button } from '../../../components/ui/button';
import { Card, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus, Trash2, ShieldAlert, UserCheck, Loader2, Mail, Lock as LockIcon } from 'lucide-react';
import { AxiosErrorLike } from '../../../types/api';
import { Skeleton } from '../../../components/ui/skeleton';

export default function UsersPage() {
  const { isAdmin } = usePermission();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Queries
  const { data: users, isLoading, isError } = useUsersList();
  const createMutation = useCreateUser();
  const deleteMutation = useDeleteUser();

  const {
    register,
    handleSubmit,
    setValue,
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
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto space-y-3">
        <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-full">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground font-heading">Access Denied</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Only Administrators are authorized to view or manage cashier credentials.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: CreateUserInput) => {
    setErrorMsg(null);
    try {
      await createMutation.mutateAsync(data);
      setIsAddOpen(false);
      reset();
      alert('Cashier user account created successfully');
    } catch (err) {
      setErrorMsg((err as AxiosErrorLike).response?.data?.error?.message || 'Failed to create user account');
    }
  };

  const handleDelete = async (id: string, email: string) => {
    if (confirm(`Are you sure you want to delete ${email}?`)) {
      try {
        await deleteMutation.mutateAsync(id);
        alert('User account soft-deleted successfully');
      } catch (err) {
        alert((err as AxiosErrorLike).response?.data?.error?.message || 'Failed to delete user');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">Cashier Management</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure system cashiers and administrator access key accounts.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-semibold space-x-2 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl shadow-premium h-10 px-4">
          <Plus className="h-4 w-4" />
          <span>Add Cashier</span>
        </Button>
      </div>

      {/* Users table */}
      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <Table>
          <TableHeader className="bg-secondary/40 sticky top-0 z-10 border-b border-border">
            <TableRow className="hover:bg-transparent">
              <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4 pl-6">Full Name</TableHead>
              <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Email Address</TableHead>
              <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Role</TableHead>
              <TableHead className="font-semibold text-[#0F172A] dark:text-[#F8FAFC] py-4">Date Registered</TableHead>
              <TableHead className="w-24 font-semibold text-center text-[#0F172A] dark:text-[#F8FAFC] py-4 pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i} className="border-b border-border/60">
                  <TableCell className="py-4 pl-6"><Skeleton className="h-4 w-32" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-40" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="py-4"><Skeleton className="h-4 w-24" /></TableCell>
                  <TableCell className="py-4 pr-6"><Skeleton className="h-8 w-8 rounded-full mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError || !users ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-8 text-rose-500 font-medium">
                  Failed to fetch user accounts.
                </TableCell>
              </TableRow>
            ) : (
              users.map((item) => (
                <TableRow key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/35 border-b border-border/60">
                  <TableCell className="font-bold text-foreground py-4 pl-6">
                    {item.firstName} {item.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs py-4">{item.email}</TableCell>
                  <TableCell className="py-4">
                    <Badge className={item.role === 'ADMIN' ? 'bg-blue-50 hover:bg-blue-50 text-blue-600 dark:bg-blue-500/10 dark:text-blue-400 font-mono text-[10px] font-bold tracking-wider px-2 rounded-full border border-blue-100 dark:border-blue-500/25' : 'bg-slate-100 hover:bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700 font-mono text-[10px] font-bold tracking-wider px-2 rounded-full border'}>
                      {item.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono py-4">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center py-4 pr-6">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id, item.email)}
                      className="h-8 w-8 rounded-full text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10 transition-colors"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
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
                <UserCheck className="h-5 w-5 text-primary" />
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
                  <Input id="email" type="email" placeholder="e.g. j.doe@lagossteel.com" {...register('email')} className="bg-background pl-9 h-10 rounded-xl" />
                </div>
                {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                  Access Password
                </Label>
                <div className="relative">
                  <LockIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input id="password" type="password" placeholder="Min 6 characters..." {...register('password')} className="bg-background pl-9 h-10 rounded-xl" />
                </div>
                {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold text-muted-foreground">
                  System Role Authorization
                </Label>
                <Select
                  defaultValue="APPRENTICE"
                  onValueChange={(val) => setValue('role', (val as 'ADMIN' | 'APPRENTICE') || 'APPRENTICE')}
                >
                  <SelectTrigger className="bg-background h-10 rounded-xl">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPRENTICE">APPRENTICE (Standard Cashier)</SelectItem>
                    <SelectItem value="ADMIN">ADMIN (Full Operations Bypass)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter className="border-t border-border pt-4 gap-2">
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)} className="rounded-xl h-10 text-xs px-4">
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-[#10B981] hover:bg-[#059669] text-white rounded-xl h-10 text-xs px-5 shadow-premium font-semibold">
                {createMutation.isPending ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
