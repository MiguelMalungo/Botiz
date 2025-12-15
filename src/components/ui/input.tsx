"use client";

import { cn } from "@/lib/utils";
import { InputHTMLAttributes, forwardRef } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={cn(
            "w-full rounded-md border border-border bg-background-secondary px-4 py-2.5 text-sm transition-all text-text-primary",
            "placeholder:text-text-muted",
            "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20",
            "hover:border-border-strong",
            "disabled:bg-background-card disabled:text-text-muted disabled:cursor-not-allowed",
            error && "border-status-error focus:border-status-error focus:ring-status-error/20",
            className
          )}
          {...props}
        />
        {hint && !error && (
          <p className="text-xs text-text-secondary">{hint}</p>
        )}
        {error && <p className="text-xs text-status-error">{error}</p>}
      </div>
    );
  }
);

Input.displayName = "Input";

export { Input };
