'use client';

import React, { useState, useEffect } from 'react';
import {
  Building2,
  Copy,
  Check,
  Clock,
  AlertCircle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  X,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { PaymentInitiationResult, useVerifySubscriptionPayment } from '../../features/subscriptions/hooks/useSubscription';

interface DynamicBankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentInitiationResult | null;
  onSuccess?: () => void;
}

export const DynamicBankTransferModal: React.FC<DynamicBankTransferModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
}) => {
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // seconds
  const [isPaid, setIsPaid] = useState(false);

  const verifyMutation = useVerifySubscriptionPayment();

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !paymentData?.expiresAt) return;

    const expiryTime = new Date(paymentData.expiresAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, paymentData]);

  // Background polling every 4.5 seconds for instant credit confirmation
  useEffect(() => {
    if (!isOpen || !paymentData?.transactionReference || isPaid) return;

    const pollInterval = setInterval(async () => {
      try {
        const res = await verifyMutation.mutateAsync(paymentData.transactionReference);
        if (res?.paid) {
          setIsPaid(true);
          clearInterval(pollInterval);
          if (onSuccess) onSuccess();
        }
      } catch (err) {
        // silent polling catch
      }
    }, 4500);

    return () => clearInterval(pollInterval);
  }, [isOpen, paymentData, isPaid, verifyMutation, onSuccess]);

  if (!isOpen || !paymentData) return null;

  const handleCopyAccount = () => {
    navigator.clipboard.writeText(paymentData.accountNumber);
    setCopiedAccount(true);
    setTimeout(() => setCopiedAccount(false), 2000);
  };

  const handleCopyAmount = () => {
    navigator.clipboard.writeText(paymentData.amount.toString());
    setCopiedAmount(true);
    setTimeout(() => setCopiedAmount(false), 2000);
  };

  const handleManualCheck = async () => {
    try {
      const res = await verifyMutation.mutateAsync(paymentData.transactionReference);
      if (res?.paid) {
        setIsPaid(true);
        if (onSuccess) onSuccess();
      }
    } catch (err) {
      // handled by mutation state
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-md bg-[#0D131F] border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isPaid ? (
          /* ========================================================= */
          /* SUCCESS STATE                                             */
          /* ========================================================= */
          <div className="py-6 text-center space-y-4">
            <div className="h-16 w-16 mx-auto rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 animate-in zoom-in duration-300">
              <CheckCircle2 className="h-10 w-10" />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-bold text-white">Payment Received!</h3>
              <p className="text-xs text-slate-300">
                Your subscription to the <strong className="text-emerald-400 font-semibold">{paymentData.plan}</strong> plan ({paymentData.months || (paymentData.billingCycle === 'ANNUAL' ? 12 : 1)} { (paymentData.months || (paymentData.billingCycle === 'ANNUAL' ? 12 : 1)) === 1 ? 'month' : 'months'}) has been activated.
              </p>
            </div>
            <div className="pt-4">
              <Button
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl"
              >
                Go to Dashboard
              </Button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* TRANSFER INSTRUCTIONS STATE                               */
          /* ========================================================= */
          <div className="space-y-5">
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Lenco Virtual Account Payment</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Bank Transfer for {paymentData.plan} Plan ({paymentData.months || (paymentData.billingCycle === 'ANNUAL' ? 12 : 1)} {(paymentData.months || (paymentData.billingCycle === 'ANNUAL' ? 12 : 1)) === 1 ? 'Month' : 'Months'})
              </h3>
              <p className="text-xs text-slate-400">
                Transfer the exact amount below using your mobile bank app or internet banking.
              </p>
            </div>

            {/* Countdown Banner */}
            <div className="flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs">
              <div className="flex items-center space-x-2 text-slate-300">
                <Clock className="h-4 w-4 text-emerald-400" />
                <span>Account expires in:</span>
              </div>
              <span className={`font-mono font-bold ${timeLeft < 300 ? 'text-amber-400' : 'text-emerald-400'}`}>
                {timeFormatted}
              </span>
            </div>

            {/* Account Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3.5">

              {/* Bank Name */}
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Bank Name</span>
                <span className="font-semibold text-white uppercase">{paymentData.bankName}</span>
              </div>

              {/* Account Number with Copy */}
              <div className="flex items-center justify-between pt-1">
                <div>
                  <span className="text-xs text-slate-400 block">Account Number</span>
                  <span className="text-2xl font-mono font-extrabold tracking-wider text-emerald-400">
                    {paymentData.accountNumber}
                  </span>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleCopyAccount}
                  className="h-9 px-3 text-xs border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white rounded-lg flex items-center space-x-1.5"
                >
                  {copiedAccount ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5 text-slate-400" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
              </div>

              {/* Account Name */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/70">
                <span className="text-slate-400">Beneficiary Name</span>
                <span className="font-medium text-slate-200 text-right truncate max-w-[200px]">
                  {paymentData.accountName}
                </span>
              </div>

              {/* Exact Amount */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-800/70">
                <span className="text-slate-400">Amount to Send</span>
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">
                    ₦{paymentData.amount.toLocaleString()}
                  </span>
                  <button
                    onClick={handleCopyAmount}
                    className="text-slate-400 hover:text-emerald-400 p-1"
                    title="Copy amount"
                  >
                    {copiedAmount ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  </button>
                </div>
              </div>

            </div>

            {/* Note & Automatic Detection */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Listening for payment transfer in real-time...</span>
            </div>

            {/* Manual Verification Button */}
            <div className="space-y-2 pt-1">
              <Button
                onClick={handleManualCheck}
                disabled={verifyMutation.isPending}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Transfer with Lenco...</span>
                  </>
                ) : (
                  <span>I Have Sent the Payment</span>
                )}
              </Button>
              <p className="text-[11px] text-center text-slate-400">
                This account is created dynamically for this single invoice and will close once credited.
              </p>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

