export const API_ENDPOINTS = {
  AUTH: {
    LOGIN: '/api/auth/login',
    REFRESH: '/api/auth/refresh',
    LOGOUT: '/api/auth/logout',
  },
  USERS: {
    BASE: '/api/users',
    DETAIL: (id: string) => `/api/users/${id}`,
  },
  INVOICES: {
    BASE: '/api/invoices',
    DETAIL: (id: string) => `/api/invoices/${id}`,
  },
  CUSTOMERS: {
    AUTOCOMPLETE: '/api/customers/autocomplete',
  },
  APPROVALS: {
    BASE: '/api/approvals',
    ACTION: (id: string) => `/api/approvals/${id}/action`,
  },
  PRINTING: {
    PDF: (invoiceId: string) => `/api/printing/${invoiceId}/pdf`,
    EXCEL: (invoiceId: string) => `/api/printing/${invoiceId}/excel`,
    IMAGE: (invoiceId: string) => `/api/printing/${invoiceId}/image`,
  },
  BUSINESS: {
    BASE: '/api/business',
    DETAIL: (id: string) => `/api/business/${id}`,
  },
  ACTIVITY: {
    BASE: '/api/activity',
  },
  DASHBOARD: {
    BASE: '/api/dashboard',
  },
} as const;
