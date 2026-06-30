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
import { Building2, ShieldAlert } from 'lucide-react';
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
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md space-y-4">
        {/* Header Logo */}
        <div className="flex flex-col items-center space-y-2 text-center">
          <div className="bg-zinc-900 border border-zinc-800 text-white p-3 rounded-2xl shadow-lg">
            <Building2 className="h-8 w-8" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-white tracking-wider uppercase">Lagos Iron & Steel</h1>
            <p className="text-sm text-zinc-400">Billing & Invoices Management Terminal</p>
          </div>
        </div>

        {/* Login form Card */}
        <Card className="bg-zinc-900 border-zinc-800 shadow-2xl">
          <CardHeader>
            <CardTitle className="text-white text-lg">Cashier Sign In</CardTitle>
            <CardDescription className="text-zinc-400">
              Enter your credential details to open your billing session.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {errorMsg && (
                <div className="flex items-center space-x-2 text-sm text-rose-500 bg-rose-500/10 border border-rose-500/20 p-3 rounded-lg">
                  <ShieldAlert className="h-5 w-5 shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <Label htmlFor="email" className="text-zinc-300">
                  Email Address
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="cashier@lagossteel.com"
                  {...register('email')}
                  className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-700"
                />
                {errors.email && (
                  <p className="text-xs text-rose-500 font-medium">{errors.email.message}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="password" className="text-zinc-300">
                  Access Key Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  {...register('password')}
                  className="bg-zinc-950 border-zinc-800 text-white placeholder-zinc-600 focus:border-zinc-700"
                />
                {errors.password && (
                  <p className="text-xs text-rose-500 font-medium">{errors.password.message}</p>
                )}
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-white hover:bg-zinc-200 text-zinc-950 font-bold transition-all duration-200 mt-2 py-6"
              >
                {isSubmitting ? 'Verifying Session...' : 'Open Session'}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="justify-center border-t border-zinc-800/50 pt-4">
            <span className="text-xs text-zinc-500 font-mono uppercase tracking-wider select-none">
              Secured Session Gateway
            </span>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
