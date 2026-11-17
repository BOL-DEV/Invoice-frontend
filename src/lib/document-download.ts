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
 * with document preview and destination options (Save as PDF / Printer)
 * on the current screen, without opening a new tab that triggers Adobe extensions.
 */
export async function printDocumentPDF(endpoint: string): Promise<void> {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);

  // 1px low-opacity iframe ensures browser's native print window appears on the current screen
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '1px';
  iframe.style.height = '1px';
  iframe.style.opacity = '0.01';
  iframe.style.border = '0';
  iframe.src = url;

  document.body.appendChild(iframe);

  let hasPrinted = false;
  const triggerPrint = () => {
    if (hasPrinted) return;
    hasPrinted = true;
    try {
      iframe.contentWindow?.focus();
      iframe.contentWindow?.print();
    } catch (err) {
      console.warn('Direct iframe print attempt error:', err);
    }
  };

  iframe.onload = () => {
    setTimeout(triggerPrint, 350);
  };

  // Fallback in case PDF plugin in iframe does not dispatch onload event
  setTimeout(triggerPrint, 1200);

  // Keep alive during print dialog interaction, then clean up
  setTimeout(() => {
    try {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
      window.URL.revokeObjectURL(url);
    } catch {}
  }, 120000);
}
