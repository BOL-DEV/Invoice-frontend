'use client';

import React, { ForwardedRef, forwardRef } from 'react';
import { Input } from '../ui/input';

interface PhoneInputProps extends Omit<React.ComponentProps<'input'>, 'value' | 'onChange'> {
  value: string;
  onChange: (value: string) => void;
}

export const PhoneInput = forwardRef(
  ({ value, onChange, className, ...props }: PhoneInputProps, ref: ForwardedRef<HTMLInputElement>) => {
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const cleanVal = e.target.value.replace(/[^0-9+]/g, '');
      onChange(cleanVal);
    };

    return (
      <Input
        {...props}
        ref={ref}
        type="tel"
        value={value}
        onChange={handleChange}
        placeholder="e.g. 08012345678"
        className={`font-mono ${className}`}
      />
    );
  }
);

PhoneInput.displayName = 'PhoneInput';
