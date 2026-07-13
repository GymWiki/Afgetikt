"use client";

import { Button } from "@/components/ui/button";
import { Camera, ImageUp, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useRef, useState, useTransition } from "react";
import { scanReceiptAction } from "./actions";

export function ReceiptUploader() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    setError(null);
    if (!selected) {
      setFile(null);
      setPreview(null);
      return;
    }
    setFile(selected);
    setPreview(URL.createObjectURL(selected));
  }

  function reset() {
    setFile(null);
    setPreview(null);
    if (cameraInputRef.current) cameraInputRef.current.value = "";
    if (galleryInputRef.current) galleryInputRef.current.value = "";
  }

  function handleSubmit() {
    if (!file) return;
    const formData = new FormData();
    formData.set("photo", file);

    startTransition(async () => {
      const result = await scanReceiptAction(formData);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      router.push(
        `/nieuw/${result.billId}/controleren?key=${result.managerToken}`,
      );
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        className="hidden"
        onChange={handleFileChange}
      />
      <input
        ref={galleryInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview ? (
        <div className="overflow-hidden rounded-2xl border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={preview}
            alt="Voorbeeld van de bon"
            className="max-h-80 w-full object-contain bg-black/[0.02]"
          />
        </div>
      ) : (
        <button
          type="button"
          onClick={() => cameraInputRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-border bg-surface py-14 text-center transition-colors hover:border-brand-400 hover:bg-brand-50/40"
        >
          <div className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-50 text-brand-600">
            <Camera size={26} strokeWidth={2} />
          </div>
          <div>
            <div className="text-[15px] font-medium text-foreground">
              Maak een foto van de bon
            </div>
            <div className="text-sm text-muted">of kies een foto uit je galerij</div>
          </div>
        </button>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      {preview ? (
        <div className="flex flex-col gap-2">
          <Button onClick={handleSubmit} disabled={isPending} size="lg">
            {isPending ? (
              <>
                <Loader2 size={18} className="animate-spin" />
                Bon wordt gelezen…
              </>
            ) : (
              "Bon verwerken"
            )}
          </Button>
          <Button variant="ghost" disabled={isPending} onClick={reset}>
            Andere foto kiezen
          </Button>
        </div>
      ) : (
        <Button
          variant="secondary"
          onClick={() => galleryInputRef.current?.click()}
          className="justify-center"
        >
          <ImageUp size={18} />
          Foto uit galerij kiezen
        </Button>
      )}
    </div>
  );
}
