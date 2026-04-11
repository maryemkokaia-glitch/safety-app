"use client";

import { cn } from "@/lib/utils/cn";
import { SelectHTMLAttributes, forwardRef, useState } from "react";
import { ActionSheet, type ActionSheetOption } from "./action-sheet";
import { ChevronDown } from "lucide-react";

interface SelectProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string; icon?: string; description?: string }[];
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, id, options, value, onChange, ...props }, ref) => {
    const [sheetOpen, setSheetOpen] = useState(false);
    const selectedLabel = options.find((o) => o.value === value)?.label || options[0]?.label || "";

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={id} className="block text-sm font-semibold text-gray-700 mb-1.5">
            {label}
          </label>
        )}

        {/* Mobile: tap to open action sheet */}
        <button
          type="button"
          onClick={() => setSheetOpen(true)}
          className={cn(
            "w-full rounded-xl border border-gray-200 px-4 py-3.5 text-left text-base shadow-sm min-h-[52px] bg-white flex items-center justify-between gap-2 active:bg-gray-50 transition-colors",
            error && "border-red-500",
            className
          )}
        >
          <span className={cn("truncate", !value && "text-gray-400")}>
            {selectedLabel}
          </span>
          <ChevronDown className="w-4 h-4 text-gray-400 shrink-0" />
        </button>

        {/* Hidden native select for form compatibility */}
        <select
          ref={ref}
          id={id}
          value={value}
          onChange={onChange}
          className="sr-only"
          tabIndex={-1}
          aria-hidden="true"
          {...props}
        >
          {options.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>

        {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}

        {/* Action sheet */}
        <ActionSheet
          open={sheetOpen}
          onClose={() => setSheetOpen(false)}
          title={label || ""}
          options={options.map((o) => ({ value: o.value, label: o.label, icon: o.icon, description: o.description }))}
          value={String(value || "")}
          onChange={(v) => {
            // Create a synthetic change event
            const syntheticEvent = {
              target: { value: v },
              currentTarget: { value: v },
            } as React.ChangeEvent<HTMLSelectElement>;
            onChange?.(syntheticEvent);
            setSheetOpen(false);
          }}
        />
      </div>
    );
  }
);

Select.displayName = "Select";
export { Select };
