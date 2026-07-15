"use client";

import { cn } from "@/lib/cn";
import { useInView } from "@/hooks/use-in-view";
import type { ReactNode } from "react";

// Scroll-onthulling voor secties/kaarten verderop op de pagina. Boven de
// vouw (hero) gebruiken we losse animate-fade-up classes, want die moet
// meteen spelen zonder op een IntersectionObserver te wachten.
export function Reveal({
  children,
  delay = 0,
  className,
}: {
  children: ReactNode;
  delay?: number;
  className?: string;
}) {
  const { ref, inView } = useInView<HTMLDivElement>();

  return (
    <div
      ref={ref}
      data-reveal
      className={cn(
        "transition-all duration-700 ease-out",
        "motion-reduce:opacity-100 motion-reduce:translate-y-0",
        inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-5",
        className,
      )}
      style={{ transitionDelay: inView ? `${delay}ms` : undefined }}
    >
      {children}
    </div>
  );
}
