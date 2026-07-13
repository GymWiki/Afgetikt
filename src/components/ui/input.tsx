import { cn } from "@/lib/cn";
import type { InputHTMLAttributes, LabelHTMLAttributes } from "react";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "h-12 w-full rounded-xl border border-border bg-surface px-4 text-[16px] text-foreground",
        "placeholder:text-muted outline-none transition-shadow",
        "focus:border-brand-500 focus:ring-4 focus:ring-brand-500/15",
        "disabled:opacity-50",
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
      className={cn("mb-2 block text-sm font-medium text-foreground", className)}
      {...props}
    />
  );
}
