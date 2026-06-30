'use client';

import React, { ForwardedRef, forwardRef } from 'react';
import { Input } from '../ui/input';

interface MoneyInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export const MoneyInput = forwardRef(
  ({ value, onChange, className, ...props }: MoneyInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const formatValue = (val: number) => {
      if (isNaN(val)) return '';
      return val === 0 ? '' : val.toFixed(2);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanVal = e.target.value.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanVal);
      onChange(isNaN(parsed) ? 0 : parsed);
    };

    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-3 text-muted-foreground select-none text-sm font-mono">₦</span>
        <Input
          {...props}
          ref={ref}
          type="text"
          value={formatValue(value)}
          onChange={handleChange}
          className={`pl-7 text-right font-mono ${className}`}
        />
      </div>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
