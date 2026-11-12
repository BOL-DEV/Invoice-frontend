'use client';

import React, { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { User as AuthUser } from '../../../types/api';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useUpdateProfile } from '../../users/hooks/useUsers';
import { updateProfileSchema, UpdateProfileInput } from '../../users/schemas';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Badge } from '../../../components/ui/badge';
import {
  User,
  Lock,
  Key,
  X,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  ShieldCheck,
  Save,
  Loader2,
  PenTool,
  Upload,
  Trash2,
  RotateCcw,
} from 'lucide-react';
import { getErrorMessage } from '../../../lib/api-error';

interface UserProfileSettingsProps {
  user: AuthUser;
  onUserUpdated?: (updated: AuthUser) => void;
}

export function UserProfileSettings({ user, onUserUpdated }: UserProfileSettingsProps) {
  const { updateCurrentUser } = useAuth();
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  // Digital Signature States
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigFileInputRef = useRef<HTMLInputElement>(null);
  const [signaturePreview, setSignaturePreview] = useState<string | null>(user?.signature || null);
  const [signatureRemoved, setSignatureRemoved] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnOnCanvas, setHasDrawnOnCanvas] = useState(false);
  const [sigInputMode, setSigInputMode] = useState<'draw' | 'upload'>('draw');

  const updateProfileMutation = useUpdateProfile();

  const {
    register: registerProfile,
    handleSubmit: handleProfileSubmit,
    formState: { errors: profileErrors, isSubmitting: isProfileSubmitting },
    reset: resetProfile,
    setValue: setValueProfile,
  } = useForm<UpdateProfileInput>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      firstName: user?.firstName || '',
      lastName: user?.lastName || '',
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    },
  });

  useEffect(() => {
    if (user) {
      resetProfile({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      if (user.signature) {
        setSignaturePreview(user.signature);
      }
    }
  }, [user?.firstName, user?.lastName, user?.signature, resetProfile]);

  const getCanvasCoordinates = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoordinates(e);
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = '#0f172a';
    setIsDrawing(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const { x, y } = getCanvasCoordinates(e);
    ctx.lineTo(x, y);
    ctx.stroke();
    setHasDrawnOnCanvas(true);
  };

  const stopDrawing = () => {
    if (!isDrawing) return;
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas && hasDrawnOnCanvas) {
      const dataUrl = canvas.toDataURL('image/png');
      setSignaturePreview(dataUrl);
      setSignatureRemoved(false);
    }
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnOnCanvas(false);
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      setProfileError('Signature image must be under 2MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setSignaturePreview(base64);
      setSignatureRemoved(false);
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveSignature = () => {
    setSignaturePreview(null);
    setSignatureRemoved(true);
    clearCanvas();
    if (sigFileInputRef.current) {
      sigFileInputRef.current.value = '';
    }
  };

  const onProfileSubmit = async (data: UpdateProfileInput) => {
    setProfileSuccess(null);
    setProfileError(null);

    const payload: {
      firstName: string;
      lastName: string;
      signature?: string | null;
      currentPassword?: string;
      newPassword?: string;
    } = {
      firstName: data.firstName.trim(),
      lastName: data.lastName.trim(),
    };

    if (signaturePreview && !signatureRemoved) {
      payload.signature = signaturePreview;
    } else if (signatureRemoved) {
      payload.signature = null;
    }

    if (isChangingPassword && data.newPassword && data.newPassword.trim().length > 0) {
      payload.currentPassword = data.currentPassword;
      payload.newPassword = data.newPassword;
    }

    try {
      const res = await updateProfileMutation.mutateAsync(payload);
      setProfileSuccess('Profile details updated successfully.');
      setIsChangingPassword(false);
      resetProfile({
        firstName: res.firstName || data.firstName,
        lastName: res.lastName || data.lastName,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      updateCurrentUser(res);
      if (onUserUpdated) {
        onUserUpdated(res);
      }
    } catch (err: any) {
      setProfileError(getErrorMessage(err, 'Failed to update personal profile.'));
    }
  };

  return (
    <Card className="border-border/80 bg-card shadow-premium rounded-2xl overflow-hidden">
      <CardHeader className="p-4 sm:p-6 border-b border-border/80 bg-slate-50/50 dark:bg-slate-900/30">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-500">
            <User className="h-5 w-5" />
          </div>
          <div>
            <CardTitle className="text-sm sm:text-base font-bold text-foreground">
              Personal Information & Security
            </CardTitle>
            <CardDescription className="text-xs">
              Update your identity details and change account login password.
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <form
        onSubmit={handleProfileSubmit(
          onProfileSubmit,
          (errors) => {
            const firstError = Object.values(errors)[0];
            if (firstError?.message) {
              setProfileError(String(firstError.message));
            }
          }
        )}
      >
        <CardContent className="p-4 sm:p-6 space-y-5">
          {/* Status feedback alerts */}
          {profileError && (
            <div className="flex items-center space-x-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{profileError}</span>
            </div>
          )}

          {profileSuccess && (
            <div className="flex items-center space-x-2 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 p-3 rounded-xl">
              <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
              <span>{profileSuccess}</span>
            </div>
          )}

          {/* Account Overview Pill */}
          <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 dark:bg-slate-900/50 border border-border/70 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-0.5">
              <span className="text-[10px] uppercase font-mono tracking-wider text-muted-foreground">
                Registered Email
              </span>
              <p className="text-xs font-semibold text-foreground font-mono break-all">{user.email}</p>
            </div>
            <div className="flex items-center space-x-2 pt-1 sm:pt-0">
              <Badge
                className={
                  user.role === 'ADMIN'
                    ? user.branchId
                      ? 'bg-blue-500/10 text-blue-500 border-blue-500/20 font-mono text-[10px] font-bold'
                      : 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20 font-mono text-[10px] font-bold'
                    : 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20 font-mono text-[10px] font-bold'
                }
              >
                {user.role === 'ADMIN'
                  ? user.branchId
                    ? 'Branch Manager (Sub-Admin)'
                    : 'Main Administrator'
                  : 'Cashier (Apprentice)'}
              </Badge>
              <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400 flex items-center space-x-1">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Active</span>
              </span>
            </div>
          </div>

          {/* Name Details */}
          <div className="space-y-3 pt-1">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
              <span>Name Identification</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
              <div className="space-y-1.5">
                <Label htmlFor="settings-firstName" className="text-xs font-semibold text-muted-foreground">
                  First Name
                </Label>
                <Input
                  id="settings-firstName"
                  {...registerProfile('firstName')}
                  className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                />
                {profileErrors.firstName && <p className="text-[11px] text-rose-500">{profileErrors.firstName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="settings-lastName" className="text-xs font-semibold text-muted-foreground">
                  Last Name
                </Label>
                <Input
                  id="settings-lastName"
                  {...registerProfile('lastName')}
                  className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                />
                {profileErrors.lastName && <p className="text-[11px] text-rose-500">{profileErrors.lastName.message}</p>}
              </div>
            </div>
          </div>

          {/* User Digital Signature Section */}
          <div className="space-y-3.5 pt-4 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <PenTool className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Authorized Cashier Signature</span>
                  <Badge variant="outline" className="text-[9px] border-emerald-500/30 text-emerald-600 bg-emerald-500/5">
                    Printed on Invoices
                  </Badge>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Your signature appears automatically in the authorized issuer block of every invoice you create.
                </p>
              </div>

              {/* Mode switch */}
              <div className="flex items-center gap-1.5 bg-muted/40 p-1 rounded-xl border border-border/60 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={() => setSigInputMode('draw')}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    sigInputMode === 'draw'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Draw Pad
                </button>
                <button
                  type="button"
                  onClick={() => setSigInputMode('upload')}
                  className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg transition-colors ${
                    sigInputMode === 'upload'
                      ? 'bg-background text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  Upload File
                </button>
              </div>
            </div>

            {/* Current Active Signature Preview if any */}
            {(signaturePreview && !signatureRemoved) ? (
              <div className="p-4 rounded-2xl bg-secondary/30 border border-border/80 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="h-16 w-36 bg-white dark:bg-slate-900 border border-border/80 rounded-xl p-1 flex items-center justify-center overflow-hidden shadow-inner">
                    <img
                      src={signaturePreview}
                      alt="Active signature"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground block">Active Signature Saved</span>
                    <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-medium block">
                      Ready & attached to all your invoices
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleRemoveSignature}
                    className="h-8 rounded-xl text-xs text-rose-500 hover:bg-rose-500/10 hover:text-rose-600 cursor-pointer"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1" />
                    Remove Signature
                  </Button>
                </div>
              </div>
            ) : null}

            {/* Drawing Canvas Mode */}
            {sigInputMode === 'draw' && (
              <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-border">
                <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                  <span className="font-medium">Sign inside the box using mouse, stylus, or fingertip:</span>
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="flex items-center gap-1 text-muted-foreground hover:text-rose-500 text-[11px] font-semibold transition-colors"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear Pad</span>
                  </button>
                </div>
                <div className="bg-white rounded-xl border-2 border-dashed border-emerald-500/30 overflow-hidden touch-none shadow-sm flex justify-center">
                  <canvas
                    ref={canvasRef}
                    width={450}
                    height={130}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full max-w-[450px] h-[130px] cursor-crosshair bg-white"
                  />
                </div>
                <div className="flex justify-between items-center text-[10px] text-muted-foreground">
                  <span>Releasing your stroke auto-captures the signature.</span>
                  {hasDrawnOnCanvas && (
                    <span className="text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" /> Captured
                    </span>
                  )}
                </div>
              </div>
            )}

            {/* Upload File Mode */}
            {sigInputMode === 'upload' && (
              <div className="p-4 rounded-2xl bg-slate-50/70 dark:bg-slate-900/40 border border-border flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-foreground block">Upload Signature Image</span>
                  <p className="text-[11px] text-muted-foreground">
                    Upload a high-contrast PNG or JPG of your signature (transparent PNG recommended, max 2MB).
                  </p>
                </div>
                <div>
                  <input
                    type="file"
                    ref={sigFileInputRef}
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleSigUpload}
                    className="hidden"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => sigFileInputRef.current?.click()}
                    className="h-8 rounded-xl text-xs font-semibold border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/10 cursor-pointer"
                  >
                    <Upload className="h-3.5 w-3.5 mr-1.5" />
                    Choose Image File
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Security & Password Change */}
          <div className="space-y-3.5 pt-4 border-t border-border/70">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center space-x-1.5">
                  <Lock className="h-3.5 w-3.5 text-emerald-500" />
                  <span>Security & Password</span>
                </h4>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  {isChangingPassword
                    ? 'Enter your current password and choose a secure new password.'
                    : 'Update your account sign-in password anytime.'}
                </p>
              </div>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  if (isChangingPassword) {
                    setValueProfile('currentPassword', '');
                    setValueProfile('newPassword', '');
                    setValueProfile('confirmPassword', '');
                  }
                  setIsChangingPassword((prev) => !prev);
                }}
                className="h-8 rounded-xl text-xs font-semibold px-3 border-border hover:bg-secondary cursor-pointer shrink-0 self-start sm:self-auto"
              >
                {isChangingPassword ? (
                  <>
                    <X className="h-3.5 w-3.5 mr-1" />
                    <span>Cancel Password Change</span>
                  </>
                ) : (
                  <>
                    <Key className="h-3.5 w-3.5 mr-1 text-emerald-500" />
                    <span>Change Password</span>
                  </>
                )}
              </Button>
            </div>

            {isChangingPassword && (
              <div className="space-y-3.5 pt-1 animate-in fade-in slide-in-from-top-1 duration-200">
                {/* Current Password */}
                <div className="space-y-1.5">
                  <Label htmlFor="settings-currentPassword" className="text-xs font-semibold text-muted-foreground">
                    Current Password
                  </Label>
                  <div className="relative">
                    <Input
                      id="settings-currentPassword"
                      type={showCurrentPassword ? 'text' : 'password'}
                      placeholder="Required to set a new password"
                      {...registerProfile('currentPassword')}
                      className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs pr-10"
                    />
                    <button
                      type="button"
                      tabIndex={-1}
                      onClick={() => setShowCurrentPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                    >
                      {showCurrentPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                    </button>
                  </div>
                  {profileErrors.currentPassword && <p className="text-[11px] text-rose-500">{profileErrors.currentPassword.message}</p>}
                </div>

                {/* New Password & Confirm Password */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 sm:gap-4">
                  <div className="space-y-1.5">
                    <Label htmlFor="settings-newPassword" className="text-xs font-semibold text-muted-foreground">
                      New Password
                    </Label>
                    <div className="relative">
                      <Input
                        id="settings-newPassword"
                        type={showNewPassword ? 'text' : 'password'}
                        placeholder="Minimum 6 characters"
                        {...registerProfile('newPassword')}
                        className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs pr-10"
                      />
                      <button
                        type="button"
                        tabIndex={-1}
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                    {profileErrors.newPassword && <p className="text-[11px] text-rose-500">{profileErrors.newPassword.message}</p>}
                  </div>

                  <div className="space-y-1.5">
                    <Label htmlFor="settings-confirmPassword" className="text-xs font-semibold text-muted-foreground">
                      Confirm New Password
                    </Label>
                    <Input
                      id="settings-confirmPassword"
                      type={showNewPassword ? 'text' : 'password'}
                      placeholder="Repeat new password"
                      {...registerProfile('confirmPassword')}
                      className="bg-background border-border/80 focus:border-emerald-500/60 h-10 rounded-xl text-xs"
                    />
                    {profileErrors.confirmPassword && <p className="text-[11px] text-rose-500">{profileErrors.confirmPassword.message}</p>}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>

        <CardFooter className="p-4 sm:p-6 border-t border-border/80 bg-slate-50/50 dark:bg-slate-900/30 flex justify-end">
          <Button
            type="submit"
            disabled={isProfileSubmitting || updateProfileMutation.isPending}
            className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl h-10 px-6 text-xs font-semibold cursor-pointer shadow-lg shadow-emerald-500/20 flex items-center justify-center space-x-2"
          >
            {isProfileSubmitting || updateProfileMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                <span>Save Profile Changes</span>
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}

