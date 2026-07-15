"use client";

import { useInView } from "@/hooks/use-in-view";
import { cn } from "@/lib/cn";
import { CircleCheckBig } from "lucide-react";

const items = [
  { name: "2× Tosti gezond", price: "€9,00", done: true },
  { name: "3× Radler 0.0", price: "€10,50", done: true },
  { name: "1× Bitterballen", price: "€8,50", done: false },
];

export function ReceiptPreviewCard() {
  const { ref, inView } = useInView<HTMLDivElement>(0.3);

  return (
    <div className="relative mx-auto w-full max-w-sm lg:max-w-none">
      <div className="absolute -inset-4 -z-10 rounded-[2.5rem] bg-gradient-to-br from-brand-50 via-sage-50 to-transparent blur-2xl motion-safe:animate-float" />

      <div
        ref={ref}
        data-reveal
        className={cn(
          "rounded-[2rem] border border-border bg-surface p-6 shadow-[0_1px_2px_rgba(18,36,32,0.06),0_24px_48px_-24px_rgba(40,80,72,0.35)] transition-all duration-700 ease-out sm:p-8",
          "motion-reduce:opacity-100 motion-reduce:translate-y-0 motion-reduce:scale-100",
          inView ? "opacity-100 translate-y-0 scale-100" : "opacity-0 translate-y-6 scale-[0.97]",
        )}
      >
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold text-foreground">
            Terras De Linde
          </span>
          <span className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-600">
            Open
          </span>
        </div>
        <ul className="mt-5 flex flex-col gap-3">
          {items.map((item, i) => (
            <li
              key={item.name}
              data-reveal
              className={cn(
                "flex items-center justify-between rounded-xl border border-border bg-background px-4 py-3 transition-all duration-500 ease-out",
                "motion-reduce:opacity-100 motion-reduce:translate-x-0",
                inView ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-3",
              )}
              style={{ transitionDelay: inView ? `${300 + i * 130}ms` : undefined }}
            >
              <div className="flex items-center gap-2.5">
                <CircleCheckBig
                  size={16}
                  strokeWidth={2.5}
                  className={cn(
                    "transition-all duration-300",
                    item.done ? "text-brand-500 scale-100" : "text-border scale-90",
                  )}
                  style={{ transitionDelay: inView ? `${300 + i * 130 + 150}ms` : undefined }}
                />
                <span className="text-sm font-medium text-foreground">
                  {item.name}
                </span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-foreground">
                {item.price}
              </span>
            </li>
          ))}
        </ul>
        <div
          data-reveal
          className={cn(
            "mt-5 flex items-center justify-between border-t border-border pt-4 transition-all duration-500 ease-out",
            "motion-reduce:opacity-100 motion-reduce:translate-y-0",
            inView ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2",
          )}
          style={{ transitionDelay: inView ? "780ms" : undefined }}
        >
          <span className="text-sm text-muted">Jouw deel</span>
          <span className="text-lg font-bold tabular-nums text-brand-600">
            €14,17
          </span>
        </div>
      </div>
    </div>
  );
}
