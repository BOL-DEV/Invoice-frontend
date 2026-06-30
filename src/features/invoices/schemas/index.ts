import { z } from 'zod';
import { InvoiceStatus } from '../../../types/api';

export const itemSchema = z.object({
  position: z.number().int().min(1),
  description: z.string().min(1, "Item description is required"),
  quantity: z.number().positive("Quantity must be positive"),
  unitPrice: z.number().nonnegative("Unit price must be non-negative"),
  totalPrice: z.number().nonnegative("Total price must be non-negative"),
  weight: z.number().optional().nullable(),
});

export const chargeSchema = z.object({
  name: z.string().min(1, "Charge name is required"),
  amount: z.number(),
  order: z.number().int().min(1),
});

export const invoiceFormSchema = z.object({
  customerName: z.string().min(1, "Customer name is required"),
  customerPhone: z.string().optional().nullable(),
  status: z.enum(['DRAFT', 'FINALIZED', 'PRINTED', 'ARCHIVED'] as const).default('DRAFT'),
  notes: z.string().optional().nullable(),
  subtotal: z.number().nonnegative("Subtotal must be non-negative"),
  total: z.number().nonnegative("Grand total must be non-negative"),
  items: z.array(itemSchema).min(1, "Invoice must contain at least one item"),
  charges: z.array(chargeSchema).default([]),
});

export type InvoiceFormInput = z.infer<typeof invoiceFormSchema>;
export type InvoiceItemInput = z.infer<typeof itemSchema>;
export type InvoiceChargeInput = z.infer<typeof chargeSchema>;
