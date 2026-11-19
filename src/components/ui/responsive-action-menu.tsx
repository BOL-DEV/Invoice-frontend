'use client';

import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { MoreVertical } from 'lucide-react';
import { Button } from './button';
import { cn } from '@/lib/utils';

export interface ActionMenuItem {
  label: string;
  icon?: React.ReactNode;
  onClick?: (e: React.MouseEvent) => void;
  href?: string;
  variant?: 'default' | 'danger' | 'success' | 'primary' | 'warning';
  disabled?: boolean;
  hidden?: boolean;
  badge?: string;
}

export interface ResponsiveActionMenuProps {
  /** The desktop buttons row (hidden on mobile, visible on sm:flex) */
  children?: React.ReactNode;
  /** Action items to display in the 3-dots dropdown on mobile screens */
  items: ActionMenuItem[];
  /** Optional custom class for the desktop container */
  desktopClassName?: string;
  /** Optional custom class for the mobile trigger button */
  triggerClassName?: string;
}

export const ResponsiveActionMenu: React.FC<ResponsiveActionMenuProps> = ({
  children,
  items,
  desktopClassName,
  triggerClassName,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{ top?: number; bottom?: number; right: number }>({
    right: 16,
  });
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const visibleItems = items.filter((it) => !it.hidden);

  const updatePosition = () => {
    if (!triggerRef.current) return;
    const rect = triggerRef.current.getBoundingClientRect();
    const spaceBelow = window.innerHeight - rect.bottom;
    const estimatedHeight = Math.min(visibleItems.length * 40 + 20, 320);

    const right = Math.max(12, window.innerWidth - rect.right);

    if (spaceBelow < estimatedHeight && rect.top > estimatedHeight) {
      // Open upwards
      setMenuPosition({
        bottom: window.innerHeight - rect.top + 6,
        right,
      });
    } else {
      // Open downwards
      setMenuPosition({
        top: rect.bottom + 6,
        right,
      });
    }
  };

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (!isOpen) {
      updatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Close on outside click, escape, or window scroll/resize
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    const handleScroll = () => {
      setIsOpen(false);
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleScroll, true);
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScroll, true);
      window.removeEventListener('resize', handleScroll);
    };
  }, [isOpen]);

  const getItemClasses = (variant?: ActionMenuItem['variant']) => {
    switch (variant) {
      case 'danger':
        return 'text-rose-600 dark:text-rose-400 hover:bg-rose-500/15 active:bg-rose-500/25';
      case 'success':
        return 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/15 active:bg-emerald-500/25';
      case 'primary':
        return 'text-primary hover:bg-primary/10 active:bg-primary/20';
      case 'warning':
        return 'text-amber-600 dark:text-amber-400 hover:bg-amber-500/15 active:bg-amber-500/25';
      default:
        return 'text-foreground hover:bg-secondary active:bg-secondary/80';
    }
  };

  return (
    <>
      {/* 1. Desktop: Full inline buttons (hidden on mobile, visible on sm+) */}
      {children && (
        <div className={cn('hidden sm:flex items-center justify-end space-x-1.5', desktopClassName)}>
          {children}
        </div>
      )}

      {/* 2. Mobile: 3-dots trigger button (visible on mobile, hidden on sm+) */}
      <div className="sm:hidden flex items-center justify-end">
        <Button
          ref={triggerRef}
          type="button"
          variant="ghost"
          size="sm"
          onClick={handleToggle}
          className={cn(
            'h-8 w-8 p-0 rounded-xl hover:bg-secondary text-muted-foreground hover:text-foreground cursor-pointer transition-colors',
            isOpen && 'bg-secondary text-foreground',
            triggerClassName
          )}
          title="Actions"
          aria-label="Actions menu"
        >
          <MoreVertical className="h-4 w-4" />
        </Button>
      </div>

      {/* 3. Mobile Portal Dropdown Menu */}
      {mounted &&
        isOpen &&
        createPortal(
          <>
            {/* Backdrop overlay */}
            <div
              className="fixed inset-0 z-[9998] bg-black/20 backdrop-blur-[1px] sm:hidden"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              aria-hidden="true"
            />

            {/* Floating Dropdown Card */}
            <div
              style={{
                top: menuPosition.top !== undefined ? `${menuPosition.top}px` : undefined,
                bottom: menuPosition.bottom !== undefined ? `${menuPosition.bottom}px` : undefined,
                right: `${menuPosition.right}px`,
              }}
              className="fixed z-[9999] min-w-[190px] max-w-[280px] bg-popover/95 backdrop-blur-md text-popover-foreground border border-border shadow-2xl rounded-2xl p-1.5 space-y-0.5 sm:hidden animate-in fade-in-0 zoom-in-95 duration-150"
              onClick={(e) => e.stopPropagation()}
            >
              {visibleItems.length === 0 ? (
                <div className="px-3 py-2 text-xs text-muted-foreground italic text-center">
                  No actions available
                </div>
              ) : (
                visibleItems.map((item, idx) => {
                  const content = (
                    <>
                      {item.icon && <span className="shrink-0">{item.icon}</span>}
                      <span className="flex-1 truncate">{item.label}</span>
                      {item.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-secondary text-muted-foreground ml-auto shrink-0">
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  if (item.href) {
                    return (
                      <Link
                        key={idx}
                        href={item.href}
                        onClick={(e) => {
                          e.stopPropagation();
                          setIsOpen(false);
                        }}
                        className={cn(
                          'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer',
                          getItemClasses(item.variant),
                          item.disabled && 'opacity-50 pointer-events-none'
                        )}
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={item.disabled}
                      onClick={(e) => {
                        e.stopPropagation();
                        setIsOpen(false);
                        item.onClick?.(e);
                      }}
                      className={cn(
                        'w-full flex items-center space-x-2.5 px-3 py-2 rounded-xl text-xs font-semibold transition-colors text-left cursor-pointer',
                        getItemClasses(item.variant),
                        item.disabled && 'opacity-50 pointer-events-none'
                      )}
                    >
                      {content}
                    </button>
                  );
                })
              )}
            </div>
          </>,
          document.body
        )}
    </>
  );
};
