"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { storeManagerToken, storeParticipantToken } from "@/lib/client-session";
import { Check, Copy, Share2 } from "lucide-react";
import { useEffect, useState } from "react";

export function ShareCard({
  billId,
  managerToken,
  payerId,
  payerAccessToken,
}: {
  billId: string;
  managerToken: string;
  payerId: string;
  payerAccessToken: string;
}) {
  const [groupUrl, setGroupUrl] = useState("");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    storeManagerToken(billId, managerToken);
    storeParticipantToken(billId, payerId, payerAccessToken);
    // window bestaat niet op de server; dit moet na hydratie.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setGroupUrl(`${window.location.origin}/b/${billId}`);
  }, [billId, managerToken, payerId, payerAccessToken]);

  async function handleShare() {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Afgetikt",
          text: "Kies je producten en betaal je deel:",
          url: groupUrl,
        });
        return;
      } catch {
        // gebruiker annuleerde het deelvenster; val terug op kopiëren
      }
    }
    handleCopy();
  }

  async function handleCopy() {
    await navigator.clipboard.writeText(groupUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-border bg-surface p-4">
        <div className="mb-1 text-xs font-medium uppercase tracking-wide text-muted">
          Groepslink
        </div>
        <div className="truncate text-[15px] text-foreground">{groupUrl}</div>
      </div>

      <Button size="lg" onClick={handleShare}>
        <Share2 size={18} />
        Deel de link
      </Button>
      <Button variant="secondary" onClick={handleCopy}>
        {copied ? <Check size={18} /> : <Copy size={18} />}
        {copied ? "Gekopieerd" : "Kopieer link"}
      </Button>

      <ButtonLink
        href={`/b/${billId}/beheer?key=${managerToken}`}
        variant="ghost"
        className="mt-2"
      >
        Ga naar mijn overzicht →
      </ButtonLink>
    </div>
  );
}
