'use client';

import React from 'react';
import Image from 'next/image';

interface LoadingScreenProps {
  message?: string;
  logoSrc?: string;
  fullScreen?: boolean;
  className?: string;
}

export function LoadingScreen({
  message,
  logoSrc = '/platform-logo.svg',
  fullScreen = true,
  className = '',
}: LoadingScreenProps) {
  // Graceful fallback for logo image src
  const resolvedLogo =
    logoSrc &&
    typeof logoSrc === 'string' &&
    (logoSrc.startsWith('/') ||
      logoSrc.startsWith('http://') ||
      logoSrc.startsWith('https://') ||
      logoSrc.startsWith('data:image/')) &&
    !logoSrc.startsWith('{')
      ? logoSrc
      : '/platform-logo.svg';

  return (
    <div
      className={`${
        fullScreen ? 'fixed inset-0 min-h-screen w-screen z-50' : 'w-full py-16'
      } flex flex-col items-center justify-center bg-[#0B0F19] text-foreground select-none overflow-hidden ${className}`}
    >
      {/* Ambient background glow */}
      <div className="absolute w-56 h-56 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />

      {/* Breathing Logo Container */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="h-16 w-16 rounded-2xl bg-slate-900/90 border border-emerald-500/25 p-2.5 flex items-center justify-center shadow-2xl shadow-emerald-500/15 animate-logo-breathe">
          <Image
            src={resolvedLogo}
            alt="BOLXolve"
            width={48}
            height={48}
            className="w-10 h-10 object-contain"
            priority
          />
        </div>

        {message && (
          <p className="text-xs font-mono font-medium text-slate-400 tracking-wide animate-pulse">
            {message}
          </p>
        )}
      </div>
    </div>
  );
}

export default LoadingScreen;

