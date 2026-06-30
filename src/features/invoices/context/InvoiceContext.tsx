'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { InvoiceItemInput, InvoiceChargeInput, InvoiceFormInput } from '../schemas';
import { basicCalculator } from '../../calculators/basic';
import { Invoice, InvoiceStatus } from '../../../types/api';

export type FocusableField = 'description' | 'quantity' | 'unitPrice';

export type FocusTarget =
  | { type: 'header'; fieldName: 'customerName' | 'customerPhone' }
  | { type: 'item'; rowIndex: number; fieldName: FocusableField };

interface InvoiceContextType {
  // State
  customerName: string;
  customerPhone: string;
  status: InvoiceStatus;
  notes: string;
  items: InvoiceItemInput[];
  charges: InvoiceChargeInput[];
  subtotal: number;
  total: number;
  totalWeight: number;
  
  // UI & Keyboard state
  focusState: FocusTarget | null;
  selectedRowIndex: number | null;
  isDirty: boolean;

  // Actions
  setCustomerName: (name: string) => void;
  setCustomerPhone: (phone: string) => void;
  setStatus: (status: InvoiceStatus) => void;
  setNotes: (notes: string) => void;
  
  // Line Items
  addItemRow: () => void;
  updateItemRow: (index: number, fields: Partial<InvoiceItemInput>) => void;
  deleteItemRow: (index: number) => void;
  
  // Charges
  addCharge: (name: string, amount: number) => void;
  updateCharge: (index: number, fields: Partial<InvoiceChargeInput>) => void;
  deleteCharge: (index: number) => void;

  // UI Focus & Navigation Actions
  setFocus: (target: FocusTarget | null) => void;
  moveFocusNext: () => void;
  setSelectedRowIndex: (index: number | null) => void;
  
  // Global Lifecycle
  resetInvoice: () => void;
  loadInvoice: (invoice: Invoice) => void;
  getFormPayload: () => InvoiceFormInput;
}

const InvoiceContext = createContext<InvoiceContextType | undefined>(undefined);

const createEmptyItem = (position: number): InvoiceItemInput => ({
  position,
  description: '',
  quantity: 0,
  unitPrice: 0,
  totalPrice: 0,
  weight: null,
});

