import { cn } from "@/lib/cn";
import Link from "next/link";
import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "ghost";
type Size = "md" | "lg";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-brand-500 text-white shadow-[0_1px_2px_rgba(18,36,32,0.08),0_8px_20px_-8px_rgba(40,80,72,0.45)] hover:bg-brand-600 active:bg-brand-700 disabled:bg-brand-400/50 disabled:shadow-none",
  secondary:
    "bg-surface text-foreground border border-border hover:border-brand-400/40 hover:bg-brand-50/60 disabled:opacity-50",
  ghost: "text-foreground hover:bg-black/[0.04] disabled:opacity-50",
};

const sizeClasses: Record<Size, string> = {
  md: "h-11 px-4 text-[15px] rounded-xl",
  lg: "h-14 px-6 text-base rounded-full",
};

const base =
  "inline-flex items-center justify-center gap-2 font-semibold transition-all duration-150 ease-out active:scale-[0.98] disabled:cursor-not-allowed disabled:active:scale-100 cursor-pointer select-none";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
};

export function Button({
  variant = "primary",
  size = "md",
  className,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
      {...props}
    />
  );
}

type ButtonLinkProps = {
  href: string;
  variant?: Variant;
  size?: Size;
  className?: string;
  children: React.ReactNode;
};

export function ButtonLink({
  href,
  variant = "primary",
  size = "md",
  className,
  children,
}: ButtonLinkProps) {
  return (
    <Link
      href={href}
      className={cn(base, variantClasses[variant], sizeClasses[size], className)}
    >
      {children}
    </Link>
  );
}
