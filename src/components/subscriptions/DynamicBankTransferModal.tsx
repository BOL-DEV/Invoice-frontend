'use client';

import React, { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import {
  Building2,
  Copy,
  Check,
  Clock,
  AlertCircle,
  AlertTriangle,
  Loader2,
  ShieldCheck,
  CheckCircle2,
  X,
  RefreshCw,
  ExternalLink,
  Calendar,
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  PaymentInitiationResult,
  PaymentVerificationResult,
  useVerifySubscriptionPayment,
} from '../../features/subscriptions/hooks/useSubscription';

interface DynamicBankTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  paymentData: PaymentInitiationResult | null;
  onSuccess?: () => void;
  onRetry?: () => void;
}

export const DynamicBankTransferModal: React.FC<DynamicBankTransferModalProps> = ({
  isOpen,
  onClose,
  paymentData,
  onSuccess,
  onRetry,
}) => {
  const queryClient = useQueryClient();
  const [copiedAccount, setCopiedAccount] = useState(false);
  const [copiedAmount, setCopiedAmount] = useState(false);
  const [timeLeft, setTimeLeft] = useState<number>(30 * 60); // seconds
  const [isPaid, setIsPaid] = useState(false);
  const [isFailed, setIsFailed] = useState(false);
  const [isExpired, setIsExpired] = useState(false);
  const [failureReason, setFailureReason] = useState<string | null>(null);
  const [confirmedData, setConfirmedData] = useState<PaymentVerificationResult | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null);

  const verifyMutation = useVerifySubscriptionPayment();

  // Reset state on modal open or when new payment is passed
  useEffect(() => {
    if (isOpen) {
      setIsPaid(false);
      setIsFailed(false);
      setIsExpired(false);
      setFailureReason(null);
      setConfirmedData(null);
      setFeedbackMessage(null);
    }
  }, [isOpen, paymentData?.transactionReference]);

  // Timer countdown
  useEffect(() => {
    if (!isOpen || !paymentData?.expiresAt) return;

    const expiryTime = new Date(paymentData.expiresAt).getTime();
    const interval = setInterval(() => {
      const now = Date.now();
      const diff = Math.max(0, Math.floor((expiryTime - now) / 1000));
      setTimeLeft(diff);

      if (diff <= 0) {
        setIsExpired(true);
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [isOpen, paymentData]);

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
    setFeedbackMessage(null);
    try {
      const res = await verifyMutation.mutateAsync(paymentData.transactionReference);
      if (res?.paid) {
        setConfirmedData(res);
        setIsPaid(true);
        if (onSuccess) onSuccess();
      } else if (res?.status === 'FAILED') {
        setIsFailed(true);
        setFailureReason(res.failureReason || res.message || 'Payment transfer was rejected or failed.');
      } else if (res?.status === 'EXPIRED') {
        setIsExpired(true);
        setFailureReason(res.failureReason || 'Virtual payment account expired.');
      } else {
        setFeedbackMessage(
          res?.message || 'Payment has not been detected yet. Bank network settlements may take 1-2 minutes.'
        );
      }
    } catch (err: any) {
      setFeedbackMessage(err?.response?.data?.message || 'Unable to verify payment at this moment. Please try again.');
    }
  };

  const formatReceiptDate = (dateVal?: any, includeTime = false) => {
    if (!dateVal) return '—';
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timeFormatted = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  const hasExpired = timeLeft <= 0 || isExpired;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-[#0D131F] border border-slate-800 rounded-2xl shadow-2xl p-6 overflow-hidden">

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800/60 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        {isPaid ? (
          /* ========================================================= */
          /* SUCCESS STATE / COMPREHENSIVE RECEIPT                     */
          /* ========================================================= */
          <div className="py-2 space-y-5 animate-in zoom-in-95 duration-200">
            {/* Header Icon & Title */}
            <div className="text-center space-y-2">
              <div className="relative inline-flex items-center justify-center">
                <div className="h-14 w-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Payment Confirmed & Verified!</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {confirmedData?.message || 'Your dynamic bank transfer was received and verified. Your subscription is active!'}
                </p>
              </div>
            </div>

            {/* Receipt Summary Card */}
            <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3 text-xs">
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-slate-400">Payment Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 font-semibold text-[11px]">
                  <Check className="h-3 w-3 mr-1" />
                  Settled & Activated
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Plan Activated</span>
                <span className="font-bold text-white font-mono uppercase">
                  {confirmedData?.subscription?.plan || confirmedData?.payment?.plan || paymentData.plan} TIER
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Amount Paid</span>
                <span className="font-extrabold text-emerald-400 text-sm font-mono">
                  ₦{Number(confirmedData?.payment?.amount || paymentData.amount).toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Duration</span>
                <span className="font-medium text-slate-200">
                  {confirmedData?.payment?.meta?.months || paymentData.months || (paymentData.billingCycle === 'ANNUAL' ? 12 : 1)} Month(s)
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Transaction Ref</span>
                <span
                  className="font-mono text-[11px] text-slate-300 truncate max-w-[210px]"
                  title={confirmedData?.payment?.transactionReference || paymentData.transactionReference}
                >
                  {confirmedData?.payment?.transactionReference || paymentData.transactionReference}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Settled Account</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {paymentData.bankName} ({paymentData.accountNumber})
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800/80">
                <span className="text-slate-400">New Expiration Date</span>
                <span className="font-bold text-amber-300 font-mono">
                  {formatReceiptDate(
                    confirmedData?.newEndDate ||
                    confirmedData?.subscription?.endDate ||
                    new Date(Date.now() + (paymentData.months || 1) * 30 * 24 * 60 * 60 * 1000)
                  )}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-slate-400">Confirmation Time</span>
                <span className="text-slate-400 text-[11px]">
                  {formatReceiptDate(confirmedData?.paidAt || new Date(), true)}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2">
              <Button
                onClick={() => {
                  onClose();
                  if (onSuccess) onSuccess();
                  queryClient.invalidateQueries({ queryKey: ['subscription'] });
                  queryClient.invalidateQueries({ queryKey: ['business'] });
                }}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg shadow-emerald-500/20 transition-all"
              >
                Done & Go to Workspace
              </Button>
            </div>
          </div>
        ) : hasExpired ? (
          /* ========================================================= */
          /* EXPIRED STATE                                             */
          /* ========================================================= */
          <div className="py-2 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 mx-auto rounded-full bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
                <Clock className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Transfer Session Expired</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  {failureReason || 'This dynamic virtual transfer account was valid for 30 minutes and has now expired for your protection.'}
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-amber-300 font-semibold">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>Do Not Transfer Funds to Expired Account</span>
              </div>
              <p className="text-slate-300 text-[11px] leading-relaxed">
                Sending funds to an expired dynamic account can result in bank network delays or automated reversals. Please generate a fresh virtual account to complete your payment smoothly.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Generate Fresh Transfer Account</span>
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-10 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Cancel & Close
              </Button>
            </div>
          </div>
        ) : isFailed ? (
          /* ========================================================= */
          /* FAILED / REJECTED STATE                                   */
          /* ========================================================= */
          <div className="py-2 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="h-14 w-14 mx-auto rounded-full bg-rose-500/20 border border-rose-500/30 flex items-center justify-center text-rose-400">
                <AlertCircle className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h3 className="text-xl font-bold text-white tracking-tight">Payment Transfer Rejected</h3>
                <p className="text-xs text-slate-300 max-w-sm mx-auto">
                  The payment transfer could not be settled or was rejected by the banking network.
                </p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 space-y-2.5 text-xs">
              <div className="flex items-center space-x-2 text-rose-400 font-semibold">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>Exact Failure Reason</span>
              </div>
              <div className="p-3 rounded-lg bg-slate-900/90 border border-rose-500/20 font-mono text-rose-300 text-xs break-words">
                {failureReason || 'Transfer amount mismatch or transaction rejected by sending bank.'}
              </div>
              <p className="text-slate-400 text-[11px] leading-relaxed">
                If money left your bank account, NIBSS and your bank will automatically reverse the full amount back to your sending account within normal settlement windows.
              </p>
            </div>

            <div className="space-y-2 pt-2">
              {onRetry && (
                <Button
                  onClick={onRetry}
                  className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Generate Fresh Transfer Account</span>
                </Button>
              )}
              <Button
                onClick={onClose}
                variant="outline"
                className="w-full h-10 border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-slate-300 text-xs rounded-xl"
              >
                Close
              </Button>
            </div>
          </div>
        ) : (
          /* ========================================================= */
          /* ACTIVE TRANSFER INSTRUCTIONS STATE                        */
          /* ========================================================= */
          <div className="space-y-5">
            {/* Header */}
            <div className="space-y-1">
              <div className="inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-semibold">
                <ShieldCheck className="h-3.5 w-3.5" />
                <span>Instant Bank Transfer</span>
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
                <span className="font-semibold text-white uppercase">
                  {paymentData.accountName || 'URE MFB CHECKOUT'}
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

            {/* Instruction note */}
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 justify-center">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Make the transfer to the details above, then click below</span>
            </div>

            {/* Feedback Message */}
            {feedbackMessage && (
              <div className="flex items-start space-x-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300">
                <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{feedbackMessage}</p>
              </div>
            )}

            {/* Manual Verification Button */}
            <div className="pt-1">
              <Button
                onClick={handleManualCheck}
                disabled={verifyMutation.isPending}
                className="w-full h-11 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all shadow-lg shadow-emerald-500/10"
              >
                {verifyMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Verifying Transfer...</span>
                  </>
                ) : (
                  <span>I Have Sent the Payment</span>
                )}
              </Button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
