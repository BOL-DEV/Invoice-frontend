'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { letterService } from '../../../../services/letter.service';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { Input } from '../../../../components/ui/input';
import { Card } from '../../../../components/ui/card';
import { useModal } from '../../../../components/ui/modal-provider';
import {
  Mail,
  ArrowLeft,
  Printer,
  Check,
  Loader2,
  Bold,
  Underline,
  List,
  ListOrdered,
  FileText,
  Eye,
  Edit3,
  Sparkles,
} from 'lucide-react';

const LETTER_STARTERS = [
  {
    name: 'Price Revision Notice',
    subject: 'NOTIFICATION OF UPWARD PRICE ADJUSTMENT DUE TO MARKET FORCES',
    body: `Dear Esteemed Client,

We write to formally notify your good office of a necessary revision in the prices of our building materials and steel products, taking effect immediately.

Over the past few weeks, our operational costs and supplier procurement rates have increased significantly due to prevailing inflationary trends and foreign exchange fluctuations. In order to continue supplying you with top-quality, certified materials without compromise, we have made moderate adjustments to our pricing structure.

We value the cordial business relationship existing between our organizations and count on your kind understanding during this period.

Thank you for your continuous patronage.`,
  },
  {
    name: 'Formal Supply Proposal',
    subject: 'COMMERCIAL PROPOSAL FOR SUPPLY OF INDUSTRIAL MATERIALS',
    body: `Dear Sir/Madam,

Following our recent discussions regarding your ongoing project requirements, we are pleased to submit our formal commercial proposal for the supply of high-grade steel and building materials.

Our organization maintains an extensive inventory of certified materials adhering strictly to national standard specifications. We are equipped with a fleet of logistics vehicles ensuring prompt on-site delivery to prevent any operational downtime on your project.

We look forward to being of service to your esteemed organization. Kindly find attached our detailed schedule of rates for your kind review and approval.`,
  },
  {
    name: 'Payment Demand / Reminder',
    subject: 'DEMAND FOR SETTLEMENT OF OUTSTANDING INVOICE',
    body: `Dear Sir/Madam,

This is a formal reminder regarding the outstanding balance on your account with respect to materials supplied to your project site.

According to our accounts department records, the sum remains unpaid beyond the agreed credit terms. We kindly request that you effect payment within five (5) business days from the receipt of this letter to avoid any disruption to future supplies.

If payment has already been initiated, please disregard this notice and share the remittance advice for reconciliation.

Thank you for your prompt attention to this matter.`,
  },
];

