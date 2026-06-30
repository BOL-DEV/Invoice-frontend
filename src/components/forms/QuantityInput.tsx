'use client';

import React, { ForwardedRef, forwardRef } from 'react';
import { Input } from '../ui/input';

interface QuantityInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
  decimals?: number;
}

export const QuantityInput = forwardRef(
  ({ value, onChange, decimals = 4, className, ...props }: QuantityInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const formatValue = (val: number) => {
      if (isNaN(val)) return '';
      return val === 0 ? '' : val.toString();
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanVal);
      onChange(isNaN(parsed) ? 0 : parsed);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="text"
        value={formatValue(value)}
        onChange={handleChange}
        className={`text-right font-mono ${className}`}
      />
    );
  }
);

QuantityInput.displayName = 'QuantityInput';
