"use client";

import { useEffect, useRef, useCallback } from "react";
import { X, Check } from "lucide-react";

export interface ActionSheetOption {
  value: string;
  label: string;
  icon?: string;
  description?: string;
}

interface ActionSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  options: ActionSheetOption[];
  value: string;
  onChange: (value: string) => void;
}

export function ActionSheet({ open, onClose, title, options, value, onChange }: ActionSheetProps) {
  const scrollY = useRef(0);

  useEffect(() => {
    if (open) {
      scrollY.current = window.scrollY;
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      window.scrollTo(0, scrollY.current);
    }
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    },
    [onClose]
  );

  if (!open) return null;

  function handleSelect(v: string) {
    onChange(v);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true" aria-label={title} onKeyDown={handleKeyDown}>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 bg-white rounded-t-2xl shadow-xl max-h-[75vh] flex flex-col safe-bottom animate-in slide-in-from-bottom">
        {/* Handle bar */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 bg-gray-300 rounded-full" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100">
          <h3 className="text-base font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} aria-label="Close"
            className="p-2 rounded-xl hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center -mr-2">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        {/* Options */}
        <div className="overflow-y-auto flex-1 py-2">
          {options.map((opt) => (
            <button key={opt.value} onClick={() => handleSelect(opt.value)}
              className={`w-full flex items-center gap-3 px-5 py-3.5 text-left transition-colors min-h-[52px] active:bg-gray-50
                ${value === opt.value ? "bg-blue-50" : "hover:bg-gray-50"}`}>
              {opt.icon && <span className="text-xl w-8 text-center shrink-0">{opt.icon}</span>}
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-medium ${value === opt.value ? "text-blue-700" : "text-gray-900"}`}>
                  {opt.label}
                </p>
                {opt.description && (
                  <p className="text-xs text-gray-500 mt-0.5">{opt.description}</p>
                )}
              </div>
              {value === opt.value && (
                <Check className="w-5 h-5 text-blue-600 shrink-0" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
