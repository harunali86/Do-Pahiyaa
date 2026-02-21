"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "outline";
type ButtonSize = "sm" | "md" | "lg" | "icon";

const variantStyles: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-500 focus-visible:ring-brand-300 shadow-[0_0_0_1px_rgba(20,184,166,0.25)]",
  secondary:
    "bg-slate-800 text-slate-100 hover:bg-slate-700 border border-slate-700",
  ghost: "bg-transparent text-slate-200 hover:bg-slate-800/70",
  danger: "bg-rose-600 text-white hover:bg-rose-500",
  outline: "bg-transparent text-slate-200 border border-white/10 hover:bg-slate-800/60"
};

const sizeStyles: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-xs",
  md: "h-10 px-4 text-sm",
  lg: "h-12 px-5 text-base",
  icon: "h-9 w-9 p-0 flex items-center justify-center"
};

import { Slot } from "@radix-ui/react-slot";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-lg font-medium transition focus-visible:outline-none focus-visible:ring-2 disabled:pointer-events-none disabled:opacity-50",
          variantStyles[variant],
          sizeStyles[size],
          className
        )}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";
