import type { CSSProperties } from "react";

// Style-object voor een gestaffelde animate-fade-up/animate-pop op
// lijstitems. Capt op maxSteps zodat lange lijsten niet traag aanvoelen —
// items daarna verschijnen allemaal met dezelfde (laatste) vertraging.
export function staggerDelay(index: number, stepMs = 60, maxSteps = 8): CSSProperties {
  return { animationDelay: `${Math.min(index, maxSteps) * stepMs}ms` };
}
