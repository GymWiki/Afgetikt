import { requireCurrentRestaurant } from "@/lib/restaurants";
import { DashboardNav } from "./dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { restaurant, restaurants } = await requireCurrentRestaurant();

  return (
    <div className="flex min-h-full flex-col">
      <DashboardNav
        restaurant={restaurant}
        restaurants={restaurants}
      />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 print:max-w-none print:p-0">
        {children}
      </main>
    </div>
  );
}
