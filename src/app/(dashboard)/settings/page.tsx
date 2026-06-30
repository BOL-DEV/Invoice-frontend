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
import { BusinessSettings, AxiosErrorLike } from '../../../types/api';

export default function SettingsPage() {
  const { isAdmin } = usePermission();
  const { data: settings, isLoading, isError, refetch } = useBusinessSettings();
  const updateMutation = useUpdateBusinessSettings(settings?.id || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<Partial<BusinessSettings>>({
    defaultValues: {
      businessName: '',
      address: '',
      phone: '',
      email: '',
      receiptPrefix: '',
      defaultVatPercentage: 7.5,
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
      });
    }
  }, [settings, reset]);

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <ShieldAlert className="h-12 w-12 text-rose-500 mb-4" />
        <h3 className="text-lg font-bold text-foreground">Access Denied</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Only Administrators are authorized to view or manage company billing profile settings.
        </p>
      </div>
    );
  }

  const onSubmit = async (data: Partial<BusinessSettings>) => {
    setIsSubmitting(true);
    try {
      // Ensure defaultVatPercentage is numeric
      const payload = {
        ...data,
        defaultVatPercentage: Number(data.defaultVatPercentage) || 0,
      };
      await updateMutation.mutateAsync(payload);
      alert('Business configurations saved successfully');
    } catch (err) {
      alert((err as AxiosErrorLike).response?.data?.error?.message || 'Failed to update configurations');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground mb-2" />
        <p className="text-sm text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  if (isError || !settings) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-4 rounded-xl text-center">
        <p className="font-semibold">Failed to fetch company profile settings.</p>
        <Button onClick={() => refetch()} variant="outline" className="border-rose-500/20 hover:bg-rose-500/15 mt-2">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Company Profile Configurations</h2>
          <p className="text-sm text-muted-foreground">
            Configure default billing address, receipt prefixes, and standard VAT percentages.
          </p>
        </div>
      </div>

      <Card className="border-border bg-card shadow-sm">
        <form onSubmit={handleSubmit(onSubmit)}>
          <CardHeader className="flex flex-row items-center space-x-3 space-y-0 border-b border-border py-4">
            <div className="bg-primary text-primary-foreground p-2 rounded-lg">
              <Building2 className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-base text-foreground font-semibold">Lagos Iron & Steel Ltd</CardTitle>
              <CardDescription>Default invoice templates configuration.</CardDescription>
            </div>
          </CardHeader>
          
          <CardContent className="space-y-4 pt-6">
            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="businessName" className="text-xs font-semibold">
                  Registered Business Name
                </Label>
                <Input id="businessName" {...register('businessName', { required: true })} className="bg-background font-medium" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold">
                  Company Billing Email Address
                </Label>
                <Input id="email" type="email" {...register('email', { required: true })} className="bg-background" />
              </div>
            </div>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="phone" className="text-xs font-semibold">
                  Contact Phone Number
                </Label>
                <Input id="phone" {...register('phone', { required: true })} className="bg-background" />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="defaultVatPercentage" className="text-xs font-semibold">
                  Standard VAT Rate (%)
                </Label>
                <Input id="defaultVatPercentage" type="number" step="0.1" {...register('defaultVatPercentage', { required: true })} className="bg-background font-mono" />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="address" className="text-xs font-semibold">
                Physical Office Address
              </Label>
              <Input id="address" {...register('address', { required: true })} className="bg-background" />
            </div>

            <div className="w-1/2 space-y-1.5">
              <Label htmlFor="receiptPrefix" className="text-xs font-semibold">
                Default Receipt Prefix
              </Label>
              <Input id="receiptPrefix" {...register('receiptPrefix', { required: true })} className="bg-background font-mono uppercase" />
            </div>
          </CardContent>

          <CardFooter className="border-t border-border pt-4 justify-end">
            <Button type="submit" disabled={isSubmitting} className="font-semibold space-x-1.5">
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
