import React from 'react';
import { Button } from './button';
import { ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  totalItems?: number;
  itemsPerPage?: number;
  itemName?: string;
  className?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  onPageChange,
  totalItems,
  itemsPerPage,
  itemName = 'items',
  className = '',
}: PaginationProps) {
  if (totalPages <= 1 && (!totalItems || totalItems <= (itemsPerPage || 10))) {
    return null;
  }

  const startItem = totalItems && itemsPerPage ? (currentPage - 1) * itemsPerPage + 1 : null;
  const endItem = totalItems && itemsPerPage ? Math.min(currentPage * itemsPerPage, totalItems) : null;

  // Generate page numbers with ellipses
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisible = 5;

    if (totalPages <= maxVisible) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        if (!pages.includes(i)) pages.push(i);
      }

      if (currentPage < totalPages - 2) pages.push('...');
      if (!pages.includes(totalPages)) pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className={`flex flex-col sm:flex-row items-center justify-between gap-3 px-2 py-3 text-xs ${className}`}>
      {/* Items Counter */}
      <div className="text-muted-foreground font-medium">
        {totalItems !== undefined && startItem && endItem ? (
          <span>
            Showing <strong className="text-foreground font-mono">{startItem}</strong>–<strong className="text-foreground font-mono">{endItem}</strong> of{' '}
            <strong className="text-foreground font-mono">{totalItems}</strong> {itemName}
          </span>
        ) : (
          <span>
            Page <strong className="text-foreground font-mono">{currentPage}</strong> of{' '}
            <strong className="text-foreground font-mono">{totalPages}</strong>
          </span>
        )}
      </div>

      {/* Pagination Controls */}
      <div className="flex items-center space-x-1">
        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 rounded-lg border-border bg-card/60 hover:bg-secondary disabled:opacity-30"
          title="First Page"
        >
          <ChevronsLeft className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0 rounded-lg border-border bg-card/60 hover:bg-secondary disabled:opacity-30"
          title="Previous Page"
        >
          <ChevronLeft className="h-3.5 w-3.5" />
        </Button>

        <div className="flex items-center space-x-1 px-1">
          {getPageNumbers().map((p, idx) =>
            typeof p === 'number' ? (
              <Button
                key={idx}
                size="sm"
                variant={p === currentPage ? 'default' : 'outline'}
                onClick={() => onPageChange(p)}
                className={`h-8 min-w-[32px] px-2 rounded-lg font-mono text-xs transition-all ${
                  p === currentPage
                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white font-bold shadow-sm'
                    : 'border-border bg-card/60 hover:bg-secondary text-foreground'
                }`}
              >
                {p}
              </Button>
            ) : (
              <span key={idx} className="px-1.5 text-muted-foreground font-mono">
                {p}
              </span>
            )
          )}
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 rounded-lg border-border bg-card/60 hover:bg-secondary disabled:opacity-30"
          title="Next Page"
        >
          <ChevronRight className="h-3.5 w-3.5" />
        </Button>

        <Button
          size="sm"
          variant="outline"
          onClick={() => onPageChange(totalPages)}
          disabled={currentPage >= totalPages}
          className="h-8 w-8 p-0 rounded-lg border-border bg-card/60 hover:bg-secondary disabled:opacity-30"
          title="Last Page"
        >
          <ChevronsRight className="h-3.5 w-3.5" />
        </Button>
      </div>
    </div>
  );
}
