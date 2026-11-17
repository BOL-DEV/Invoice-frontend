'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { letterService } from '../../../../services/letter.service';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { useModal } from '../../../../components/ui/modal-provider';
import {
  ArrowLeft,
  Printer,
  Check,
  Loader2,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText,
  Undo2,
  FileDown,
} from 'lucide-react';
import { downloadDocumentPDF, printDocumentPDF } from '../../../../lib/document-download';

export default function NewLetterPage() {
  const router = useRouter();
  const modal = useModal();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [ourRef, setOurRef] = useState('');
  const [yourRef, setYourRef] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [body, setBody] = useState('');
  const [textAlign, setTextAlign] = useState<'left' | 'center' | 'right' | 'justify'>('left');
  const [fontFamily, setFontFamily] = useState<'calibri' | 'times' | 'arial'>('calibri');
  const [signatoryName, setSignatoryName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Managing Director'
  );
  const [signatoryTitle, setSignatoryTitle] = useState('Managing Director');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);

  // Word-style formatting actions
  const applyFormat = (prefix: string, suffix: string = '') => {
    const el = textareaRef.current;
    if (!el) return;

    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);

    let replacement = '';
    if (selected.length > 0) {
      replacement = `${prefix}${selected}${suffix}`;
    } else {
      replacement = `${prefix}${suffix}`;
    }

    const nextValue = el.value.substring(0, start) + replacement + el.value.substring(end);
    setBody(nextValue);

    setTimeout(() => {
      el.focus();
      const cursorTarget = start + prefix.length + (selected.length > 0 ? selected.length : 0);
      el.setSelectionRange(cursorTarget, cursorTarget);
    }, 10);
  };

  const insertBullet = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);

    if (selected.length > 0) {
      const lines = selected.split('\n').map((l) => (l.startsWith('• ') ? l : `• ${l}`)).join('\n');
      const nextValue = el.value.substring(0, start) + lines + el.value.substring(end);
      setBody(nextValue);
    } else {
      applyFormat('\n• ');
    }
  };

  const insertNumberList = () => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = el.value.substring(start, end);

    if (selected.length > 0) {
      const lines = selected
        .split('\n')
        .map((l, i) => `${i + 1}. ${l.replace(/^\d+\.\s*/, '')}`)
        .join('\n');
      const nextValue = el.value.substring(0, start) + lines + el.value.substring(end);
      setBody(nextValue);
    } else {
      applyFormat('\n1. ');
    }
  };

  // Stats calculation
  const wordCount = body.trim() ? body.trim().split(/\s+/).length : 0;
  const charCount = body.length;

  const fontStyleClass =
    fontFamily === 'times'
      ? 'font-serif'
      : fontFamily === 'arial'
      ? 'font-sans'
      : 'font-sans'; // Calibri style clean sans

  const alignClass =
    textAlign === 'center'
      ? 'text-center'
      : textAlign === 'right'
      ? 'text-right'
      : textAlign === 'justify'
      ? 'text-justify'
      : 'text-left';

  const handleSubmit = async (action: 'download' | 'print' | 'draft' = 'download') => {
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
        recipientName: null,
        recipientAddress: null,
        signatoryName: signatoryName.trim() || null,
        signatoryTitle: signatoryTitle.trim() || null,
        status: action === 'draft' ? 'DRAFT' : 'FINALIZED',
      });

      if (action === 'download') {
        try {
          await downloadDocumentPDF(
            `/api/printing/letter/${letter.id}/pdf`,
            `letter_${letter.letterNumber}.pdf`
          );
        } catch (downloadErr) {
          console.warn('Letter direct download fallback:', downloadErr);
        }
      } else if (action === 'print') {
        try {
          await printDocumentPDF(`/api/printing/letter/${letter.id}/pdf`);
        } catch (printErr) {
          window.open(letterService.getPDFUrl(letter.id), '_blank');
        }
      }

      modal.alert(
        'Letter Saved',
        `Letter "${letter.title}" (${letter.letterNumber}) has been created successfully.${action === 'download' ? ' Your PDF document has been downloaded.' : ''}`,
        'success'
      );
      router.push('/letters');
    } catch (err: any) {
      modal.alert('Error', err.response?.data?.message || err.message || 'Failed to save letter', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Navigation & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <Link
          href="/letters"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-muted-foreground hover:text-foreground transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Back to Letters</span>
        </Link>

        <div className="flex items-center space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push('/letters')}
            disabled={isSubmitting}
            className="rounded-xl h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            Cancel
          </Button>

          <Button
            type="button"
            variant="secondary"
            onClick={() => handleSubmit('draft')}
            disabled={isSubmitting}
            className="rounded-xl h-9 px-4 text-xs font-semibold cursor-pointer"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin mr-1.5" /> : <Check className="h-4 w-4 mr-1.5" />}
            <span>Save Draft</span>
          </Button>

          <Button
            type="button"
            variant="outline"
            onClick={() => handleSubmit('print')}
            disabled={isSubmitting}
            className="rounded-xl h-9 px-3.5 text-xs font-semibold border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer flex items-center space-x-1"
          >
            <Printer className="h-3.5 w-3.5 text-muted-foreground" />
            <span>Print</span>
          </Button>

          <Button
            type="button"
            onClick={() => handleSubmit('download')}
            disabled={isSubmitting}
            className="rounded-xl h-9 px-4 text-xs font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-sm cursor-pointer flex items-center space-x-1.5"
          >
            {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileDown className="h-4 w-4" />}
            <span>Save & Download Letter</span>
          </Button>
        </div>
      </div>

      {/* Microsoft Word Document Suite Container */}
      <div className="rounded-2xl border border-slate-300 dark:border-slate-800 shadow-xl overflow-hidden bg-slate-200/70 dark:bg-slate-900/80">
        {/* Microsoft Word Title Bar */}
        <div className="bg-[#2b579a] text-white px-4 py-2 flex items-center justify-between text-xs font-medium">
          <div className="flex items-center space-x-2">
            <div className="bg-white/20 p-1 rounded">
              <FileText className="h-3.5 w-3.5 text-white" />
            </div>
            <span className="font-semibold tracking-wide">
              {title.trim() ? `${title.slice(0, 40)}${title.length > 40 ? '...' : ''} - Official Letter Document` : 'Document1 - Official Letter Document'}
            </span>
          </div>
          <span className="text-[11px] text-blue-100 hidden sm:inline">Microsoft Word Environment</span>
        </div>

        {/* Word Ribbon Toolbar */}
        <div className="bg-white dark:bg-slate-800 border-b border-slate-300 dark:border-slate-700 p-2 sm:px-4 flex flex-wrap items-center gap-1 sm:gap-2 shadow-sm text-slate-700 dark:text-slate-200">
          {/* Font Selector */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <select
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value as any)}
              className="h-8 text-xs font-medium bg-slate-50 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 rounded-lg px-2 text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
            >
              <option value="calibri">Calibri (Body)</option>
              <option value="times">Times New Roman</option>
              <option value="arial">Arial</option>
            </select>
          </div>

          {/* Formatting Controls: Bold, Italic, Underline */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => applyFormat('**', '**')}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors font-bold text-xs cursor-pointer"
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('*', '*')}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors italic text-xs cursor-pointer"
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => applyFormat('<u>', '</u>')}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs cursor-pointer"
              title="Underline (Ctrl+U)"
            >
              <Underline className="h-4 w-4" />
            </button>
          </div>

          {/* Alignment Controls */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => setTextAlign('left')}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                textAlign === 'left' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('center')}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                textAlign === 'center' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('right')}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                textAlign === 'right' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => setTextAlign('justify')}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                textAlign === 'justify' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Justify"
            >
              <AlignJustify className="h-4 w-4" />
            </button>
          </div>

          {/* List Controls */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={insertBullet}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={insertNumberList}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors cursor-pointer"
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto flex items-center gap-1.5 hidden md:flex">
            <span>Official Letter Template</span>
          </div>
        </div>

        {/* The Word Document Canvas Desk */}
        <div className="p-4 sm:p-10 flex justify-center overflow-x-auto min-h-[800px]">
          {/* Authentic White A4 Paper Sheet */}
          <div className="bg-white text-slate-900 w-full max-w-[820px] min-h-[960px] p-8 sm:p-14 shadow-2xl rounded-sm border border-slate-300 relative flex flex-col justify-between space-y-6">
            
            {/* Top Sheet Header & References */}
            <div className="space-y-4">
              {/* Reference Metadata Row */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs text-slate-700 border-b border-slate-200 pb-3">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">Our Ref:</span>
                  <input
                    type="text"
                    value={ourRef}
                    onChange={(e) => setOurRef(e.target.value)}
                    placeholder="LSV/ADM/2026/01"
                    className="h-7 px-2 font-mono text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none w-36 sm:w-44 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">Your Ref:</span>
                  <input
                    type="text"
                    value={yourRef}
                    onChange={(e) => setYourRef(e.target.value)}
                    placeholder="DNG/PROC/881"
                    className="h-7 px-2 font-mono text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none w-36 sm:w-44 bg-slate-50/50"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <span className="font-bold text-slate-900">Date:</span>
                  <input
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="h-7 px-2 text-xs border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>

              {/* Subject / Title Line (Like formal document heading) */}
              <div className="pt-2">
                <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                  Subject Line (RE:) *
                </div>
                <div className="flex items-baseline space-x-2 border-b-2 border-slate-800 pb-1">
                  <span className="font-bold text-base sm:text-lg text-slate-950 select-none">RE:</span>
                  <input
                    type="text"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="CLICK HERE TO TYPE LETTER SUBJECT (E.G. NOTIFICATION OF PRICE REVISION)"
                    className="w-full text-sm sm:text-base font-bold uppercase tracking-wide text-slate-950 focus:outline-none bg-transparent placeholder:text-slate-400 placeholder:normal-case placeholder:font-normal"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Seamless Document Body Writing Canvas */}
            <div className="flex-1 flex flex-col pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-1 select-none">
                Letter Body Content *
              </div>
              <textarea
                ref={textareaRef}
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Dear Sir / Madam,

Start typing your official letter here just like in Microsoft Word. Paragraphs, line breaks, and bullet points will format cleanly on your official letterhead.

We remain at your service.

Yours faithfully,"
                rows={18}
                className={`w-full flex-1 p-0 border-0 focus:ring-0 focus:outline-none resize-y text-slate-900 text-sm sm:text-[15px] leading-relaxed placeholder:text-slate-300 ${fontStyleClass} ${alignClass}`}
                required
              />
            </div>

            {/* Document Bottom Signatory Block */}
            <div className="pt-6 border-t border-slate-200/80 space-y-3">
              <div className="text-xs text-slate-600 font-medium">Yours faithfully,</div>
              
              <div className="pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-lg">
                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block">Signatory Name</label>
                  <input
                    type="text"
                    value={signatoryName}
                    onChange={(e) => setSignatoryName(e.target.value)}
                    placeholder="Authorised Signatory"
                    className="mt-0.5 h-8 px-2 w-full text-xs font-semibold text-slate-900 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-slate-50/50"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-500 block">Signatory Title</label>
                  <input
                    type="text"
                    value={signatoryTitle}
                    onChange={(e) => setSignatoryTitle(e.target.value)}
                    placeholder="Managing Director"
                    className="mt-0.5 h-8 px-2 w-full text-xs text-slate-700 border border-slate-300 rounded focus:border-blue-500 focus:outline-none bg-slate-50/50"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Microsoft Word Bottom Status Bar */}
        <div className="bg-[#2b579a] text-blue-100 px-4 py-1.5 flex items-center justify-between text-[11px] font-mono">
          <div className="flex items-center space-x-4">
            <span>Page 1 of 1</span>
            <span>{wordCount} words</span>
            <span>{charCount} characters</span>
          </div>
          <div className="flex items-center space-x-3 hidden sm:flex">
            <span>Standard Letterhead</span>
            <span>100%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
