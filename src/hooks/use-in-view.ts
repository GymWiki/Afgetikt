"use client";

import { useEffect, useRef, useState } from "react";

// Licht alternatief voor een animatiebibliotheek: vuurt precies één keer
// zodra het element in beeld scrollt, daarna zichzelf opruimen. Gebruikers
// die de pagina laden met het element al in beeld (bv. bij page refresh
// halverwege scrollen) krijgen de eindstaat meteen te zien.
export function useInView<T extends HTMLElement>(threshold = 0.15) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { threshold, rootMargin: "0px 0px -64px 0px" },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  return { ref, inView };
}
