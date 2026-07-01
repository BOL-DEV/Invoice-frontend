export type Role = 'ADMIN' | 'APPRENTICE';

export interface User {
  id: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiValidationErrorDetail {
  field: string;
  message: string;
}

export interface ApiError {
  success: boolean;
  error: {
    code: string;
    message: string;
    details?: ApiValidationErrorDetail[];
  };
}

export interface LoginResult {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface RefreshResult {
  accessToken: string;
}

export interface BusinessSettings {
  id: string;
  businessName: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  receiptPrefix: string;
  defaultVatPercentage: number;
  defaultWhtPercentage: number;
  nextInvoiceNumber: number;
  createdAt: string;
  updatedAt: string;
}

export interface ActivityLog {
  id: string;
  userId: string;
  action: string;
  details: Record<string, unknown> | null;
  ipAddress: string | null;
  createdAt: string;
  user?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export type InvoiceStatus = 'DRAFT' | 'FINALIZED' | 'PRINTED' | 'ARCHIVED';

export interface InvoiceItem {
  id: string;
  invoiceId: string;
  position: number;
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  weight: number | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvoiceCharge {
  id: string;
  invoiceId: string;
  name: string;
  amount: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerName: string;
  customerPhone: string | null;
  creatorId: string;
  status: InvoiceStatus;
  subtotal: number;
  total: number;
  notes: string | null;
  isDeleted: boolean;
  createdAt: string;
  updatedAt: string;
  items: InvoiceItem[];
  charges: InvoiceCharge[];
  creator: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
}

export type ApprovalType = 'EDIT' | 'PRINT' | 'DELETE';
export type ApprovalStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ApprovalRequest {
  id: string;
  invoiceId: string;
  requesterId: string;
  approverId: string | null;
  type: ApprovalType;
  status: ApprovalStatus;
  reason: string;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
  invoice?: {
    id: string;
    invoiceNumber: string;
    customerName: string;
  };
  requester?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  };
  approver?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
  } | null;
}

export interface DashboardStats {
  invoiceCounts: {
    total: number;
    finalized: number;
    draft: number;
  };
  totalSales: number;
  pendingApprovalsCount: number;
  cashiersCount: number;
  salesTrend: Array<{
    date: string;
    sales: number;
  }>;
}

export interface AxiosErrorLike {
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}
