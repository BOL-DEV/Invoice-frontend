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
  // Always fallback to standard platform logo if invalid or missing
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
      {/* Standalone Logo with pure natural breathing animation (no background box, no glowing effects) */}
      <div className="relative z-10 flex flex-col items-center space-y-4">
        <div className="animate-logo-breathe flex items-center justify-center">
          <Image
            src={resolvedLogo}
            alt="BOLXolve"
            width={56}
            height={56}
            className="w-14 h-14 object-contain"
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
