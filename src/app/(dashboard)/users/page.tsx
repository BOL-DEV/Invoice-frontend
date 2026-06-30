'use client';

import React, { useState } from 'react';
import { useUsersList, useCreateUser, useDeleteUser } from '../../../features/users/hooks/useUsers';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createUserSchema, CreateUserInput } from '../../../features/users/schemas';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../../components/ui/table';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../../../components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Plus, Trash2, ShieldAlert, UserCheck, Loader2 } from 'lucide-react';
import { AxiosErrorLike } from '../../../types/api';

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
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Only Administrators are authorized to view or manage cashier credentials.
        </p>
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
    <div className="space-y-6">
      {/* Header controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Cashier Management</h2>
          <p className="text-sm text-muted-foreground">
            Configure system cashiers and administrator access key accounts.
          </p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="font-semibold space-x-2">
          <Plus className="h-4 w-4" />
          <span>Add Cashier</span>
        </Button>
      </div>

      {/* Users table */}
      <Card className="border-border bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-secondary/40">
              <TableHead className="font-semibold">Full Name</TableHead>
              <TableHead className="font-semibold">Email Address</TableHead>
              <TableHead className="font-semibold">Role</TableHead>
              <TableHead className="font-semibold">Date Registered</TableHead>
              <TableHead className="w-24 font-semibold text-center">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              [1, 2, 3].map((i) => (
                <TableRow key={i}>
                  <TableCell><div className="h-4 w-32 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-40 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-6 w-16 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-4 w-24 bg-muted animate-pulse rounded" /></TableCell>
                  <TableCell><div className="h-8 w-8 bg-muted animate-pulse rounded-full mx-auto" /></TableCell>
                </TableRow>
              ))
            ) : isError || !users ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center p-6 text-rose-500 font-medium">
                  Failed to fetch user accounts.
                </TableCell>
              </TableRow>
            ) : (
              users.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-bold text-foreground">
                    {item.firstName} {item.lastName}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{item.email}</TableCell>
                  <TableCell>
                    <Badge className={item.role === 'ADMIN' ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 hover:bg-blue-500/10 font-mono text-xs' : 'bg-zinc-800 text-zinc-300 border-zinc-700/50 hover:bg-zinc-800 font-mono text-xs'}>
                      {item.role}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground font-mono">
                    {new Date(item.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-center">
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => handleDelete(item.id, item.email)}
                      className="h-8 w-8 text-muted-foreground hover:text-rose-500 hover:bg-rose-500/10"
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
        <DialogContent className="bg-card border-border">
          <form onSubmit={handleSubmit(onSubmit)}>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <UserCheck className="h-5 w-5" />
                <span>Create New Cashier</span>
              </DialogTitle>
              <DialogDescription>
                Assign credential access keys to register cashier ledger entries.
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-4">
              {errorMsg && (
                <div className="flex items-center space-x-2 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="firstName" className="text-xs font-semibold">
                    First Name
                  </Label>
                  <Input id="firstName" {...register('firstName')} className="bg-background" />
                  {errors.firstName && <p className="text-xs text-rose-500">{errors.firstName.message}</p>}
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="lastName" className="text-xs font-semibold">
                    Last Name
                  </Label>
                  <Input id="lastName" {...register('lastName')} className="bg-background" />
                  {errors.lastName && <p className="text-xs text-rose-500">{errors.lastName.message}</p>}
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Email Address
                </Label>
                <Input id="email" type="email" placeholder="e.g. j.doe@lagossteel.com" {...register('email')} className="bg-background" />
                {errors.email && <p className="text-xs text-rose-500">{errors.email.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold">
                  Access Password
                </Label>
                <Input id="password" type="password" placeholder="Min 6 characters..." {...register('password')} className="bg-background" />
                {errors.password && <p className="text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="role" className="text-xs font-semibold">
                  System Role Authorization
                </Label>
                <Select
                  defaultValue="APPRENTICE"
                  onValueChange={(val) => setValue('role', (val as 'ADMIN' | 'APPRENTICE') || 'APPRENTICE')}
                >
                  <SelectTrigger className="bg-background">
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="APPRENTICE">APPRENTICE (Standard Cashier)</SelectItem>
                    <SelectItem value="ADMIN">ADMIN (Full Operations Bypass)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createMutation.isPending} className="bg-primary text-primary-foreground">
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
