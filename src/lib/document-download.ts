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
 * Opens document for printing in a new tab using authenticated blob URL.
 */
export async function printDocumentPDF(endpoint: string): Promise<void> {
  const response = await apiClient.get(endpoint, {
    responseType: 'blob',
  });
  const blob = new Blob([response.data], { type: 'application/pdf' });
  const url = window.URL.createObjectURL(blob);
  window.open(url, '_blank');
}
