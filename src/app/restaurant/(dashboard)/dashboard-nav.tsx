"use client";

import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import { LayoutGrid, QrCode, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { logoutAction } from "../actions";

const links = [
  { href: "/restaurant", label: "Overzicht", icon: LayoutGrid },
  { href: "/restaurant/qr", label: "QR-code", icon: QrCode },
  { href: "/restaurant/instellingen", label: "Instellingen", icon: Settings },
];

export function DashboardNav({ restaurantName }: { restaurantName: string }) {
  const pathname = usePathname();

  return (
    <header className="border-b border-border bg-surface print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" />
          <span className="hidden h-6 w-px bg-border sm:block" />
          <span className="hidden text-[15px] font-medium text-foreground sm:block">
            {restaurantName}
          </span>
        </Link>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-sm text-muted underline underline-offset-4 hover:text-foreground"
          >
            Uitloggen
          </button>
        </form>
      </div>
      <div className="mx-auto max-w-3xl px-5 pb-2 text-sm font-medium text-foreground sm:hidden">
        {restaurantName}
      </div>
      <nav className="mx-auto flex max-w-3xl gap-1 px-5">
        {links.map((link) => {
          const active =
            link.href === "/restaurant"
              ? pathname === "/restaurant"
              : pathname.startsWith(link.href);
          return (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "flex items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
                active
                  ? "border-brand-500 text-foreground"
                  : "border-transparent text-muted hover:text-foreground",
              )}
            >
              <link.icon size={15} />
              {link.label}
            </Link>
          );
        })}
      </nav>
    </header>
  );
}
