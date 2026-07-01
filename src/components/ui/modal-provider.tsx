"use client";

import React, { createContext, useContext, useState, useCallback, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "./dialog";
import { Button } from "./button";
import { Input } from "./input";
import { Info, CheckCircle2, AlertTriangle, AlertCircle, HelpCircle } from "lucide-react";

interface ModalOptions {
  title: string;
  message: string;
  type?: 'info' | 'success' | 'warning' | 'error' | 'confirm' | 'prompt';
  confirmText?: string;
  cancelText?: string;
  defaultValue?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  resolve?: (value: any) => void;
}

interface ModalContextType {
  alert: (title: string, message: string, type?: 'info' | 'success' | 'warning' | 'error') => Promise<void>;
  confirm: (title: string, message: string, confirmText?: string, cancelText?: string) => Promise<boolean>;
  prompt: (title: string, message: string, defaultValue?: string) => Promise<string | null>;
}

const ModalContext = createContext<ModalContextType | undefined>(undefined);

export const ModalProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ModalOptions | null>(null);
  const [inputValue, setInputValue] = useState("");

  useEffect(() => {
    if (options && options.type === 'prompt') {
      setInputValue(options.defaultValue || "");
    } else {
      setInputValue("");
    }
  }, [options]);

  const alert = useCallback((
    title: string,
    message: string,
    type: 'info' | 'success' | 'warning' | 'error' = 'info'
  ) => {
    return new Promise<void>((res) => {
      setOptions({
        title,
        message,
        type,
        confirmText: "OK",
        resolve: () => res(),
      });
      setIsOpen(true);
    });
  }, []);

  const confirm = useCallback((
    title: string,
    message: string,
    confirmText = "Confirm",
    cancelText = "Cancel"
  ) => {
    return new Promise<boolean>((res) => {
      setOptions({
        title,
        message,
        type: 'confirm',
        confirmText,
        cancelText,
        resolve: res,
      });
      setIsOpen(true);
    });
  }, []);

  const prompt = useCallback((
    title: string,
    message: string,
    defaultValue = ""
  ) => {
    return new Promise<string | null>((res) => {
      setOptions({
        title,
        message,
        type: 'prompt',
        confirmText: "Submit",
        cancelText: "Cancel",
        defaultValue,
        resolve: res,
      });
      setIsOpen(true);
    });
  }, []);

  const handleClose = (value: boolean) => {
    setIsOpen(false);
    if (options?.resolve) {
      if (options.type === 'prompt') {
        options.resolve(value ? inputValue : null);
      } else {
        options.resolve(value);
      }
    }
  };

  const getIcon = () => {
    if (!options) return null;
    const size = "h-10 w-10";
    switch (options.type) {
      case 'success':
        return <CheckCircle2 className={`${size} text-emerald-500`} />;
      case 'error':
        return <AlertCircle className={`${size} text-rose-500`} />;
      case 'warning':
        return <AlertTriangle className={`${size} text-amber-500`} />;
      case 'confirm':
      case 'prompt':
        return <HelpCircle className={`${size} text-primary`} />;
      default:
        return <Info className={`${size} text-blue-500`} />;
    }
  };

  const getIconBg = () => {
    if (!options) return "";
    switch (options.type) {
      case 'success':
        return "bg-emerald-500/10";
      case 'error':
        return "bg-rose-500/10";
      case 'warning':
        return "bg-amber-500/10";
      case 'confirm':
      case 'prompt':
        return "bg-primary/10";
      default:
        return "bg-blue-500/10";
    }
  };

  return (
    <ModalContext.Provider value={{ alert, confirm, prompt }}>
      {children}
      {isOpen && options && (
        <Dialog open={isOpen} onOpenChange={(open) => { if (!open) handleClose(false); }}>
          <DialogContent className="max-w-md bg-card border border-border rounded-2xl p-6 shadow-2xl">
            <div className="flex flex-col items-center text-center space-y-4">
              <div className={`p-3.5 rounded-full ${getIconBg()}`}>
                {getIcon()}
              </div>
              <DialogHeader className="space-y-1.5 w-full">
                <DialogTitle className="text-base font-bold text-foreground">{options.title}</DialogTitle>
                <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
                  {options.message}
                </DialogDescription>
              </DialogHeader>
              
              {options.type === 'prompt' && (
                <div className="w-full pt-1">
                  <Input
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    placeholder="Provide comment or justification..."
                    className="w-full text-xs rounded-xl h-10 bg-background border border-border focus:ring-2 focus:ring-primary/20"
                    autoFocus
                  />
                </div>
              )}
            </div>
            <DialogFooter className="mt-4 flex flex-row gap-2 justify-end w-full">
              {(options.type === 'confirm' || options.type === 'prompt') && (
                <Button
                  variant="outline"
                  onClick={() => handleClose(false)}
                  className="rounded-xl px-4 h-9 text-xs font-semibold"
                >
                  {options.cancelText || "Cancel"}
                </Button>
              )}
              <Button
                onClick={() => handleClose(true)}
                className="bg-primary hover:bg-[#059669] text-white rounded-xl px-5 h-9 text-xs font-semibold shadow-sm"
              >
                {options.confirmText || "OK"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const context = useContext(ModalContext);
  if (!context) {
    throw new Error("useModal must be used within a ModalProvider");
  }
  return context;
};