export const InvoiceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [customerName, setCustomerNameState] = useState('');
  const [customerPhone, setCustomerPhoneState] = useState('');
  const [status, setStatusState] = useState<InvoiceStatus>('DRAFT');
  const [notes, setNotesState] = useState('');
  
  // Start with three empty rows as per workflow specification
  const [items, setItems] = useState<InvoiceItemInput[]>([
    createEmptyItem(1),
    createEmptyItem(2),
    createEmptyItem(3),
  ]);
  const [charges, setCharges] = useState<InvoiceChargeInput[]>([]);
  
  const [focusState, setFocusState] = useState<FocusTarget | null>(null);
  const [selectedRowIndex, setSelectedRowIndexState] = useState<number | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Derived financials
  const [subtotal, setSubtotal] = useState(0);
  const [total, setTotal] = useState(0);
  const [totalWeight, setTotalWeight] = useState(0);

  // Calculate totals whenever items or charges change
  useEffect(() => {
    const calculatedSubtotal = items.reduce((sum, item) => {
      return basicCalculator.add(sum, item.totalPrice);
    }, 0);

    const calculatedCharges = charges.reduce((sum, charge) => {
      return basicCalculator.add(sum, charge.amount);
    }, 0);

    const calculatedTotal = basicCalculator.round(
      basicCalculator.add(calculatedSubtotal, calculatedCharges),
      2
    );

    // Sum weights if any weight value is present on item rows
    const calculatedWeight = items.reduce((sum, item) => {
      return item.weight ? basicCalculator.add(sum, item.weight) : sum;
    }, 0);

    setSubtotal(calculatedSubtotal);
    setTotal(calculatedTotal >= 0 ? calculatedTotal : 0);
    setTotalWeight(calculatedWeight);
  }, [items, charges]);

  const setCustomerName = useCallback((val: string) => {
    setCustomerNameState(val);
    setIsDirty(true);
  }, []);

  const setCustomerPhone = useCallback((val: string) => {
    setCustomerPhoneState(val);
    setIsDirty(true);
  }, []);

  const setStatus = useCallback((val: InvoiceStatus) => {
    setStatusState(val);
    setIsDirty(true);
  }, []);

  const setNotes = useCallback((val: string) => {
    setNotesState(val);
    setIsDirty(true);
  }, []);

  const addItemRow = useCallback(() => {
    setItems((prev) => [...prev, createEmptyItem(prev.length + 1)]);
    setIsDirty(true);
  }, []);

  const updateItemRow = useCallback((index: number, fields: Partial<InvoiceItemInput>) => {
    setItems((prev) => {
      const copy = [...prev];
      if (index >= 0 && index < copy.length) {
        const item = copy[index];
        const updated = { ...item, ...fields };

        if ('quantity' in fields || 'unitPrice' in fields) {
          const qty = Number(updated.quantity) || 0;
          const price = Number(updated.unitPrice) || 0;
          updated.totalPrice = basicCalculator.round(
            basicCalculator.multiply(qty, price),
            2
          );
        }

        copy[index] = updated;
      }
      return copy;
    });
    setIsDirty(true);
  }, []);

  const deleteItemRow = useCallback((index: number) => {
    setItems((prev) => {
      const copy = prev.filter((_, i) => i !== index);
      return copy.map((item, i) => ({
        ...item,
        position: i + 1,
      }));
    });
    setIsDirty(true);
  }, []);

  const addCharge = useCallback((name: string, amount: number) => {
    setCharges((prev) => [
      ...prev,
      { name, amount, order: prev.length + 1 },
    ]);
    setIsDirty(true);
  }, []);

  const updateCharge = useCallback((index: number, fields: Partial<InvoiceChargeInput>) => {
    setCharges((prev) => {
      const copy = [...prev];
      if (index >= 0 && index < copy.length) {
        copy[index] = { ...copy[index], ...fields };
      }
      return copy;
    });
    setIsDirty(true);
  }, []);

  const deleteCharge = useCallback((index: number) => {
    setCharges((prev) => {
      const copy = prev.filter((_, i) => i !== index);
      return copy.map((charge, i) => ({
        ...charge,
        order: i + 1,
      }));
    });
    setIsDirty(true);
  }, []);

  const setFocus = useCallback((target: FocusTarget | null) => {
    setFocusState(target);
  }, []);

  const moveFocusNext = useCallback(() => {
    if (!focusState) return;

    if (focusState.type === 'header') {
      if (focusState.fieldName === 'customerName') {
        setFocus({ type: 'header', fieldName: 'customerPhone' });
      } else if (focusState.fieldName === 'customerPhone') {
        setFocus({ type: 'item', rowIndex: 0, fieldName: 'description' });
      }
    } else {
      const { rowIndex, fieldName } = focusState;
      if (fieldName === 'description') {
        setFocus({ type: 'item', rowIndex, fieldName: 'quantity' });
      } else if (fieldName === 'quantity') {
        setFocus({ type: 'item', rowIndex, fieldName: 'unitPrice' });
      } else if (fieldName === 'unitPrice') {
        // End of row. Move to next description or append row
        if (rowIndex < items.length - 1) {
          setFocus({ type: 'item', rowIndex: rowIndex + 1, fieldName: 'description' });
        } else {
          addItemRow();
          setTimeout(() => {
            setFocus({ type: 'item', rowIndex: rowIndex + 1, fieldName: 'description' });
          }, 50);
        }
      }
    }
  }, [focusState, items.length, setFocus, addItemRow]);

  const setSelectedRowIndex = useCallback((index: number | null) => {
    setSelectedRowIndexState(index);
  }, []);

  const resetInvoice = useCallback(() => {
    setCustomerNameState('');
    setCustomerPhoneState('');
    setStatusState('DRAFT');
    setNotesState('');
    setItems([
      createEmptyItem(1),
      createEmptyItem(2),
      createEmptyItem(3),
    ]);
    setCharges([]);
    setFocusState(null);
    setSelectedRowIndexState(null);
    setIsDirty(false);
  }, []);

  const loadInvoice = useCallback((invoice: Invoice) => {
    setCustomerNameState(invoice.customerName);
    setCustomerPhoneState(invoice.customerPhone || '');
    setStatusState(invoice.status);
    setNotesState(invoice.notes || '');
    setItems(
      invoice.items.map((item) => ({
        position: item.position,
        description: item.description,
        quantity: Number(item.quantity),
        unitPrice: Number(item.unitPrice),
        totalPrice: Number(item.totalPrice),
        weight: item.weight ? Number(item.weight) : null,
      }))
    );
    setCharges(
      invoice.charges.map((charge) => ({
        name: charge.name,
        amount: Number(charge.amount),
        order: charge.order,
      }))
    );
    setFocusState(null);
    setSelectedRowIndexState(null);
    setIsDirty(false);
  }, []);

  const getFormPayload = useCallback((): InvoiceFormInput => {
    // Spec: Filter out empty rows (where description is blank, or quantity/price are 0) before sending to backend
    const filledItems = items.filter(
      (item) => item.description.trim() !== '' && item.quantity > 0 && item.unitPrice > 0
    );

    return {
      customerName,
      customerPhone: customerPhone || null,
      status,
      notes: notes || null,
      subtotal,
      total,
      items: filledItems,
      charges,
    };
  }, [customerName, customerPhone, status, notes, subtotal, total, items, charges]);

  return (
    <InvoiceContext.Provider
      value={{
        customerName,
        customerPhone,
        status,
        notes,
        items,
        charges,
        subtotal,
        total,
        totalWeight,
        focusState,
        selectedRowIndex,
        isDirty,
        setCustomerName,
        setCustomerPhone,
        setStatus,
        setNotes,
        addItemRow,
        updateItemRow,
        deleteItemRow,
        addCharge,
        updateCharge,
        deleteCharge,
        setFocus,
        moveFocusNext,
        setSelectedRowIndex,
        resetInvoice,
        loadInvoice,
        getFormPayload,
      }}
    >
      {children}
    </InvoiceContext.Provider>
  );
};

export const useInvoice = () => {
  const context = useContext(InvoiceContext);
  if (!context) {
    throw new Error('useInvoice must be used within an InvoiceProvider');
  }
  return context;
};
