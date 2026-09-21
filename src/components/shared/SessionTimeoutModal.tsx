'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Clock, ShieldAlert, LogOut, RefreshCw } from 'lucide-react';
import { Button } from '../ui/button';

interface SessionTimeoutModalProps {
  isOpen: boolean;
  secondsRemaining: number;
  onStayLoggedIn: () => void;
  onLogOutNow: () => void;
}

export const SessionTimeoutModal: React.FC<SessionTimeoutModalProps> = ({
  isOpen,
  secondsRemaining,
  onStayLoggedIn,
  onLogOutNow,
}) => {
  if (!isOpen) return null;

  // Percentage for countdown progress indicator
  const progressPercent = (secondsRemaining / 60) * 100;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm"
        />

        {/* Custom Modal Dialog */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-6 md:p-8 space-y-6 text-foreground overflow-hidden"
          role="dialog"
          aria-modal="true"
          aria-labelledby="timeout-modal-title"
        >
          {/* Top subtle progress bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-muted">
            <motion.div
              className="h-full bg-amber-500 transition-all duration-1000 ease-linear"
              style={{ width: `${progressPercent}%` }}
            />
          </div>

          {/* Header & Warning Icon */}
          <div className="flex items-start space-x-4">
            <div className="h-12 w-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-500 flex items-center justify-center shrink-0">
              <Clock className="h-6 w-6 animate-pulse" />
            </div>
            <div className="space-y-1">
              <h3 id="timeout-modal-title" className="font-heading font-bold text-lg text-foreground">
                Inactivity Warning
              </h3>
              <p className="text-xs text-muted-foreground leading-relaxed">
                You have been inactive for nearly 30 minutes. For your security, your session will automatically end soon.
              </p>
            </div>
          </div>

          {/* Countdown Clock Display */}
          <div className="p-4 rounded-xl bg-secondary/60 border border-border/80 flex items-center justify-between">
            <div className="flex items-center space-x-2.5 text-xs text-muted-foreground font-medium">
              <ShieldAlert className="h-4 w-4 text-amber-500" />
              <span>Logging out automatically in:</span>
            </div>
            <div className="flex items-baseline space-x-1">
              <span className="font-mono text-2xl font-bold text-amber-500 tabular-nums">
                {secondsRemaining}
              </span>
              <span className="text-xs text-muted-foreground font-mono">sec</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <Button
              type="button"
              onClick={onStayLoggedIn}
              className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold rounded-xl h-11 shadow-sm transition-colors flex items-center justify-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
              <span>Stay Logged In</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={onLogOutNow}
              className="border-border text-muted-foreground hover:text-foreground hover:bg-secondary rounded-xl h-11 transition-colors flex items-center justify-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Log Out Now</span>
            </Button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