export default function NewLetterPage() {
  const router = useRouter();
  const modal = useModal();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [ourRef, setOurRef] = useState('');
  const [yourRef, setYourRef] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [recipientName, setRecipientName] = useState('');
  const [recipientAddress, setRecipientAddress] = useState('');
  const [body, setBody] = useState('');
  const [signatoryName, setSignatoryName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Managing Director'
  );
  const [signatoryTitle, setSignatoryTitle] = useState('Managing Director');
  const [activeTab, setActiveTab] = useState<'editor' | 'preview'>('editor');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const applyTemplate = (starter: typeof LETTER_STARTERS[0]) => {
    setTitle(starter.subject);
    setBody(starter.body);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = document.getElementById('letter-body-area') as HTMLTextAreaElement | null;
    if (!textarea) return;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = textarea.value.substring(start, end);
    const replacement = `${before}${selected}${after}`;
    const nextValue = textarea.value.substring(0, start) + replacement + textarea.value.substring(end);
    setBody(nextValue);
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const handleSubmit = async (andPrint = false) => {
    if (!title.trim()) {
      modal.alert('Validation Error', 'Letter title / subject is required', 'warning');
      return;
    }
    if (!body.trim()) {
      modal.alert('Validation Error', 'Letter body content cannot be empty', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const letter = await letterService.create({
        title: title.trim(),
        body: body.trim(),
        ourRef: ourRef.trim() || null,
        yourRef: yourRef.trim() || null,
        date: date ? new Date(date).toISOString() : new Date().toISOString(),
        recipientName: recipientName.trim() || null,
        recipientAddress: recipientAddress.trim() || null,
        signatoryName: signatoryName.trim() || null,
        signatoryTitle: signatoryTitle.trim() || null,
        status: andPrint ? 'FINALIZED' : 'DRAFT',
      });

      if (andPrint) {
        window.open(letterService.getPDFUrl(letter.id), '_blank');
      }

      modal.alert('Letter Saved', `Letter "${letter.title}" (${letter.letterNumber}) has been created successfully.`, 'success');
      router.push('/letters');
    } catch (err: any) {
      modal.alert('Error', err.response?.data?.message || err.message || 'Failed to save letter', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Breadcrumb */}
      <div className="flex items-center justify-between">
        <Link
          href="/letters"
          className="flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Letters</span>
        </Link>

        {/* View Mode Toggle */}
        <div className="flex items-center bg-secondary/80 p-1 rounded-xl border border-border">
          <button
            type="button"
            onClick={() => setActiveTab('editor')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'editor' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
            <span>Document Editor</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('preview')}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
              activeTab === 'preview' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
            <span>Letterhead Preview</span>
          </button>
        </div>
      </div>

      {/* Page Title */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-600 rounded-xl">
            <Mail className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Draft Official Letter</h1>
            <p className="text-sm text-muted-foreground">
              Lightweight Word-style document drafting with official letterhead formatting
            </p>
          </div>
        </div>

        {/* Template Starters Dropdown */}
        <div className="flex items-center gap-1.5">
          {LETTER_STARTERS.map((s, idx) => (
            <Button
              key={idx}
              type="button"
              variant="outline"
              size="sm"
              onClick={() => applyTemplate(s)}
              className="text-xs rounded-xl h-8 hidden sm:flex items-center space-x-1 cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-indigo-500" />
              <span>{s.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {activeTab === 'editor' ? (
        <div className="space-y-6">
          {/* Header & References Meta */}
          <Card className="p-5 rounded-2xl border-border bg-card shadow-sm space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Our Reference (Our Ref)</label>
                <Input
                  value={ourRef}
                  onChange={(e) => setOurRef(e.target.value)}
                  placeholder="e.g. LSV/ADM/2026/01"
                  className="mt-1 h-9 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Your Reference (Your Ref)</label>
                <Input
                  value={yourRef}
                  onChange={(e) => setYourRef(e.target.value)}
                  placeholder="e.g. DNG/PROC/881"
                  className="mt-1 h-9 rounded-xl text-xs font-mono"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Letter Date</label>
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
            </div>

            {/* Recipient Details */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-border/60">
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Addressee / Recipient Name</label>
                <Input
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  placeholder="e.g. The Managing Director, Dangote Construction"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-muted-foreground">Recipient Address</label>
                <Input
                  value={recipientAddress}
                  onChange={(e) => setRecipientAddress(e.target.value)}
                  placeholder="e.g. Plot 12 Victoria Island, Lagos State"
                  className="mt-1 h-9 rounded-xl text-xs"
                />
              </div>
            </div>
          </Card>

          {/* Microsoft Word Canvas Environment */}
          <Card className="rounded-2xl border-border bg-card shadow-sm overflow-hidden">
            {/* Word Formatting Ribbon */}
            <div className="bg-secondary/50 border-b border-border p-2.5 flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center space-x-1">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('**', '**')}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-secondary"
                  title="Bold"
                >
                  <Bold className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('<u>', '</u>')}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-secondary"
                  title="Underline"
                >
                  <Underline className="h-4 w-4" />
                </Button>
                <div className="h-4 w-px bg-border mx-1" />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('\n• ')}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-secondary"
                  title="Bullet List"
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => insertText('\n1. ')}
                  className="h-8 w-8 p-0 rounded-lg cursor-pointer hover:bg-secondary"
                  title="Numbered List"
                >
                  <ListOrdered className="h-4 w-4" />
                </Button>
              </div>

              <div className="text-[11px] font-semibold text-muted-foreground flex items-center gap-1.5">
                <FileText className="h-3.5 w-3.5" />
                <span>Letterhead Document Canvas</span>
              </div>
            </div>

            {/* Simulated Paper Canvas */}
            <div className="p-6 sm:p-10 space-y-4 bg-background">
              {/* Subject Line */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Subject / Title (RE:) *
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. NOTIFICATION OF SCHEDULED SUPPLY DELIVERY"
                  className="h-10 text-sm font-bold uppercase rounded-xl border-border"
                  required
                />
              </div>

              {/* Body Textarea */}
              <div>
                <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Letter Content *
                </label>
                <textarea
                  id="letter-body-area"
                  rows={14}
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Type your official letter here. Paragraphs and formatting will be aligned cleanly on the letterhead..."
                  className="w-full p-4 rounded-xl border border-border bg-card text-foreground font-serif text-sm leading-relaxed focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-y"
                  required
                />
              </div>

              {/* Signatory Information */}
              <div className="pt-4 border-t border-border grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Signatory Name</label>
                  <Input
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    placeholder="Authorised Signatory"
                    className="mt-1 h-9 rounded-xl text-xs"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-muted-foreground">Signatory Title / Designation</label>
                  <Input
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    placeholder="e.g. Managing Director / Operations Manager"
                    className="mt-1 h-9 rounded-xl text-xs"
                  />
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        /* Live Letterhead Preview Mode */
        <Card className="max-w-3xl mx-auto p-10 bg-white text-gray-900 rounded-2xl shadow-xl border border-gray-200 font-serif min-h-[700px] space-y-6">
          <div className="text-center border-b-2 border-emerald-800 pb-3">
            <h2 className="text-2xl font-bold tracking-tight text-emerald-900">OFFICIAL BUSINESS LETTERHEAD</h2>
            <p className="text-xs text-gray-600 uppercase tracking-widest mt-1">Certified Corporate Correspondence</p>
          </div>

          <div className="flex justify-between text-xs text-gray-700 font-sans border-b border-gray-300 pb-2">
            <span><strong>Our Ref:</strong> {ourRef || '_______________'}</span>
            <span><strong>Your Ref:</strong> {yourRef || '_______________'}</span>
            <span><strong>Date:</strong> {date ? new Date(date).toLocaleDateString('en-GB') : '__________'}</span>
          </div>

          {recipientName && (
            <div className="text-xs font-sans text-gray-800 space-y-0.5">
              <div className="font-bold">{recipientName}</div>
              {recipientAddress && <div className="text-gray-600 whitespace-pre-line">{recipientAddress}</div>}
            </div>
          )}

          <div className="font-bold text-sm uppercase text-gray-950 border-b border-gray-400 pb-1">
            RE: {title || '[SUBJECT / TITLE]'}
          </div>

          <div className="text-sm leading-relaxed whitespace-pre-line text-gray-900 min-h-[250px]">
            {body || 'Your letter body content will appear here...'}
          </div>

          <div className="pt-6 font-sans text-xs text-gray-800 space-y-1">
            <div>Yours faithfully,</div>
            <div className="pt-6 font-bold text-sm text-gray-900">{signatoryName || 'Authorised Signatory'}</div>
            {signatoryTitle && <div className="text-gray-600 italic">{signatoryTitle}</div>}
          </div>
        </Card>
      )}

      {/* Footer Actions */}
      <div className="flex items-center justify-end space-x-3 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push('/letters')}
          disabled={isSubmitting}
          className="rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer"
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => handleSubmit(false)}
          disabled={isSubmitting}
          className="rounded-xl h-10 px-5 text-xs font-semibold cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
          <span>Save as Draft</span>
        </Button>
        <Button
          type="button"
          onClick={() => handleSubmit(true)}
          disabled={isSubmitting}
          className="rounded-xl h-10 px-6 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700 text-white cursor-pointer"
        >
          {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Printer className="h-4 w-4 mr-1.5" />}
          <span>Save & Print Letterhead PDF</span>
        </Button>
      </div>
    </div>
  );
}
