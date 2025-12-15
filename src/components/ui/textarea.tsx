"use client";

import { cn } from "@/lib/utils";
import { TextareaHTMLAttributes, forwardRef } from "react";

interface TextareaProps extends TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string;
  error?: string;
  hint?: string;
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, hint, id, ...props }, ref) => {
    const textareaId = id || label?.toLowerCase().replace(/\s+/g, "-");

    return (
      <div className="space-y-1">
        {label && (
          <label
            htmlFor={textareaId}
            className="block text-sm font-medium text-text-primary"
          >
            {label}
          </label>
        )}
        <textarea
          ref={ref}
          id={textareaId}
          className={cn(
            "w-full rounded-md border border-border bg-background-secondary px-4 py-2.5 text-sm transition-all resize-none text-text-primary",
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

Textarea.displayName = "Textarea";

export { Textarea };
