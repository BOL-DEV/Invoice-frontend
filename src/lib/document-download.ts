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
 * Prints a document PDF reliably across all desktop and mobile browsers.
 * 
 * 1. Fetches the authenticated PDF blob from the backend.
 * 2. Attempts direct iframe printing if supported by the browser engine.
 * 3. If iframe printing is blocked by out-of-process PDF sandboxes (standard modern Chrome/Safari behavior),
 *    immediately falls back to opening the printable document in a new tab/window,
 *    giving the user full access to preview and print without failing silently.
 */
export async function printDocumentPDF(endpoint: string): Promise<void> {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const blobUrl = window.URL.createObjectURL(blob);

  const isMobile =
    typeof navigator !== 'undefined' &&
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

  if (isMobile) {
    const printWin = window.open(blobUrl, '_blank');
    if (!printWin) {
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
    return;
  }

  let printTriggered = false;

  try {
    const iframe = document.createElement('iframe');
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0px';
    iframe.style.height = '0px';
    iframe.style.border = '0';
    iframe.style.visibility = 'hidden';
    iframe.src = blobUrl;

    await new Promise<void>((resolve) => {
      let resolved = false;
      const done = () => {
        if (!resolved) {
          resolved = true;
          resolve();
        }
      };

      const tryPrint = () => {
        try {
          if (iframe.contentWindow) {
            iframe.contentWindow.focus();
            iframe.contentWindow.print();
            printTriggered = true;
          }
        } catch (err) {
          console.warn('Iframe print access restricted by PDF viewer sandbox:', err);
        }
        done();
      };

      iframe.onload = () => {
        setTimeout(tryPrint, 350);
      };

      document.body.appendChild(iframe);

      // Fallback timeout in case onload doesn't fire
      setTimeout(tryPrint, 1200);

      // Cleanup iframe after print dialog interaction
      setTimeout(() => {
        try {
          if (document.body.contains(iframe)) {
            document.body.removeChild(iframe);
          }
        } catch {}
      }, 60000);
    });
  } catch (err) {
    console.warn('Iframe printing setup error:', err);
  }

  // If iframe print was blocked or failed to display the native dialog,
  // open the printable PDF window directly so the user can immediately print
  if (!printTriggered) {
    const printWindow = window.open(blobUrl, '_blank');
    if (!printWindow) {
      // If popup blocker intervened, fallback to automatic download
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = 'document.pdf';
      document.body.appendChild(link);
      link.click();
      link.remove();
    }
  }

  // Revoke object URL after 2 minutes
  setTimeout(() => {
    try {
      window.URL.revokeObjectURL(blobUrl);
    } catch {}
  }, 120000);
}
