import { apiClient } from '../services/api/axios';

/**
 * Downloads a document PDF directly to the user's machine (matches the Invoice PDF download flow).
 */
export async function downloadDocumentPDF(endpoint: string, filename: string): Promise<void> {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename.endsWith('.pdf') ? filename : `${filename}.pdf`);
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

/**
 * Triggers the browser's native built-in print preview dialog directly
 * on the current screen without navigating to another page or opening a new tab.
 */
export async function printDocumentPDF(endpoint: string): Promise<void> {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const blobUrl = window.URL.createObjectURL(blob);

  // Hidden iframe with 1px width and 100px height ensures Chromium / Firefox / Edge
  // initializes the PDF rendering engine and presents the native print dialog on the current page.
  const iframe = document.createElement('iframe');
  iframe.id = `print-frame-${Date.now()}`;
  iframe.style.position = 'fixed';
  iframe.style.top = '0';
  iframe.style.left = '0';
  iframe.style.width = '1px';
  iframe.style.height = '100px';
  iframe.style.opacity = '0.001';
  iframe.style.border = 'none';
  iframe.style.margin = '0';
  iframe.style.padding = '0';
  iframe.style.pointerEvents = 'none';
  iframe.style.zIndex = '-9999';
  iframe.src = blobUrl;

  document.body.appendChild(iframe);

  let hasTriggered = false;
  const triggerNativePrint = () => {
    if (hasTriggered) return;
    hasTriggered = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Direct iframe print attempt error:', err);
    }
  };

  iframe.onload = () => {
    setTimeout(triggerNativePrint, 350);
  };

  // Fallback in case onload is delayed
  setTimeout(triggerNativePrint, 1000);

  // Keep alive during print dialog interaction, then clean up
  setTimeout(() => {
    try {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.URL.revokeObjectURL(blobUrl);
    } catch {}
  }, 120000);
}
