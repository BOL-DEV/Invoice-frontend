import { useInvoice } from '../context/InvoiceContext';

export const useInvoiceCalculations = () => {
  const { subtotal, total, totalWeight, charges } = useInvoice();

  const vatCharge = charges.find((c) => c.name.toUpperCase() === 'VAT');
  const discountCharge = charges.find((c) => c.amount < 0);

  return {
    subtotal,
    total,
    totalWeight,
    vatAmount: vatCharge ? vatCharge.amount : 0,
    discountAmount: discountCharge ? discountCharge.amount : 0,
    formattedSubtotal: subtotal.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    formattedTotal: total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }),
    formattedWeight: `${totalWeight.toFixed(3)} kg/tons`,
  };
};
