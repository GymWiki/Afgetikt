"use client";

import { cn } from "@/lib/cn";
import { Logo } from "@/components/ui/logo";
import { CreditCard, LayoutGrid, QrCode, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useTransition } from "react";
import { logoutAction, switchRestaurantAction } from "../actions";

const links = [
  { href: "/restaurant", label: "Overzicht", icon: LayoutGrid },
  { href: "/restaurant/qr", label: "QR-code", icon: QrCode },
  { href: "/restaurant/abonnement", label: "Abonnement", icon: CreditCard },
  { href: "/restaurant/instellingen", label: "Instellingen", icon: Settings },
];

type RestaurantOption = { id: string; name: string };

export function DashboardNav({
  restaurant,
  restaurants,
}: {
  restaurant: RestaurantOption;
  restaurants: RestaurantOption[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleSwitch(id: string) {
    if (id === restaurant.id) return;
    startTransition(async () => {
      await switchRestaurantAction(id);
      router.refresh();
    });
  }

  return (
    <header className="border-b border-border bg-surface print:hidden">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-5 py-4">
        <Link href="/" className="flex items-center gap-3">
          <Logo size="sm" />
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
      <div className="mx-auto flex max-w-3xl items-center gap-3 px-5 pb-3">
        {restaurants.length > 1 ? (
          <select
            value={restaurant.id}
            disabled={isPending}
            onChange={(e) => handleSwitch(e.target.value)}
            aria-label="Actief restaurant"
            className="h-9 rounded-lg border border-border bg-background px-2.5 text-sm font-medium text-foreground outline-none disabled:opacity-50"
          >
            {restaurants.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        ) : (
          <span className="text-[15px] font-medium text-foreground">
            {restaurant.name}
          </span>
        )}
        <Link
          href="/restaurant/nieuw-restaurant"
          className="text-xs font-medium text-brand-600 underline underline-offset-4 hover:text-brand-700"
        >
          + Restaurant toevoegen
        </Link>
      </div>
      <nav className="mx-auto flex max-w-3xl gap-1 overflow-x-auto px-5">
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
                "flex shrink-0 items-center gap-1.5 border-b-2 px-1 py-3 text-sm font-medium transition-colors",
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
