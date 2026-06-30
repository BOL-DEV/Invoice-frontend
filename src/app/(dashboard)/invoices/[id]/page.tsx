'use client';

import React, { use } from 'react';
import { InvoiceProvider } from '../../../../features/invoices/context/InvoiceContext';
import { InvoiceForm } from '../../../../features/invoices/components/InvoiceForm';

interface EditInvoicePageProps {
  params: Promise<{ id: string }>;
}

export default function EditInvoicePage({ params }: EditInvoicePageProps) {
  const { id } = use(params);

  return (
    <InvoiceProvider>
      <InvoiceForm mode="edit" invoiceId={id} />
    </InvoiceProvider>
  );
}
