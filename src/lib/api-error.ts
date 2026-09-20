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
        title: 'Connection Lost',
        message: 'Unable to connect to the Lao Steel Ventures server. Please check your network connection or verify that the server is online.',
        code: 'NETWORK_ERROR',
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
        return {
          title: 'Validation Error',
          message: serverMessage || 'Please check your submitted details and try again.',
          code: serverCode,
          isNetworkError: false,
          fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        };

      case 401:
        return {
          title: 'Sign In Failed',
          message: serverMessage || 'Incorrect email address or password. Please verify your credentials.',
          code: serverCode,
          isNetworkError: false,
        };

      case 403:
        return {
          title: 'Access Restricted',
          message: serverMessage || 'You do not have permission to perform this action. Contact an administrator.',
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

      case 429:
        return {
          title: 'Too Many Requests',
          message: 'Too many attempts. Please wait a moment before trying again.',
          code: serverCode,
          isNetworkError: false,
        };

      case 500:
      case 502:
      case 503:
      case 504:
        return {
          title: 'Server Error',
          message: 'A temporary issue occurred on the Lao Steel Ventures server. Please try again shortly.',
          code: serverCode,
          isNetworkError: false,
        };

      default:
        return {
          title: 'Operation Failed',
          message: serverMessage || 'An unexpected error occurred. Please try again.',
          code: serverCode,
          isNetworkError: false,
          fieldErrors: Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined,
        };
    }
  }

  // 2. Standard JS Error
  if (error instanceof Error) {
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
    message: 'An unknown error occurred. Please try again.',
    code: 'UNKNOWN_ERROR',
    isNetworkError: false,
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
