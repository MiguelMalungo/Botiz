"use client";

import { cn } from "@/lib/utils";
import { SelectHTMLAttributes, forwardRef, ChangeEvent } from "react";

interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, 'onChange'> {
  label?: string;
  error?: string;
  hint?: string;
  options: Array<{ value: string; label: string }>;
  onChange?: (value: string) => void;
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, label, error, hint, id, options, onChange, ...props }, ref) => {
    const selectId = id || label?.toLowerCase().replace(/\s+/g, "-");

    const handleChange = (e: ChangeEvent<HTMLSelectElement>) => {
      if (onChange) {
        onChange(e.target.value);
      }
    };

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={selectId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <select
          ref={ref}
          id={selectId}
          className={cn(
            "w-full rounded-md border border-border bg-background-secondary px-4 py-2.5 text-sm transition-all text-text-primary",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "hover:border-border-strong",
            "disabled:bg-background-card disabled:text-text-muted disabled:cursor-not-allowed",
            error && "border-status-error focus:border-status-error focus:ring-status-error/20",
            className
          )}
          onChange={handleChange}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-background-card text-text-primary">
              {option.label}
            </option>
          ))}
        </select>
        {hint && !error && (
          <p className="text-xs text-text-secondary">{hint}</p>
        )}
        {error && <p className="text-xs text-status-error">{error}</p>}
      </div>
    );
  }
);

Select.displayName = "Select";

export { Select };
