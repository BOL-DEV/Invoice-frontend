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
    dev?: Record<string, unknown>;
  };
  message?: string;
}

export interface NormalizedError {
  title: string;
  message: string;
  code: string;
  isNetworkError: boolean;
  fieldErrors?: Record<string, string>;
  dev?: Record<string, unknown>;
}

/**
 * Normalizes any API or Axios error into a user-friendly, actionable format,
 * while distinguishing development vs production error context.
 */
export function normalizeApiError(error: unknown): NormalizedError {
  const isDev = process.env.NODE_ENV !== 'production';

  // 1. Check for Axios Error
  if (error && typeof error === 'object' && 'isAxiosError' in error) {
    const axiosErr = error as AxiosError<BackendErrorResponse>;

    // Case A: Network / Connectivity failure (Server unreachable, CORS, timeout, offline)
    if (!axiosErr.response || axiosErr.code === 'ERR_NETWORK' || axiosErr.message.includes('Network Error')) {
      return {
        title: 'Network Connection Issue',
        message: 'Unable to connect to the server. Please check your internet connection and try again.',
        code: 'NETWORK_ERROR',
        isNetworkError: true,
        ...(isDev ? { dev: { originalMessage: axiosErr.message, code: axiosErr.code } } : {}),
      };
    }

    if (axiosErr.code === 'ECONNABORTED' || axiosErr.message.toLowerCase().includes('timeout')) {
      return {
        title: 'Connection Timed Out',
        message: 'The request took too long to complete. Please check your network connection and try again.',
        code: 'TIMEOUT',
        isNetworkError: true,
        ...(isDev ? { dev: { originalMessage: axiosErr.message, code: axiosErr.code } } : {}),
      };
    }

    const status = axiosErr.response.status;
    const responseData = axiosErr.response.data;
    const backendError = responseData?.error;
    const serverMessage = backendError?.message || responseData?.message;
    const serverCode = backendError?.code || `HTTP_${status}`;
    const reqUrl = axiosErr.config?.url || '';

    // Dev details extraction
    const devContext = isDev
      ? {
          status,
          code: serverCode,
          requestUrl: reqUrl,
          method: axiosErr.config?.method?.toUpperCase(),
          serverDev: backendError?.dev,
          rawError: backendError?.details,
        }
      : undefined;

    // Extract field-level errors if available
    const fieldErrors: Record<string, string> = {};
    if (Array.isArray(backendError?.details)) {
      backendError.details.forEach((item: any) => {
        if (item && item.field && item.message) {
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
          dev: devContext,
        };
      }

      case 401: {
        const isLoginRequest = reqUrl.includes('/auth/login') || reqUrl.includes('/login');
        const lowerMsg = (serverMessage || '').toLowerCase();
        const isCredentialFailure =
          isLoginRequest ||
          lowerMsg.includes('password') ||
          lowerMsg.includes('email') ||
          lowerMsg.includes('credential') ||
          lowerMsg.includes('unauthorized');

        if (isCredentialFailure) {
          return {
            title: 'Authentication Failed',
            message: serverMessage || 'Invalid email address or password. Please verify your credentials and try again.',
            code: serverCode,
            isNetworkError: false,
            dev: devContext,
          };
        }

        return {
          title: 'Session Expired',
          message: 'Your session has timed out. Please sign in again to continue.',
          code: serverCode,
          isNetworkError: false,
          dev: devContext,
        };
      }

      case 403: {
        const isSuspended = typeof serverMessage === 'string' && serverMessage.toLowerCase().includes('suspended');
        return {
          title: isSuspended ? 'Access Suspended' : 'Access Restricted',
          message: serverMessage || 'You do not have permission to perform this action. Please contact an administrator.',
          code: serverCode,
          isNetworkError: false,
          dev: devContext,
        };
      }

      case 404:
        return {
          title: 'Not Found',
          message: serverMessage || 'The requested record or resource was not found.',
          code: serverCode,
          isNetworkError: false,
          dev: devContext,
        };

      case 409:
        return {
          title: 'Duplicate Record',
          message: serverMessage || 'A record with this information already exists in the system.',
          code: serverCode,
          isNetworkError: false,
          dev: devContext,
        };

      case 429:
        return {
          title: 'Too Many Requests',
          message: serverMessage || 'Too many requests were sent in a short time. Please wait a moment before trying again.',
          code: serverCode,
          isNetworkError: false,
          dev: devContext,
        };

      case 500:
      case 502:
      case 503:
      case 504: {
        const isAiBusy = serverCode === 'AI_SERVICE_UNAVAILABLE';
        return {
          title: isAiBusy ? 'AI Service Busy' : 'Service Temporarily Unavailable',
          message: isAiBusy
            ? 'The AI extraction engine is experiencing high load. Please retry in a moment.'
            : (serverMessage && isDev ? serverMessage : 'Something went wrong on our end. This is not an issue on your side. Please try again shortly.'),
          code: serverCode,
          isNetworkError: false,
          dev: devContext,
        };
      }

      default:
        return {
          title: 'Request Failed',
          message: serverMessage || 'An unexpected issue occurred while processing your request.',
          code: serverCode,
          isNetworkError: false,
          dev: devContext,
        };
    }
  }

  // 2. Generic JavaScript Error
  if (error instanceof Error) {
    return {
      title: 'Application Error',
      message: isDev ? error.message : 'A client application error occurred. Please refresh the page.',
      code: error.name || 'APPLICATION_ERROR',
      isNetworkError: false,
      ...(isDev ? { dev: { message: error.message, stack: error.stack } } : {}),
    };
  }

  // 3. Fallback
  return {
    title: 'Unexpected Error',
    message: 'Something went wrong. Please try again shortly.',
    code: 'UNKNOWN_ERROR',
    isNetworkError: false,
    ...(isDev ? { dev: { rawError: error } } : {}),
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
