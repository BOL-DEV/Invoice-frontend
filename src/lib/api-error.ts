import { AxiosError } from 'axios';
import { UseFormSetError, FieldValues, Path } from 'react-hook-form';

export interface ApiErrorDetail {
  field?: string;
  message: string;
}

export interface BackendErrorResponse {
  success?: boolean;
  error?: {
    code?: string;
    message?: string;
    details?: ApiErrorDetail[] | unknown;
  };
  message?: string;
}

export interface NormalizedError {
  title: string;
  message: string;
  code: string;
  isNetworkError: boolean;
  fieldErrors?: Record<string, string>;
}

/**
 * Normalizes any API or Axios error into a user-friendly, actionable format.
 */
export function normalizeApiError(error: unknown): NormalizedError {
  // 1. Check for Axios Error
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosErr = error as AxiosError<BackendErrorResponse>;

    // Case A: Network / Connectivity failure (Server unreachable, CORS, timeout, offline)
    if (!axiosErr.response || axiosErr.code === 'ERR_NETWORK' || axiosErr.message.includes('Network Error')) {
      return {
        title: 'Network Connection Issue',
        message: 'Network connection issue. Unable to connect to the server. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      };
    }

    if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.toLowerCase().includes('timeout')) {
      return {
        title: 'Connection Timed Out',
        message: 'The request took too long to complete. Please check your internet connection and try again.',
        code: 'TIMEOUT',
        isNetworkError: true,
      };
    }

    const status = axiosErr.response.status;
    const responseData = axiosErr.response.data;
    const backendError = responseData?.error;
    const serverMessage = backendError?.message || responseData?.message;
    const serverCode = backendError?.code || `HTTP_${status}`;

    // Extract field-level errors if available
    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(backendError?.details)) {
      backendError.details.forEach((item) => {
        if (item.field && item.message) {
          fieldErrors[item.field] = item.message;
        }
      });
    }

    // Specific HTTP status code mappings
    switch (status) {
      case 400:
      case 422: {
        const fieldDetailsStr = Object.values(fieldErrors).join(', ');
        const inputHint = fieldDetailsStr || serverMessage || 'Please verify the submitted details and correct any invalid fields.';
        return {
          title: 'Input Required',
          message: inputHint,
          code: serverCode,
          isNetworkError: false,
          fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        };
      }

      case 401:
        return {
          title: 'Session Expired',
          message: 'Your session has expired or credentials are invalid. Please sign in again.',
          code: serverCode,
          isNetworkError: false,
        };

      case 403:
        return {
          title: 'Access Restricted',
          message: serverMessage || 'You do not have permission to perform this action. Please contact an administrator.',
          code: serverCode,
          isNetworkError: false,
        };

      case 404:
        return {
          title: 'Not Found',
          message: serverMessage || 'The requested record or resource was not found.',
          code: serverCode,
          isNetworkError: false,
        };

      case 409:
        return {
          title: 'Duplicate Record',
          message: serverMessage || 'A record with this information already exists in the system.',
          code: serverCode,
          isNetworkError: false,
        };

      case 422:
        return {
          title: 'Invalid Document',
          message: serverMessage || 'The uploaded file format or content is not supported. Please upload a valid invoice, receipt, or order list.',
          code: serverCode,
          isNetworkError: false,
        };

      case 429:
        return {
          title: 'Too Many Requests',
          message: serverMessage || 'Too many requests were sent in a short time. Please wait a moment before trying again.',
          code: serverCode,
          isNetworkError: false,
        };

      case 500:
      case 502:
      case 503:
      case 504: {
        // For 5xx backend errors: assure user that the error is on our end, not their fault
        const isAiBusy = serverCode === 'AI_SERVICE_UNAVAILABLE';
        const serverHint = isAiBusy
          ? (serverMessage || 'The document processing service is temporarily busy. Please try again in a few moments.')
          : 'Something went wrong on our end. This is not an issue on your side. Please try again shortly or contact support if it persists.';
        return {
          title: 'Server Error',
          message: serverHint,
          code: serverCode,
          isNetworkError: false,
        };
      }

      default:
        return {
          title: 'Operation Failed',
          message: serverMessage || 'An unexpected issue occurred. Please try again.',
          code: serverCode,
          isNetworkError: false,
          fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        };
    }
  }

  // 2. Standard JS Error
  if (error instanceof Error) {
    if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
      return {
        title: 'Network Issue',
        message: 'Network connection issue. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
      };
    }
    return {
      title: 'Application Error',
      message: error.message,
      code: 'CLIENT_ERROR',
      isNetworkError: false,
    };
  }

  // 3. Fallback
  return {
    title: 'Unexpected Error',
    message: 'Something went wrong on our end. This is not an issue on your side. Please try again shortly.',
    code: 'UNKNOWN_ERROR',
    isNetworkError: false,
  };
}

/**
 * Returns a clean, user-facing error message string.
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  const normalized = normalizeApiError(error);
  return normalized.message || fallbackMessage;
}

/**
 * Returns a normalized title, message, and variant for UI dialogs and modals.
 */
export function getErrorDialog(
  error: unknown,
  defaultTitle: string = 'Operation Failed',
  fallbackMessage: string = 'Could not complete request'
): { title: string; message: string; variant: 'error' | 'warning' } {
  const normalized = normalizeApiError(error);
  const variant: 'error' | 'warning' = normalized.code.startsWith('HTTP_4') || normalized.code === 'VALIDATION_ERROR' ? 'warning' : 'error';
  return {
    title: normalized.title || defaultTitle,
    message: normalized.message || fallbackMessage,
    variant,
  };
}

/**
 * Automatically applies normalized API field errors to React Hook Form
 */
export function applyApiFieldErrors<T extends FieldValues>(
  error: NormalizedError,
  setError: UseFormSetError<T>
): boolean {
  if (!error.fieldErrors) return false;

  let hasApplied = false;
  for (const [field, message] of Object.entries(error.fieldErrors)) {
    setError(field as Path<T>, {
      type: 'server',
      message,
    });
    hasApplied = true;
  }
  return hasApplied;
}
