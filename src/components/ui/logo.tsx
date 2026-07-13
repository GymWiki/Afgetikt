import Image from "next/image";
import { cn } from "@/lib/cn";

const sizeClasses = {
  sm: { icon: 28, text: "text-base" },
  md: { icon: 36, text: "text-lg" },
  lg: { icon: 52, text: "text-2xl" },
} as const;

type LogoProps = {
  size?: keyof typeof sizeClasses;
  className?: string;
};

export function Logo({ size = "md", className }: LogoProps) {
  const { icon, text } = sizeClasses[size];
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <Image
        src="/logo-icon.png"
        alt=""
        width={icon}
        height={icon}
        priority
        className="shrink-0"
      />
      <span className={cn("font-bold tracking-tight text-brand-600", text)}>
        Afgetikt<span className="text-accent-ink">.</span>
      </span>
    </span>
  );
}
