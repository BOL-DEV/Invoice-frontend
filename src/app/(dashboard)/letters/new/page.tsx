'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { letterService } from '../../../../services/letter.service';
import { useAuth } from '../../../../features/auth/context/AuthContext';
import { Button } from '../../../../components/ui/button';
import { useModal } from '../../../../components/ui/modal-provider';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Underline from '@tiptap/extension-underline';
import TextAlign from '@tiptap/extension-text-align';
import {
  ArrowLeft,
  Printer,
  Check,
  Loader2,
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  FileText,
  Undo2,
  Redo2,
  FileDown,
  Eraser,
  Heading1,
  Heading2,
  Pilcrow,
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
  const [fontFamily, setFontFamily] = useState<'calibri' | 'times' | 'arial'>('calibri');
  const [signatoryName, setSignatoryName] = useState(
    user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Managing Director'
  );
  const [signatoryTitle, setSignatoryTitle] = useState('Managing Director');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [, setTick] = useState(0);

  // TipTap Word-Style WYSIWYG Editor
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        bulletList: {
          keepMarks: true,
          keepAttributes: false,
        },
        orderedList: {
          keepMarks: true,
          keepAttributes: false,
        },
      }),
      Underline,
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
    ],
    content: `
      <p>Dear Sir / Madam,</p>
      <p>Start typing your official letter here just like in Microsoft Word. Paragraphs, line breaks, bold, italics, underline, and bullet points will format cleanly and accurately on your official letterhead.</p>
      <p>We remain at your service.</p>
    `,
    immediatelyRender: false,
    onTransaction: () => {
      // Re-render so ribbon toolbar active states update instantly
      setTick((t) => t + 1);
    },
  });

  // Calculate stats from editor
  const textContent = editor ? editor.getText() : '';
  const wordCount = textContent.trim() ? textContent.trim().split(/\s+/).length : 0;
  const charCount = textContent.length;

  const fontStyleClass =
    fontFamily === 'times'
      ? 'font-serif'
      : fontFamily === 'arial'
      ? 'font-sans'
      : 'font-sans';

  const handleSubmit = async (action: 'download' | 'print' | 'draft' = 'download') => {
    if (!title.trim()) {
      modal.alert('Validation Error', 'Letter title / subject is required', 'warning');
      return;
    }

    const htmlBody = editor ? editor.getHTML() : '';
    const plainText = editor ? editor.getText().trim() : '';

    if (!plainText) {
      modal.alert('Validation Error', 'Letter body content cannot be empty', 'warning');
      return;
    }

    try {
      setIsSubmitting(true);
      const letter = await letterService.create({
        title: title.trim(),
        body: htmlBody,
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
          {/* History Controls: Undo & Redo */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor?.chain().focus().undo().run()}
              disabled={!editor?.can().undo()}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().redo().run()}
              disabled={!editor?.can().redo()}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="h-4 w-4" />
            </button>
          </div>

          {/* Font Family Selector */}
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

          {/* Paragraph / Heading Styles */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor?.chain().focus().setParagraph().run()}
              className={`h-8 px-2 rounded-lg flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                editor?.isActive('paragraph') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Normal Paragraph"
            >
              <Pilcrow className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Normal</span>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 1 }).run()}
              className={`h-8 px-2 rounded-lg flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                editor?.isActive('heading', { level: 1 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Heading 1"
            >
              <Heading1 className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">H1</span>
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}
              className={`h-8 px-2 rounded-lg flex items-center justify-center text-xs font-medium transition-colors cursor-pointer ${
                editor?.isActive('heading', { level: 2 }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-200' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Heading 2"
            >
              <Heading2 className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">H2</span>
            </button>
          </div>

          {/* Formatting Controls: Bold, Italic, Underline, Strike */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleBold().run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors text-xs font-bold cursor-pointer ${
                editor?.isActive('bold') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Bold (Ctrl+B)"
            >
              <Bold className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleItalic().run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors text-xs italic cursor-pointer ${
                editor?.isActive('italic') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Italic (Ctrl+I)"
            >
              <Italic className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleUnderline().run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer ${
                editor?.isActive('underline') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Underline (Ctrl+U)"
            >
              <UnderlineIcon className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleStrike().run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors text-xs cursor-pointer ${
                editor?.isActive('strike') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Strikethrough"
            >
              <Strikethrough className="h-4 w-4" />
            </button>
          </div>

          {/* Alignment Controls */}
          <div className="flex items-center space-x-1 border-r border-slate-300 dark:border-slate-700 pr-2">
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('left').run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                editor?.isActive({ textAlign: 'left' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Align Left"
            >
              <AlignLeft className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('center').run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                editor?.isActive({ textAlign: 'center' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Center"
            >
              <AlignCenter className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('right').run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                editor?.isActive({ textAlign: 'right' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Align Right"
            >
              <AlignRight className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().setTextAlign('justify').run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                editor?.isActive({ textAlign: 'justify' }) ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
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
              onClick={() => editor?.chain().focus().toggleBulletList().run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                editor?.isActive('bulletList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Bullet List"
            >
              <List className="h-4 w-4" />
            </button>
            <button
              type="button"
              onClick={() => editor?.chain().focus().toggleOrderedList().run()}
              className={`h-8 w-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                editor?.isActive('orderedList') ? 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-200 ring-1 ring-blue-500/50' : 'hover:bg-slate-100 dark:hover:bg-slate-700'
              }`}
              title="Numbered List"
            >
              <ListOrdered className="h-4 w-4" />
            </button>
          </div>

          {/* Clear Formatting */}
          <div className="flex items-center space-x-1">
            <button
              type="button"
              onClick={() => editor?.chain().focus().unsetAllMarks().clearNodes().run()}
              className="h-8 w-8 rounded-lg flex items-center justify-center hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-xs cursor-pointer text-slate-500"
              title="Clear Formatting"
            >
              <Eraser className="h-4 w-4" />
            </button>
          </div>

          <div className="text-[11px] text-slate-500 dark:text-slate-400 ml-auto flex items-center gap-1.5 hidden md:flex">
            <span>Visual WYSIWYG Mode</span>
          </div>
        </div>

        {/* The Word Document Canvas Desk */}
        <div className="p-4 sm:p-10 flex justify-center overflow-x-auto min-h-[800px]">
          {/* Authentic White A4 Paper Sheet */}
          <div className={`bg-white text-slate-900 w-full max-w-[820px] min-h-[960px] p-8 sm:p-14 shadow-2xl rounded-sm border border-slate-300 relative flex flex-col justify-between space-y-6 ${fontStyleClass}`}>
            
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

            {/* Seamless Document Body Writing Canvas (TipTap WYSIWYG) */}
            <div className="flex-1 flex flex-col pt-2">
              <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2 select-none">
                Letter Body Content (Visual WYSIWYG) *
              </div>
              <div className="tiptap-wrapper flex-1">
                <EditorContent
                  editor={editor}
                  className="tiptap-editor cursor-text focus:outline-none min-h-[460px]"
                />
              </div>
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

      {/* Scoped CSS for authentic Word Typography inside TipTap */}
      <style jsx global>{`
        .tiptap-editor .tiptap {
          min-height: 460px;
          outline: none;
          font-size: 15px;
          line-height: 1.75;
          color: #0f172a;
        }
        .tiptap-editor .tiptap p {
          margin-bottom: 0.85rem;
        }
        .tiptap-editor .tiptap h1 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.25rem;
          margin-bottom: 0.6rem;
          color: #0f172a;
        }
        .tiptap-editor .tiptap h2 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1rem;
          margin-bottom: 0.5rem;
          color: #0f172a;
        }
        .tiptap-editor .tiptap h3 {
          font-size: 1.1rem;
          font-weight: 600;
          margin-top: 0.75rem;
          margin-bottom: 0.4rem;
          color: #0f172a;
        }
        .tiptap-editor .tiptap ul {
          list-style-type: disc;
          padding-left: 1.75rem;
          margin-bottom: 0.85rem;
        }
        .tiptap-editor .tiptap ol {
          list-style-type: decimal;
          padding-left: 1.75rem;
          margin-bottom: 0.85rem;
        }
        .tiptap-editor .tiptap li {
          margin-bottom: 0.3rem;
        }
        .tiptap-editor .tiptap u {
          text-decoration: underline;
          text-underline-offset: 3px;
        }
        .tiptap-editor .tiptap strong {
          font-weight: 700;
        }
        .tiptap-editor .tiptap em {
          font-style: italic;
        }
        .tiptap-editor .tiptap s {
          text-decoration: line-through;
        }
      `}</style>
    </div>
  );
}
