import { apiClient } from '../services/api/axios';

/**
 * Formats a clean, professional, and consistent document filename aligned with the business:
 * e.g., "Habeeb_Tech_Invoice_INV-0001.pdf", "Habeeb_Tech_Quotation_QUO00001.pdf"
 */
export function formatDocumentFilename(
  businessName: string | undefined | null,
  docType: 'Invoice' | 'Quotation' | 'Waybill' | 'Letter',
  docNumber?: string | null,
  extension = 'pdf'
): string {
  const cleanExt = extension.replace(/^\./, '');
  const cleanNumber = docNumber?.trim().replace(/[^a-zA-Z0-9_-]/g, '_') || '';

  // Sanitize business name: replace spaces and special chars with underscores, collapse multiples
  const cleanBusiness = businessName
    ? businessName.trim().replace(/[^a-zA-Z0-9_-]+/g, '_').replace(/^_+|_+$/g, '')
    : '';

  const parts: string[] = [];
  if (cleanBusiness) parts.push(cleanBusiness);
  parts.push(docType);
  if (cleanNumber) parts.push(cleanNumber);

  return `${parts.join('_')}.${cleanExt}`;
}

/**
 * Downloads a document PDF directly to the user's machine (matches the Invoice PDF download flow).
 * If a custom filename is not passed, it reads the Content-Disposition header from the backend.
 */
export async function downloadDocumentPDF(endpoint: string, filename?: string): Promise<void> {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });

  let targetFilename = filename;
  if (!targetFilename) {
    const disposition = response.headers?.['content-disposition'];
    if (disposition) {
      const match = disposition.match(/filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/);
      if (match && match[1]) {
        targetFilename = match[1].replace(/['"]/g, '');
      }
    }
  }

  if (!targetFilename) {
    targetFilename = 'document.pdf';
  }

  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', targetFilename.endsWith('.pdf') ? targetFilename : `${targetFilename}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Triggers the browser's native built-in print preview dialog directly
 * on the current screen without navigating to another page or opening a new tab.
 */
export function printDocumentPDF(endpoint: string): Promise<void> {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await apiClient.get(endpoint, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data], { type: 'application/pdf' });
      const blobUrl = window.URL.createObjectURL(blob);

      const frameId = `print_frame_${Date.now()}`;
      const existingFrame = document.getElementById(frameId);
      if (existingFrame) {
        existingFrame.remove();
      }

      // Create an offscreen iframe with real layout dimensions so Chromium/Edge/Firefox
      // does NOT throttle or defer initializing the native PDF viewer engine.
      const iframe = document.createElement('iframe');
      iframe.id = frameId;
      iframe.setAttribute(
        'style',
        'position: fixed; right: -9999px; bottom: -9999px; width: 600px; height: 800px; border: 0; opacity: 0;'
      );

      let hasTriggered = false;
      const triggerNativePrint = () => {
        if (hasTriggered) return;
        hasTriggered = true;
        try {
          iframe.focus();
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            try {
              (iframe.contentWindow as any).document?.execCommand('print', false, null);
            } catch {
              iframe.contentWindow.print();
            }
          }
          resolve();
        } catch (err) {
          console.warn('Direct iframe print attempt error:', err);
          try {
            iframe.contentWindow?.print();
          } catch {}
          resolve();
        }
      };

      iframe.onload = () => {
        // Wait 600ms for Chromium PDFium plugin to decode and mount the PDF document
        setTimeout(triggerNativePrint, 600);
      };

      // Fallback timer in case onload is suppressed by the PDF plugin
      setTimeout(triggerNativePrint, 1400);

      // Append iframe to DOM BEFORE assigning src to ensure reliable event binding
      document.body.appendChild(iframe);
      iframe.src = blobUrl;

      // Keep alive for 2 minutes during print dialog interaction, then clean up
      setTimeout(() => {
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
          window.URL.revokeObjectURL(blobUrl);
        } catch {}
      }, 120000);
    } catch (err) {
      reject(err);
    }
  });
}
