'use client';

import React from 'react';
import { InvoiceProvider } from '../../../../features/invoices/context/InvoiceContext';
import { InvoiceForm } from '../../../../features/invoices/components/InvoiceForm';

export default function CreateInvoicePage() {
  return (
    <InvoiceProvider>
      <InvoiceForm mode="create" />
    </InvoiceProvider>
  );
}
