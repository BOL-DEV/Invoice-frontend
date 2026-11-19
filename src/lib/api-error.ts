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
        const isTenantUnauthorized =
          lowerMsg.includes('not authorized') ||
          lowerMsg.includes('different organization') ||
          lowerMsg.includes('portal');

        if (isTenantUnauthorized) {
          return {
            title: 'Unauthorized Access',
            message: serverMessage || 'You are not authorized to use this portal.',
            code: serverCode,
            isNetworkError: false,
            dev: devContext,
          };
        }

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
        const lowerMsg = (serverMessage || '').toLowerCase();
        const isSuspended = lowerMsg.includes('suspended');
        const isTenantUnauthorized =
          lowerMsg.includes('not authorized') ||
          lowerMsg.includes('different organization') ||
          lowerMsg.includes('portal');

        return {
          title: isSuspended ? 'Access Suspended' : isTenantUnauthorized ? 'Unauthorized Access' : 'Access Restricted',
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
 * Translates raw, technical, and developer error messages into simple, clear layman wording.
 */
export function toLaymanMessage(msg: string): string {
  if (!msg || typeof msg !== 'string') return 'Something went wrong. Please try again.';
  const lower = msg.toLowerCase();

  // 1. Prisma & Database errors
  if (lower.includes('unique constraint') || lower.includes('p2002')) {
    if (lower.includes('invoicenumber') || lower.includes('receiptprefix')) {
      return 'An invoice with this number already exists.';
    }
    if (lower.includes('quotationnumber')) {
      return 'A quotation with this number already exists.';
    }
    if (lower.includes('waybillnumber')) {
      return 'A waybill with this number already exists.';
    }
    if (lower.includes('letternumber')) {
      return 'A letter with this reference number already exists.';
    }
    if (lower.includes('email')) {
      return 'An account with this email address already exists.';
    }
    if (lower.includes('slug')) {
      return 'This company address identifier is already taken.';
    }
    if (lower.includes('phone')) {
      return 'This phone number is already registered.';
    }
    return 'This record already exists in the system.';
  }

  if (lower.includes('foreign key') || lower.includes('p2003')) {
    return 'This item is linked to other records and cannot be deleted or modified.';
  }

  if (
    lower.includes('record to update not found') ||
    lower.includes('record to delete does not exist') ||
    lower.includes('p2025')
  ) {
    return 'The requested record could not be found.';
  }

  if (lower.includes('database') || lower.includes('prisma') || lower.includes('econnrefused')) {
    return 'Unable to reach the server. Please check your connection and try again.';
  }

  // 2. Payment & Transfer errors
  if (
    lower.includes('expected amount does not match') ||
    lower.includes('amount mismatch') ||
    lower.includes('merchant_amount')
  ) {
    return 'The amount transferred does not match the invoice amount.';
  }
  if (
    lower.includes('virtual payment account expired') ||
    lower.includes('account expired') ||
    lower.includes('transfer session expired')
  ) {
    return 'The transfer account expired before payment arrived.';
  }
  if (
    lower.includes('rejected by sending bank') ||
    lower.includes('transaction rejected') ||
    lower.includes('payment transfer was rejected')
  ) {
    return 'Your bank was unable to complete this transfer.';
  }
  if (lower.includes('insufficient funds') || lower.includes('insufficient balance')) {
    return 'Insufficient funds in your account.';
  }

  // 3. Network & Connection errors
  if (lower.includes('network error') || lower.includes('err_network')) {
    return 'Please check your internet connection and try again.';
  }
  if (lower.includes('timeout') || lower.includes('econnaborted')) {
    return 'The connection timed out. Please try again.';
  }
  if (lower.includes('internal server error') || lower.includes('status code 500')) {
    return 'Something went wrong on our end. Please try again in a moment.';
  }
  if (lower.includes('status code 404')) {
    return 'The requested item could not be found.';
  }
  if (lower.includes('status code 403')) {
    return 'You do not have permission to perform this action.';
  }
  if (lower.includes('status code 401') || lower.includes('jwt expired') || lower.includes('token expired')) {
    return 'Your session has expired. Please sign in again.';
  }

  // 4. Form validation errors
  if (lower.includes('string must contain at least') || lower.includes('required_error')) {
    return 'Please fill in all required fields.';
  }
  if (lower.includes('expected number, received string')) {
    return 'Please enter a valid number.';
  }
  if (lower.includes('invalid email')) {
    return 'Please enter a valid email address.';
  }
  if (lower.includes('invalid uuid') || lower.includes('invalid id')) {
    return 'Invalid item selected.';
  }

  // 5. Clean technical error wrappers
  const cleaned = msg
    .replace(/^(AxiosError|Error|TypeError|ReferenceError):\s*/i, '')
    .replace(/^Request failed with status code \d+:\s*/i, '')
    .replace(/\[LENCO-WEBHOOK\]|\[SQUAD-WEBHOOK\]/gi, '')
    .trim();

  return cleaned || 'Something went wrong. Please try again.';
}

/**
 * Translates raw technical modal titles into user-friendly headers.
 */
export function toLaymanTitle(title: string): string {
  if (!title) return 'Notice';
  const lower = title.toLowerCase();

  if (lower === 'error') {
    return 'Something Went Wrong';
  }
  if (lower.includes('network error') || lower.includes('network connection issue')) {
    return 'Connection Problem';
  }
  if (lower.includes('connection timed out')) {
    return 'Connection Timed Out';
  }
  if (lower.includes('validation error') || lower.includes('input error')) {
    return 'Missing Information';
  }
  if (lower.includes('pdf engine execution error') || lower.includes('failed to generate test pdf')) {
    return 'Preview Failed';
  }
  if (lower.includes('delete failed')) {
    return 'Could Not Delete';
  }
  if (lower.includes('action failed') || lower.includes('operation failed') || lower.includes('request failed') || lower.includes('execution error')) {
    return 'Could Not Complete';
  }
  if (lower.includes('update failed')) {
    return 'Could Not Save Changes';
  }
  if (lower.includes('initialization failed')) {
    return 'Setup Failed';
  }
  if (lower.includes('authentication failed')) {
    return 'Sign In Failed';
  }
  if (lower.includes('duplicate record')) {
    return 'Already Exists';
  }
  if (lower.includes('service temporarily unavailable') || lower.includes('unexpected error') || lower.includes('application error')) {
    return 'Something Went Wrong';
  }
  return title;
}

/**
 * Returns a clean, user-facing error message string.
 */
export function getErrorMessage(error: unknown, fallbackMessage: string = 'An unexpected error occurred'): string {
  const normalized = normalizeApiError(error);
  return toLaymanMessage(normalized.message || fallbackMessage);
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
    title: toLaymanTitle(normalized.title || defaultTitle),
    message: toLaymanMessage(normalized.message || fallbackMessage),
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
