'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Input } from '../ui/input';
import { useCustomerAutocomplete, AutocompleteCustomer } from '../../features/customers/hooks/useCustomerAutocomplete';

interface CustomerSearchInputProps {
  id?: string;
  value: string;
  onChange: (value: string) => void;
  onSelectCustomer: (customer: AutocompleteCustomer) => void;
  placeholder?: string;
  className?: string;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  onFocus?: () => void;
}

export const CustomerSearchInput: React.FC<CustomerSearchInputProps> = ({
  id,
  value,
  onChange,
  onSelectCustomer,
  placeholder = 'Search or enter customer name...',
  className,
  onKeyDown,
  onFocus,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const { suggestions, isLoading } = useCustomerAutocomplete(value);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleSelect = (customer: AutocompleteCustomer) => {
    onSelectCustomer(customer);
    setIsOpen(false);
  };

  return (
    <div ref={containerRef} className="relative w-full">
      <Input
        id={id}
        type="text"
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onKeyDown={onKeyDown}
        onFocus={() => {
          setIsOpen(true);
          if (onFocus) onFocus();
        }}
        placeholder={placeholder}
        className={className}
      />
      {isOpen && value.trim().length > 0 && (
        <div className="absolute z-55 w-full mt-1 bg-card text-card-foreground border border-border rounded-md shadow-lg max-h-60 overflow-auto">
          {isLoading && (
            <div className="p-3 text-sm text-muted-foreground italic">Searching customers...</div>
          )}
          {!isLoading && suggestions.length === 0 && (
            <div className="p-3 text-sm text-muted-foreground">New customer: will be indexed on save</div>
          )}
          {!isLoading && suggestions.length > 0 && (
            <ul className="divide-y divide-border">
              {suggestions.map((cust) => (
                <li key={cust.name}>
                  <button
                    type="button"
                    onClick={() => handleSelect(cust)}
                    className="w-full text-left px-4 py-2.5 text-sm hover:bg-secondary hover:text-secondary-foreground transition-colors flex justify-between items-center font-sans"
                  >
                    <span className="font-medium text-foreground">{cust.name}</span>
                    {cust.phone && <span className="text-xs text-muted-foreground font-mono">{cust.phone}</span>}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
};
