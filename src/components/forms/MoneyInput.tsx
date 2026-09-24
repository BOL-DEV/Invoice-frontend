'use client';

import React, { ForwardedRef, forwardRef, useState, useEffect } from 'react';
import { Input } from '../ui/input';

interface MoneyInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value: number;
  onChange: (value: number) => void;
}

export const MoneyInput = forwardRef(
  ({ value, onChange, className, onFocus, onBlur, ...props }: MoneyInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const [isFocused, setIsFocused] = useState(false);
    const [displayVal, setDisplayVal] = useState<string>(() => {
      if (isNaN(value) || value === 0) return '';
      return value.toFixed(2);
    });

    // Sync external changes (when not actively focused/typing)
    useEffect(() => {
      if (!isFocused) {
        if (isNaN(value) || value === 0) {
          setDisplayVal('');
        } else {
          setDisplayVal(value.toFixed(2));
        }
      }
    }, [value, isFocused]);

    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      if (isNaN(value) || value === 0) {
        setDisplayVal('');
      } else {
        // Strip trailing .00 on focus if whole integer so user can type freely without decimal traps
        setDisplayVal(value % 1 === 0 ? String(value) : value.toFixed(2));
      }
      onFocus?.(e);
    };

    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      const cleanVal = displayVal.replace(/[^0-9.]/g, '');
      const parsed = parseFloat(cleanVal);
      if (isNaN(parsed) || parsed === 0) {
        setDisplayVal('');
        onChange(0);
      } else {
        setDisplayVal(parsed.toFixed(2));
        onChange(parsed);
      }
      onBlur?.(e);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const inputVal = e.target.value;
      // Allow only numbers and at most one decimal point
      let cleanVal = inputVal.replace(/[^0-9.]/g, '');
      const parts = cleanVal.split('.');
      if (parts.length > 2) {
        cleanVal = `${parts[0]}.${parts.slice(1).join('')}`;
      }

      setDisplayVal(cleanVal);

      if (cleanVal === '' || cleanVal === '.') {
        onChange(0);
      } else {
        const parsed = parseFloat(cleanVal);
        onChange(isNaN(parsed) ? 0 : parsed);
      }
    };

    return (
      <div className="relative flex items-center w-full">
        <span className="absolute left-3 text-muted-foreground select-none text-xs font-mono font-bold">₦</span>
        <Input
          {...props}
          ref={ref}
          type="text"
          inputMode="decimal"
          value={displayVal}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onChange={handleChange}
          className={`pl-7 text-right font-mono text-xs tabular-nums ${className}`}
        />
      </div>
    );
  }
);

MoneyInput.displayName = 'MoneyInput';
