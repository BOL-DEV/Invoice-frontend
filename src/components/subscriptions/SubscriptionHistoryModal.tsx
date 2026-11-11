'use client';

import React, { useState } from 'react';
import {
  X,
  History,
  CheckCircle2,
  Clock,
  AlertCircle,
  Copy,
  Check,
  Receipt,
  Building2,
  Calendar,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { SubscriptionPaymentRecord } from '@/types/api';

interface SubscriptionHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  payments?: SubscriptionPaymentRecord[];
}

export const SubscriptionHistoryModal: React.FC<SubscriptionHistoryModalProps> = ({
  isOpen,
  onClose,
  payments = [],
}) => {
  const [copiedRef, setCopiedRef] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedRef(text);
    setTimeout(() => setCopiedRef(null), 2000);
  };

  const formatDate = (dateStr?: string | null, includeTime = true) => {
    if (!dateStr) return '—';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return '—';
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      ...(includeTime ? { hour: '2-digit', minute: '2-digit' } : {}),
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'SUCCESS':
        return (
          <Badge className="bg-emerald-500/15 border-emerald-500/30 text-emerald-400 text-[11px] font-semibold flex items-center space-x-1">
            <CheckCircle2 className="h-3 w-3 mr-1" />
            <span>Settled & Paid</span>
          </Badge>
        );
      case 'PENDING':
        return (
          <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center space-x-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Pending Transfer</span>
          </Badge>
        );
      case 'FAILED':
        return (
          <Badge className="bg-rose-500/15 border-rose-500/30 text-rose-400 text-[11px] font-semibold flex items-center space-x-1">
            <AlertCircle className="h-3 w-3 mr-1" />
            <span>Failed</span>
          </Badge>
        );
      case 'EXPIRED':
        return (
          <Badge className="bg-amber-500/15 border-amber-500/30 text-amber-300 text-[11px] font-semibold flex items-center space-x-1">
            <Clock className="h-3 w-3 mr-1" />
            <span>Expired</span>
          </Badge>
        );
      default:
        return (
          <Badge className="bg-slate-700/40 border-slate-600/40 text-slate-300 text-[11px]">
            {status}
          </Badge>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#0D131F] border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="p-5 sm:p-6 border-b border-slate-800/80 flex items-center justify-between bg-slate-900/50">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">
              <History className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-white flex items-center space-x-2">
                <span>Subscription Billing History</span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-mono">
                  {payments.length} {payments.length === 1 ? 'record' : 'records'}
                </span>
              </h3>
              <p className="text-xs text-slate-400">
                Audit record of dynamic virtual bank transfers and tier activations.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content list */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-3.5 flex-1">
          {payments.length === 0 ? (
            <div className="py-12 text-center space-y-3">
              <div className="h-14 w-14 mx-auto rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500">
                <Receipt className="h-7 w-7" />
              </div>
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-slate-300">No payment history found</h4>
                <p className="text-xs text-slate-400 max-w-xs mx-auto">
                  When you initiate and complete subscription transfers via Lenco, settled records will be logged here.
                </p>
              </div>
            </div>
          ) : (
            payments.map((p) => {
              let parsedMeta: any = p.meta;
              if (typeof parsedMeta === 'string') {
                try {
                  parsedMeta = JSON.parse(parsedMeta);
                } catch {
                  parsedMeta = {};
                }
              }

              const months = parsedMeta?.months || (p.billingCycle === 'ANNUAL' ? 12 : 1);
              const rawFailure = parsedMeta?.failureReason || parsedMeta?.reason;
              const failureReason = typeof rawFailure === 'object' && rawFailure !== null
                ? (rawFailure.message || rawFailure.error || rawFailure.code || JSON.stringify(rawFailure))
                : (rawFailure ? String(rawFailure) : null);
              const hasDuplicatePayment = Boolean(parsedMeta?.hasDuplicatePayment);
              const displayAmount = p.amount ? Number(p.amount).toLocaleString('en-US') : '0';

              return (
                <div
                  key={p.id || p.transactionReference || Math.random().toString()}
                  className="p-4 rounded-xl bg-slate-900/80 border border-slate-800/90 hover:border-slate-700/80 transition-all space-y-3"
                >
                  {/* Top line: Plan & Amount */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <Badge className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono text-xs font-bold">
                        {p.plan || 'ACTIVE'} TIER
                      </Badge>
                      <span className="text-xs text-slate-300 font-medium">
                        {months} {months === 1 ? 'Month' : 'Months'} ({p.billingCycle || 'MONTHLY'})
                      </span>
                    </div>

                    <div className="flex items-center space-x-3">
                      <span className="text-base font-bold font-mono text-white">
                        ₦{displayAmount}
                      </span>
                      {getStatusBadge(p.status)}
                    </div>
                  </div>

                  {/* Failure / Expiration Explanation Notice */}
                  {failureReason && (p.status === 'FAILED' || p.status === 'EXPIRED') && (
                    <div className="p-2.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-xs text-rose-300 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block text-[11px] text-rose-300">
                          {p.status === 'EXPIRED' ? 'Session Expiration Reason:' : 'Failure / Rejection Reason:'}
                        </span>
                        <span className="text-[11px] text-rose-200 font-mono break-words">{failureReason}</span>
                      </div>
                    </div>
                  )}

                  {/* Duplicate Payment Warning Notice */}
                  {hasDuplicatePayment && (
                    <div className="p-2.5 rounded-lg bg-amber-500/10 border border-amber-500/25 text-xs text-amber-300 flex items-start space-x-2">
                      <AlertCircle className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" />
                      <div className="space-y-0.5">
                        <span className="font-semibold block text-[11px] text-amber-300">
                          Duplicate Payment Recorded:
                        </span>
                        <span className="text-[11px] text-amber-200">
                          A duplicate bank transfer was detected for this invoice. Please contact support for an automatic subscription extension or refund.
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Details grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-slate-800/60 text-xs">
                    {/* Reference */}
                    <div className="flex items-center space-x-2 text-slate-400">
                      <span className="text-slate-400">Ref:</span>
                      <span className="font-mono text-slate-300 text-[11px] truncate max-w-[170px]" title={p.transactionReference || ''}>
                        {p.transactionReference || '—'}
                      </span>
                      {p.transactionReference && (
                        <button
                          onClick={() => handleCopy(p.transactionReference)}
                          className="text-slate-400 hover:text-emerald-400 p-0.5"
                          title="Copy reference"
                        >
                          {copiedRef === p.transactionReference ? (
                            <Check className="h-3.5 w-3.5 text-emerald-400" />
                          ) : (
                            <Copy className="h-3.5 w-3.5" />
                          )}
                        </button>
                      )}
                    </div>

                    {/* Bank & Account */}
                    {p.bankName && p.accountNumber ? (
                      <div className="flex items-center space-x-1.5 text-slate-400 sm:justify-end">
                        <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                        <span className="text-[11px] text-slate-300">
                          {p.bankName} ({p.accountNumber})
                        </span>
                      </div>
                    ) : null}

                    {/* Timestamp */}
                    <div className="flex items-center space-x-1.5 text-slate-400">
                      <Calendar className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                      <span className="text-[11px] text-slate-300">
                        {p.paidAt ? `Paid on ${formatDate(p.paidAt)}` : `Initiated on ${formatDate(p.createdAt)}`}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800/80 bg-slate-900/40 flex justify-end">
          <Button
            onClick={onClose}
            variant="outline"
            className="h-9 px-4 text-xs border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-white rounded-xl"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  );
};
