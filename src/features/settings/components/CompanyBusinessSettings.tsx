'use client';

import React, { useRef, useState } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { useBusinessSettings, useUpdateBusinessSettings } from '../../business/hooks/useBusinessSettings';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  Building2,
  Mail,
  Phone,
  Percent,
  MapPin,
  FileCode,
  Hash,
  Tag,
  FileText,
  Upload,
  Trash2,
  Download,
  Save,
  Loader2,
} from 'lucide-react';
import { BusinessSettings } from '../../../types/api';
import { useModal } from '../../../components/ui/modal-provider';
import { apiClient } from '../../../services/api/axios';
import { API_ENDPOINTS } from '../../../services/api/endpoints';

export function CompanyBusinessSettings() {
  const modal = useModal();
  const logoFileInputRef = useRef<HTMLInputElement>(null);
  const stampFileInputRef = useRef<HTMLInputElement>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [stampPreview, setStampPreview] = useState<string | null>(null);
  const [stampRemoved, setStampRemoved] = useState(false);
  const [isDownloadingSamplePdf, setIsDownloadingSamplePdf] = useState(false);

  const { data: settings, isLoading: isSettingsLoading, isError: isSettingsError, refetch: refetchSettings } = useBusinessSettings();
  const updateSettingsMutation = useUpdateBusinessSettings(settings?.id || '');

  const {
    register: registerBusiness,
    handleSubmit: handleBusinessSubmit,
    formState: { isSubmitting: isBusinessSubmitting },
    reset: resetBusiness,
  } = useForm<BusinessSettings>({
    values: settings,
  });

  const rawLogo = settings?.logo;
  const hasCustomLogo = Boolean(
    rawLogo &&
    typeof rawLogo === 'string' &&
    (rawLogo.startsWith('/') || rawLogo.startsWith('http://') || rawLogo.startsWith('https://') || rawLogo.startsWith('data:image/')) &&
    !rawLogo.startsWith('{')
  );

  const businessInitials = (settings?.businessName || 'BI')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w: string) => w[0]?.toUpperCase())
    .join('') || 'BI';

  const isLaoSteelBespoke = settings?.receiptTemplateId === 'lao_steel_voucher' || settings?.receiptTemplateId === 'lao_steel_modern';

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      modal.alert('File Too Large', 'Please upload an image smaller than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setLogoPreview(base64);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = '';
    }
  };

  const handleStampUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      modal.alert('File Too Large', 'Please upload a stamp image smaller than 2MB.', 'error');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setStampPreview(base64);
      setStampRemoved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveStamp = () => {
    setStampPreview(null);
    setStampRemoved(true);
    if (stampFileInputRef.current) {
      stampFileInputRef.current.value = '';
    }
  };

  const handleDownloadSamplePdf = async () => {
    setIsDownloadingSamplePdf(true);
    try {
      const response = await apiClient.post(
        API_ENDPOINTS.PRINTING.TEST_PDF,
        {
          templateId: settings?.receiptTemplateId || 'classic',
          businessId: settings?.id,
        },
        { responseType: 'blob' }
      );

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Invoice_Sample_${settings?.receiptTemplateId || 'classic'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch {
      modal.alert('Sample Download Failed', 'Could not render sample PDF for current template.', 'error');
    } finally {
      setIsDownloadingSamplePdf(false);
    }
  };

  const onBusinessSubmit = async (data: BusinessSettings) => {
    try {
      const payload: Partial<BusinessSettings> = {
        businessName: data.businessName,
        email: data.email,
        phone: data.phone,
        address: data.address,
        tagline: data.tagline,
        cacOrRegNumber: data.cacOrRegNumber,
        tin: data.tin,
        receiptPrefix: data.receiptPrefix,
        defaultVatPercentage: Number(data.defaultVatPercentage) || 0,
        defaultWhtPercentage: Number(data.defaultWhtPercentage) || 0,
      };

      if (logoPreview) {
        payload.logo = logoPreview;
      }

      if (stampPreview) {
        payload.stamp = stampPreview;
      } else if (stampRemoved) {
        payload.stamp = null;
      }

      await updateSettingsMutation.mutateAsync(payload);
      modal.alert('Settings Saved', 'Company configurations updated successfully.', 'success');
      refetchSettings();
    } catch {
      modal.alert('Update Failed', 'Failed to update company settings. Please check your network and try again.', 'error');
    }
  };

  if (isSettingsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-16">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500 mb-2" />
        <p className="text-xs text-muted-foreground">Loading configurations...</p>
      </div>
    );
  }

  if (isSettingsError || !settings) {
    return (
      <div className="bg-rose-500/10 border border-rose-500/20 text-rose-500 p-6 rounded-2xl text-center max-w-md mx-auto my-8 space-y-3">
        <p className="font-semibold text-xs">Failed to fetch company profile settings.</p>
        <Button onClick={() => refetchSettings()} variant="outline" className="border-rose-500/25 hover:bg-rose-500/5 text-rose-600 rounded-xl text-xs px-4 h-9">
          Retry Connection
        </Button>
      </div>
    );
  }

  return (
    <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
      <form onSubmit={handleBusinessSubmit(onBusinessSubmit)}>
        <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-white dark:bg-slate-900 border border-border p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              {(logoPreview || hasCustomLogo) ? (
                <Image src={logoPreview || (rawLogo as string)} alt={settings.businessName || 'Company Logo'} width={32} height={32} className="w-8 h-8 object-contain" />
              ) : (
                <div className="h-full w-full rounded-lg bg-emerald-600 dark:bg-emerald-500 text-white font-bold font-heading text-xs flex items-center justify-center">
                  {businessInitials}
                </div>
              )}
            </div>
            <div>
              <CardTitle className="text-sm sm:text-base font-bold text-foreground">
                {settings.businessName || 'Company Profile'}
              </CardTitle>
              <CardDescription className="text-xs">
                Default invoice branding, contact coordinates, and tax rates configuration.
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Brand Logo Upload Section */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 border border-border p-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group">
                {(logoPreview || hasCustomLogo) ? (
                  <Image
                    src={logoPreview || (rawLogo as string)}
                    alt={settings.businessName || 'Company Logo'}
                    width={56}
                    height={56}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="h-full w-full rounded-xl bg-emerald-600 dark:bg-emerald-500 text-white font-bold font-heading text-lg flex items-center justify-center">
                    {businessInitials}
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Brand Logo</h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Appears across invoice headers, customer receipts, and official exports.
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                  Recommended: Transparent PNG, SVG, or WebP (max 2MB)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
              <input
                type="file"
                ref={logoFileInputRef}
                accept="image/png,image/jpeg,image/svg+xml,image/webp"
                onChange={handleLogoUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => logoFileInputRef.current?.click()}
                className="h-8 rounded-xl text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Logo
              </Button>
              {logoPreview && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveLogo}
                  className="h-8 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Official Company Stamp Section */}
          <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center space-x-4">
              <div className="relative h-16 w-16 rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-emerald-500/40 p-2 flex items-center justify-center shrink-0 shadow-sm overflow-hidden group">
                {(stampPreview || (settings?.stamp && !stampRemoved)) ? (
                  <Image
                    src={stampPreview || (settings.stamp as string)}
                    alt="Official Company Stamp"
                    width={56}
                    height={56}
                    className="w-full h-full object-contain rotate-[-6deg]"
                  />
                ) : (
                  <div className="h-full w-full rounded-xl border border-dashed border-muted-foreground/30 text-muted-foreground text-[10px] flex items-center justify-center text-center font-mono p-1">
                    No Stamp
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <span>Official Business Stamp</span>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                    Printable
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Official seal attached across all issued invoices and receipts.
                </p>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-mono mt-0.5 block">
                  Recommended: Circular/oval transparent PNG stamp (max 2MB)
                </span>
              </div>
            </div>

            <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
              <input
                type="file"
                ref={stampFileInputRef}
                accept="image/png,image/jpeg,image/webp"
                onChange={handleStampUpload}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => stampFileInputRef.current?.click()}
                className="h-8 rounded-xl text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
              >
                <Upload className="h-3.5 w-3.5 mr-1.5" />
                Upload Stamp
              </Button>
              {(stampPreview || (settings?.stamp && !stampRemoved)) && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleRemoveStamp}
                  className="h-8 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                >
                  <Trash2 className="h-3.5 w-3.5 mr-1" />
                  Remove
                </Button>
              )}
            </div>
          </div>

          {/* Business Name & Email */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="businessName" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                <Building2 className="h-3 w-3 text-emerald-500" />
                <span>Registered Business Name</span>
              </Label>
              <Input
                id="businessName"
                {...registerBusiness('businessName', { required: true })}
                className="bg-background border-border/80 focus:border-emerald-500/60 font-medium h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                <Mail className="h-3 w-3 text-emerald-500" />
                <span>Billing Email Address</span>
              </Label>
              <Input
                id="email"
                type="email"
                {...registerBusiness('email', { required: true })}
                className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Business Tagline */}
          <div className="space-y-1.5">
            <Label htmlFor="tagline" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
              <Tag className="h-3 w-3 text-emerald-500" />
              <span>Business Tagline / Subtitle</span>
            </Label>
            <Input
              id="tagline"
              placeholder="e.g. Industrial & Building Materials Suppliers"
              {...registerBusiness('tagline')}
              className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
            />
          </div>

          {/* Phone & Tax Rates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="space-y-1.5 sm:col-span-1">
              <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                <Phone className="h-3 w-3 text-emerald-500" />
                <span>Contact Phone(s)</span>
              </Label>
              <Input
                id="phone"
                placeholder="e.g. 08030000000, 08050000000"
                {...registerBusiness('phone', { required: true })}
                className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
              />
              <p className="text-[10px] text-muted-foreground">
                Separate multiple numbers with commas
              </p>
            </div>

            <div className="sm:col-span-2 grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="defaultVatPercentage" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1">
                  <Percent className="h-3 w-3 text-emerald-500" />
                  <span>VAT Rate (%)</span>
                </Label>
                <Input
                  id="defaultVatPercentage"
                  type="number"
                  step="0.01"
                  {...registerBusiness('defaultVatPercentage', { required: true })}
                  className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="defaultWhtPercentage" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1">
                  <Percent className="h-3 w-3 text-emerald-500" />
                  <span>WHT Rate (%)</span>
                </Label>
                <Input
                  id="defaultWhtPercentage"
                  type="number"
                  step="0.01"
                  {...registerBusiness('defaultWhtPercentage', { required: true })}
                  className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
                />
              </div>
            </div>
          </div>

          {/* Physical Address */}
          <div className="space-y-1.5">
            <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
              <MapPin className="h-3 w-3 text-emerald-500" />
              <span>Physical Office Address</span>
            </Label>
            <Input
              id="address"
              placeholder="e.g. 12 Industrial Avenue, Ikeja, Lagos"
              {...registerBusiness('address', { required: true })}
              className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
            />
          </div>

          {/* Prefix, Reg No, TIN */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="receiptPrefix" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                <FileCode className="h-3 w-3 text-emerald-500" />
                <span>Default Receipt Prefix</span>
              </Label>
              <Input
                id="receiptPrefix"
                placeholder="e.g. INV"
                {...registerBusiness('receiptPrefix', { required: true })}
                className="bg-background border-border/80 focus:border-emerald-500/60 font-mono uppercase h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="cacOrRegNumber" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                <Hash className="h-3 w-3 text-emerald-500" />
                <span>Registration / CAC No.</span>
              </Label>
              <Input
                id="cacOrRegNumber"
                placeholder="e.g. RC-123456 or BN-123456"
                {...registerBusiness('cacOrRegNumber')}
                className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="tin" className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
                <Hash className="h-3 w-3 text-emerald-500" />
                <span>Tax ID Number (TIN)</span>
              </Label>
              <Input
                id="tin"
                placeholder="e.g. 12345678-0001"
                {...registerBusiness('tin')}
                className="bg-background border-border/80 focus:border-emerald-500/60 font-mono h-10 rounded-xl text-xs"
              />
            </div>
          </div>

          {/* Template Layout Card */}
          <div className="space-y-2 pt-2 border-t border-border/60">
            <Label className="text-xs font-semibold text-muted-foreground flex items-center space-x-1.5">
              <FileText className="h-3.5 w-3.5 text-emerald-500" />
              <span>Printable Invoice & Receipt Template</span>
            </Label>
            <div className="p-4 sm:p-5 rounded-2xl border border-border/80 bg-gradient-to-br from-secondary/20 via-background to-secondary/10 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <h4 className="text-sm font-bold text-foreground">
                      {isLaoSteelBespoke
                        ? 'Lao Steel Bespoke Trade Layout'
                        : 'Modern Corporate Executive Layout'}
                    </h4>
                    <Badge className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold">
                      {isLaoSteelBespoke ? 'Lao Steel Bespoke' : 'Standard Active'}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed max-w-xl">
                    {isLaoSteelBespoke
                      ? 'Authentic industrial trade styling with watermark, dual company borders, and guarantee terms.'
                      : 'Corporate executive layout with clean typography and itemized charges.'}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSamplePdf}
                  disabled={isDownloadingSamplePdf}
                  className="h-8 px-3 text-xs font-semibold rounded-xl border-border/80 hover:bg-secondary/50 flex items-center space-x-1.5 cursor-pointer shrink-0 self-start sm:self-auto"
                >
                  {isDownloadingSamplePdf ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin text-emerald-500" />
                  ) : (
                    <Download className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  <span>Download Sample PDF</span>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-6 border-t border-border/80 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end">
          <Button
            type="submit"
            disabled={isBusinessSubmitting}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-6 text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            {isBusinessSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Configurations</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

