"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

// Ververst periodiek de server-data van de huidige pagina, maar alleen
// terwijl het tabblad daadwerkelijk zichtbaar is — anders blijft een op de
// achtergrond openstaande bon elke paar seconden onnodig de server/database
// belasten. Bij het terugkomen wordt meteen ververst, zodat de data nooit
// langer dan het interval verouderd is.
export function useLiveRefresh(intervalMs: number) {
  const router = useRouter();

  useEffect(() => {
    function refreshIfVisible() {
      if (!document.hidden) router.refresh();
    }

    const interval = setInterval(refreshIfVisible, intervalMs);
    document.addEventListener("visibilitychange", refreshIfVisible);

    return () => {
      clearInterval(interval);
      document.removeEventListener("visibilitychange", refreshIfVisible);
    };
  }, [router, intervalMs]);
}
