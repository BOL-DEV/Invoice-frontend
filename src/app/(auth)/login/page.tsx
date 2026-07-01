'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, LoginInput } from '../../../features/auth/schemas';
import { useAuth } from '../../../features/auth/context/AuthContext';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardHeader, CardContent, CardTitle, CardDescription, CardFooter } from '../../../components/ui/card';
import { Building2, ShieldAlert, Loader2, Mail, Lock } from 'lucide-react';
import { AxiosErrorLike } from '../../../types/api';

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginInput) => {
    setIsSubmitting(true);
    setErrorMsg(null);
    try {
      await login(data);
      // Retrieve role to determine redirection path
      const savedUser = localStorage.getItem('user_details');
      if (savedUser) {
        const userObj = JSON.parse(savedUser);
        if (userObj.role === 'ADMIN') {
          router.push('/');
        } else {
          router.push('/invoices');
        }
      } else {
        router.push('/invoices');
      }
    } catch (err) {
      console.error(err);
      const serverMsg = (err as AxiosErrorLike).response?.data?.error?.message || 'Invalid email or password';
      setErrorMsg(serverMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#020617] flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-[420px] space-y-6">
        {/* Header Logo */}
        <div className="flex flex-col items-center space-y-3 text-center">
          <div className="bg-[#10B981] text-white p-3 rounded-2xl shadow-premium">
            <Building2 className="h-7 w-7" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-[#0F172A] dark:text-[#F8FAFC] tracking-tight font-heading">Lao Steel Ventures</h1>
            <p className="text-xs text-muted-foreground mt-0.5">Invoice Generator</p>
          </div>
        </div>

        {/* Login form Card */}
        <Card className="bg-card border-border shadow-premium rounded-2xl overflow-hidden">
          <CardHeader className="pb-2">
            <CardTitle className="text-[#0F172A] dark:text-[#F8FAFC] text-base font-bold">Sign In</CardTitle>
            <CardDescription className="text-xs text-muted-foreground mt-1">
              Enter your email and password to access the app.
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-2">
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center space-x-2 text-xs text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3.5 rounded-xl">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground">
                  Email Address
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="cashier@laosteel.com"
                    {...register('email')}
                    className="bg-background pl-9 h-10 rounded-xl border border-border"
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium mt-1">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-xs font-semibold text-muted-foreground">
                  Password
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    {...register('password')}
                    className="bg-background pl-9 h-10 rounded-xl border border-border"
                  />
                </div>
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium mt-1">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#10B981] hover:bg-[#059669] text-white font-bold transition-all duration-200 mt-2 py-5 rounded-xl text-xs shadow-premium flex items-center justify-center space-x-1.5"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Logging in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-border/60 pt-4 bg-slate-50 dark:bg-slate-900/35 pb-4">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider select-none">
              Lao Steel Ventures
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
