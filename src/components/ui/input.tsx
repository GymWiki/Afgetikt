import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-surface px-4 text-[16px] text-foreground shadow-[0_1px_2px_rgba(18,36,32,0.04)]",
        "placeholder:text-muted outline-none transition-all duration-150",
        "hover:border-brand-400/40",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
        "disabled:opacity-50 disabled:hover:border-border",
        className,
      )}
      {...props}
    />
  );
}

export function Label({
  className,
  ...props
}: LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("mb-2 block text-sm font-semibold text-foreground", className)}
      {...props}
    />
  );
}
