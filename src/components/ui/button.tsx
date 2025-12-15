"use client";

import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes, forwardRef } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-md font-semibold transition-all focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-background-app disabled:opacity-50 disabled:cursor-not-allowed",
          {
            "bg-gradient-to-br from-primary to-primary-dark text-background-app hover:from-primary-light hover:to-primary shadow-button-primary hover:shadow-button-primary-hover hover:-translate-y-0.5 active:translate-y-0 focus:ring-primary":
              variant === "primary",
            "bg-background-elevated text-text-primary border border-border hover:bg-background-hover hover:border-border-strong focus:ring-border-strong":
              variant === "secondary",
            "border border-border bg-background-card text-text-primary hover:bg-background-secondary hover:border-border-strong focus:ring-border-strong":
              variant === "outline",
            "text-text-secondary hover:bg-background-hover hover:text-text-primary focus:ring-border-strong":
              variant === "ghost",
            "bg-status-error text-white hover:bg-status-error/90 shadow-lg hover:shadow-xl focus:ring-status-error":
              variant === "danger",
          },
          {
            "px-3 py-1.5 text-sm": size === "sm",
            "px-6 py-2.5 text-[0.9375rem]": size === "md",
            "px-8 py-3.5 text-base": size === "lg",
          },
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = "Button";

export { Button };
