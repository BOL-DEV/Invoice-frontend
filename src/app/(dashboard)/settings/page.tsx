'use client';

import React, { useEffect, useState } from 'react';
import { useBusinessSettings, useUpdateBusinessSettings } from '../../../features/business/hooks/useBusinessSettings';
import { usePermission } from '../../../features/auth/hooks/usePermission';
import { useForm } from 'react-hook-form';
import { Button } from '../../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { ShieldAlert, Loader2, Save, Building2 } from 'lucide-react';
import { useModal } from '../../../components/ui/modal-provider';
import { BusinessSettings, AxiosErrorLike } from '../../../types/api';

export default function SettingsPage() {
  const { isAdmin } = usePermission();
  const modal = useModal();
  const { data: settings, isLoading, isError, refetch } = useBusinessSettings();
  const updateMutation = useUpdateBusinessSettings(settings?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
  } = useForm<Partial<BusinessSettings>>({
    defaultValues: {
      businessName: '',
      address: '',
      phone: '',
      email: '',
      receiptPrefix: '',
      defaultVatPercentage: 7.5,
      defaultWhtPercentage: 2.0,
    },
  });

  // Hydrate settings on query load
  useEffect(() => {
    if (settings) {
      reset({
        businessName: settings.businessName,
        address: settings.address,
        phone: settings.phone,
        email: settings.email,
        receiptPrefix: settings.receiptPrefix,
        defaultVatPercentage: settings.defaultVatPercentage,
        defaultWhtPercentage: settings.defaultWhtPercentage,
      });
    }
  }, [settings, reset]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto space-y-3">
        <div className="p-3.5 bg-rose-500/10 text-rose-500 rounded-full">
          <ShieldAlert className="h-10 w-10" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-bold text-foreground font-heading">Access Denied</h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Only Administrators are authorized to view or manage company billing profile settings.
          </p>
        </div>
      </div>
    );
  }

  const onSubmit = async (data: Partial<BusinessSettings>) => {
    setIsSubmitting(true);
    try {
      // Ensure percentages are numeric
      const payload = {
        ...data,
        defaultVatPercentage: Number(data.defaultVatPercentage) || 0,
        defaultWhtPercentage: Number(data.defaultWhtPercentage) || 0,
      };
      await updateMutation.mutateAsync(payload);
      modal.alert('Success', 'Business configurations saved successfully', 'success');
    } catch (err) {
      modal.alert('Update Failed', (err as AxiosErrorLike).response?.data?.error?.message || 'Failed to update configurations', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-2" />
        <p className="text-sm text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-6 rounded-2xl text-center max-w-md mx-auto space-y-3">
        <p className="font-semibold text-sm">Failed to fetch company profile settings.</p>
        <Button onClick={() => refetch()} variant="outline" className="border-rose-500/25 hover:bg-rose-500/5 text-rose-600 rounded-xl text-xs px-4 h-9">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight text-[#0F172A] dark:text-[#F8FAFC] font-heading">Company Profile</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Configure default billing address, receipt prefixes, and standard VAT percentages.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card shadow-premium rounded-2xl overflow-hidden">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="flex flex-row items-center space-x-3.5 space-y-0 border-b border-border py-4 px-6 bg-slate-50 dark:bg-slate-900/35">
            <div className="bg-primary text-white p-2 rounded-xl">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-sm text-foreground font-bold">Lagos Iron & Steel Ltd</CardTitle>
              <CardDescription className="text-xs">Default invoice templates configuration.</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 p-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-xs font-semibold text-muted-foreground">
                  Registered Business Name
                </Label>
                <Input id="businessName" {...register('businessName', { required: true })} className="bg-background font-medium h-10 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                  Company Billing Email Address
                </Label>
                <Input id="email" type="email" {...register('email', { required: true })} className="bg-background h-10 rounded-xl" />
              </div>
            </div>

            <div className="grid sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground">
                  Contact Phone Number
                </Label>
                <Input id="phone" {...register('phone', { required: true })} className="bg-background h-10 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="defaultVatPercentage" className="text-xs font-semibold text-muted-foreground">
                  Standard VAT Rate (%)
                </Label>
                <Input id="defaultVatPercentage" type="number" step="0.01" {...register('defaultVatPercentage', { required: true })} className="bg-background font-mono h-10 rounded-xl" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="defaultWhtPercentage" className="text-xs font-semibold text-muted-foreground">
                  Standard WHT Rate (%)
                </Label>
                <Input id="defaultWhtPercentage" type="number" step="0.01" {...register('defaultWhtPercentage', { required: true })} className="bg-background font-mono h-10 rounded-xl" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground">
                Physical Office Address
              </Label>
              <Input id="address" {...register('address', { required: true })} className="bg-background h-10 rounded-xl" />
            </div>

            <div className="w-1/2 space-y-1.5">
              <Label htmlFor="receiptPrefix" className="text-xs font-semibold text-muted-foreground">
                Default Receipt Prefix
              </Label>
              <Input id="receiptPrefix" {...register('receiptPrefix', { required: true })} className="bg-background font-mono uppercase h-10 rounded-xl" />
            </div>
          </CardContent>

          <CardFooter className="border-t border-border py-4 px-6 justify-end bg-slate-50 dark:bg-slate-900/35">
            <Button type="submit" disabled={isSubmitting} className="font-semibold space-x-1.5 bg-[#10B981] hover:bg-[#059669] text-white rounded-xl h-10 px-5 shadow-premium text-xs">
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              <span>Save Configurations</span>
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
