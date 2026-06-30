import React from 'react';
import { useInvoice, FocusableField } from '../context/InvoiceContext';

export const useInvoiceRows = () => {
  const {
    items,
    addItemRow,
    updateItemRow,
    deleteItemRow,
    focusState,
    setFocus,
    moveFocusNext,
  } = useInvoice();

  const handleKeyDown = (
    e: React.KeyboardEvent<HTMLInputElement>,
    rowIndex: number,
    fieldName: FocusableField
  ) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      moveFocusNext();
    }
  };

  return {
    rows: items,
    addRow: addItemRow,
    updateRow: updateItemRow,
    deleteRow: deleteItemRow,
    focusState,
    setFocus,
    handleKeyDown,
  };
};
