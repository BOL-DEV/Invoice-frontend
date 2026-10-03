export type Role = 'SUPER_ADMIN' | 'ADMIN' | 'APPRENTICE';

export interface User {
  id: string;
  businessId?: string;
  email: string;
  role: Role;
  firstName: string;
  lastName: string;
  isSuspended?: boolean;
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
  slug?: string;
  tagline?: string;
  address: string;
  phone: string;
  email: string;
  logo: string | null;
  tin?: string;
  cacOrRegNumber?: string;
  receiptPrefix: string;
  defaultVatPercentage: number;
  defaultWhtPercentage: number;
  nextInvoiceNumber: number;
  receiptTemplateId?: string;
  onboardingStatus?: OnboardingStatus;
  subscription?: Subscription | null;
  createdAt: string;
  updatedAt: string;
}

export type PlanType = 'STARTER' | 'BUSINESS' | 'ENTERPRISE';
export type BillingMode = 'SUBSCRIPTION' | 'COMPLIMENTARY';
export type SubscriptionStatus = 'ACTIVE' | 'TRIALING' | 'PAST_DUE' | 'CANCELED' | 'INCOMPLETE';

export interface BusinessDomain {
  id: string;
  businessId: string;
  domain: string;
  isPrimary: boolean;
  isCustom: boolean;
  createdAt: string;
}

export interface Subscription {
  id: string;
  businessId: string;
  plan: PlanType;
  billingMode: BillingMode;
  status: SubscriptionStatus;
  maxStaffCount: number;
  hasCustomDomain: boolean;
  hasMultipleBranches: boolean;
  hasAdvancedReports: boolean;
  startDate: string;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionDetails {
  subscription: Subscription;
  usage: {
    staffCount: number;
    maxStaffCount: number;
  };
  domains: BusinessDomain[];
  capabilities: {
    aiExtraction: boolean;
    customDomain: boolean;
    multipleBranches: boolean;
    advancedReports: boolean;
  };
}

export interface TenantBranding {
  business: BusinessSettings | null;
  isCustomDomain: boolean;
  plan?: PlanType;
}

export type OnboardingStatus = 'PENDING' | 'IN_PROGRESS' | 'ACTIVE' | 'SUSPENDED';

export interface TenantSummary extends BusinessSettings {
  onboardingStatus: OnboardingStatus;
  subscription: Subscription | null;
  domains: BusinessDomain[];
  stats: {
    userCount: number;
    invoiceCount: number;
    customerCount: number;
  };
}

export interface OnboardTenantInput {
  businessName: string;
  slug: string;
  address: string;
  phone: string;
  email: string;
  receiptPrefix?: string;
  tagline?: string | null;
  plan: PlanType;
  billingMode: BillingMode;
  maxStaffCount: number;
  hasCustomDomain: boolean;
  hasMultipleBranches: boolean;
  hasAdvancedReports: boolean;
  customDomain?: string | null;
  devDomain?: string | null;
  adminFirstName: string;
  adminLastName: string;
  adminEmail: string;
  adminPassword: string;
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

export interface InvoiceShare {
  id: string;
  invoiceId: string;
  sharedWithId: string;
  sharedWith: {
    id: string;
    firstName: string;
    lastName: string;
  };
  sharedById: string;
  sharedBy: {
    id: string;
    firstName: string;
    lastName: string;
  };
  notes: string | null;
  createdAt: string;
}

export interface Invoice {
  id: string;
  businessId?: string;
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
  shares?: InvoiceShare[];
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
  message?: string;
  response?: {
    data?: {
      error?: {
        message?: string;
      };
    };
  };
}

export interface InvoiceRevenueSummary {
  today: number;
  thisWeek: number;
  thisMonth: number;
  thisYear: number;
}

export interface ExtractedItem {
  description: string;
  quantity: number;
  unitPrice: number;
  totalPrice?: number;
  weight?: number | null;
  originalAmount?: number | null;
  wasAdjusted?: boolean;
  adjustmentMessage?: string | null;
}

export interface ExtractedCharge {
  name: string;
  amount: number;
}

export interface ExtractedDiscrepancy {
  row: number;
  description: string;
  originalAmount: number;
  resolvedAmount: number;
  message: string;
}

export interface ExtractedInvoiceData {
  customerName?: string | null;
  customerPhone?: string | null;
  items: ExtractedItem[];
  charges?: ExtractedCharge[];
  discrepancies?: ExtractedDiscrepancy[];
  notes?: string | null;
}

export interface PlatformOverview {
  totalBusinesses: number;
  activeBusinesses: number;
  suspendedBusinesses: number;
  totalUsers: number;
  totalInvoices: number;
  totalPlatformVolume: number;
  planCounts: {
    STARTER: number;
    BUSINESS: number;
    ENTERPRISE: number;
  };
  billingModeCounts: {
    SUBSCRIPTION: number;
    COMPLIMENTARY: number;
  };
  businessesByPlan: {
    STARTER: TenantSummary[];
    BUSINESS: TenantSummary[];
    ENTERPRISE: TenantSummary[];
  };
  businessesByBilling: {
    SUBSCRIPTION: TenantSummary[];
    COMPLIMENTARY: TenantSummary[];
  };
  allBusinesses: TenantSummary[];
}

export interface TenantFullDetails {
  business: BusinessSettings;
  subscription: Subscription | null;
  domains: BusinessDomain[];
  stats: {
    userCount: number;
    invoiceCount: number;
    customerCount: number;
    totalInvoiceVolume: number;
  };
  users: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    isSuspended: boolean;
    createdAt: string;
  }>;
  recentInvoices: Array<{
    id: string;
    invoiceNumber: string;
    customerName: string;
    customerPhone: string | null;
    status: string;
    subtotal: number;
    total: number;
    notes?: string | null;
    createdAt: string;
    creator: {
      id?: string;
      firstName: string;
      lastName: string;
      email: string;
    };
    items?: Array<{
      id: string;
      description: string;
      quantity: number;
      unitPrice: number;
      totalPrice: number;
      weight: number | null;
    }>;
    charges?: Array<{
      id: string;
      name: string;
      amount: number;
      order?: number;
    }>;
  }>;
  recentLogs: Array<{
    id: string;
    action: string;
    createdAt: string;
    ipAddress: string | null;
    user: {
      firstName: string;
      lastName: string;
      email: string;
    } | null;
  }>;
}

