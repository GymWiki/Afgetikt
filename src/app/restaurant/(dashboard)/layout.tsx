import { getRestaurantByOwner } from "@/lib/restaurants";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import { DashboardNav } from "./dashboard-nav";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/restaurant/inloggen");

  const restaurant = await getRestaurantByOwner(user.id);
  if (!restaurant) redirect("/restaurant/registreren");

  return (
    <div className="flex min-h-full flex-col">
      <DashboardNav restaurantName={restaurant.name} />
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-8 print:max-w-none print:p-0">
        {children}
      </main>
    </div>
  );
}
