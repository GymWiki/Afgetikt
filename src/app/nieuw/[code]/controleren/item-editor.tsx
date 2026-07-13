"use client";

import { Button, ButtonLink } from "@/components/ui/button";
import { Input, Label } from "@/components/ui/input";
import { formatCents, parseAmountToCents } from "@/lib/money";
import { Loader2, Pencil, Plus, Trash2, X } from "lucide-react";
import { useId, useState, useTransition } from "react";
import type { ItemActionResult } from "./actions";

export type EditableItem = {
  id: string;
  name: string;
  priceCents: number;
  quantity: number;
};

type Actions = {
  addItem: (formData: FormData) => Promise<ItemActionResult>;
  updateItem: (itemId: string, formData: FormData) => Promise<ItemActionResult>;
  deleteItem: (itemId: string) => Promise<ItemActionResult>;
};

export function ItemEditor({
  initialItems,
  actions,
  continueHref,
}: {
  initialItems: EditableItem[];
  actions: Actions;
  continueHref: string;
}) {
  const [items, setItems] = useState(initialItems);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const total = items.reduce((sum, i) => sum + i.priceCents, 0);

  function withPendingItem(fn: () => Promise<void>) {
    setError(null);
    startTransition(async () => {
      try {
        await fn();
      } catch {
        setError("Er ging iets mis. Probeer het opnieuw.");
      }
    });
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col divide-y divide-border rounded-2xl border border-border bg-surface">
        {items.length === 0 && (
          <p className="px-4 py-6 text-center text-sm text-muted">
            Nog geen producten. Voeg hieronder je eerste product toe.
          </p>
        )}
        {items.map((item) =>
          editingId === item.id ? (
            <ItemForm
              key={item.id}
              initial={item}
              submitLabel="Opslaan"
              onCancel={() => setEditingId(null)}
              onSubmit={(formData) =>
                withPendingItem(async () => {
                  const result = await actions.updateItem(item.id, formData);
                  if (!result.ok) {
                    setError(result.error);
                    return;
                  }
                  const name = String(formData.get("name"));
                  const priceCents = parseAmountToCents(
                    String(formData.get("price")),
                  );
                  const quantity = Math.max(
                    1,
                    Math.round(Number(formData.get("quantity") || 1)),
                  );
                  setItems((prev) =>
                    prev.map((i) =>
                      i.id === item.id
                        ? { ...i, name, priceCents: priceCents ?? i.priceCents, quantity }
                        : i,
                    ),
                  );
                  setEditingId(null);
                })
              }
            />
          ) : (
            <div key={item.id} className="flex items-center gap-3 px-4 py-3">
              <div className="min-w-0 flex-1">
                <div className="truncate text-[15px] font-medium text-foreground">
                  {item.name}
                  {item.quantity > 1 && (
                    <span className="ml-1.5 text-sm text-muted">
                      ×{item.quantity}
                    </span>
                  )}
                </div>
              </div>
              <div className="text-[15px] tabular-nums text-foreground">
                {formatCents(item.priceCents)}
              </div>
              <button
                aria-label="Product bewerken"
                className="-my-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-black/[0.04] hover:text-foreground"
                onClick={() => setEditingId(item.id)}
              >
                <Pencil size={16} />
              </button>
              <button
                aria-label="Product verwijderen"
                className="-my-2.5 flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted hover:bg-red-50 hover:text-red-600"
                disabled={isPending}
                onClick={() =>
                  withPendingItem(async () => {
                    const result = await actions.deleteItem(item.id);
                    if (!result.ok) {
                      setError(result.error);
                      return;
                    }
                    setItems((prev) => prev.filter((i) => i.id !== item.id));
                  })
                }
              >
                <Trash2 size={16} />
              </button>
            </div>
          ),
        )}
      </div>

      {adding ? (
        <div className="rounded-2xl border border-border bg-surface">
          <ItemForm
            submitLabel="Toevoegen"
            onCancel={() => setAdding(false)}
            onSubmit={(formData) =>
              withPendingItem(async () => {
                const result = await actions.addItem(formData);
                if (!result.ok) {
                  setError(result.error);
                  return;
                }
                const name = String(formData.get("name"));
                const priceCents = parseAmountToCents(
                  String(formData.get("price")),
                );
                const quantity = Math.max(
                  1,
                  Math.round(Number(formData.get("quantity") || 1)),
                );
                setItems((prev) => [
                  ...prev,
                  {
                    id: `tmp_${prev.length}_${Date.now()}`,
                    name,
                    priceCents: priceCents ?? 0,
                    quantity,
                  },
                ]);
                setAdding(false);
              })
            }
          />
        </div>
      ) : (
        <Button variant="secondary" onClick={() => setAdding(true)}>
          <Plus size={18} />
          Product toevoegen
        </Button>
      )}

      {error && (
        <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex items-center justify-between border-t border-border pt-4 text-[15px] font-medium">
        <span>Totaal</span>
        <span className="tabular-nums">{formatCents(total)}</span>
      </div>

      {isPending && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted">
          <Loader2 size={14} className="animate-spin" />
          Opslaan…
        </div>
      )}

      {items.length === 0 ? (
        <p className="text-center text-sm text-muted">
          Voeg minimaal één product toe om door te gaan.
        </p>
      ) : (
        <ButtonLink href={continueHref} size="lg">
          Doorgaan
        </ButtonLink>
      )}
    </div>
  );
}

function ItemForm({
  initial,
  submitLabel,
  onCancel,
  onSubmit,
}: {
  initial?: EditableItem;
  submitLabel: string;
  onCancel: () => void;
  onSubmit: (formData: FormData) => void;
}) {
  const id = useId();
  const nameId = `${id}-name`;
  const quantityId = `${id}-quantity`;
  const priceId = `${id}-price`;

  return (
    <form
      className="flex flex-col gap-3 p-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit(new FormData(e.currentTarget));
      }}
    >
      <div className="flex gap-2">
        <div className="flex-[3]">
          <Label htmlFor={nameId} className="mb-1 text-xs">
            Productnaam
          </Label>
          <Input
            id={nameId}
            name="name"
            placeholder="Bijv. Kaasplankje"
            defaultValue={initial?.name}
            required
            autoFocus
          />
        </div>
        <div className="flex-1">
          <Label htmlFor={quantityId} className="mb-1 text-xs">
            Aantal
          </Label>
          <Input
            id={quantityId}
            name="quantity"
            type="number"
            min={1}
            inputMode="numeric"
            defaultValue={initial?.quantity ?? 1}
          />
        </div>
      </div>
      <div>
        <Label htmlFor={priceId} className="mb-1 text-xs">
          Totaalprijs
        </Label>
        <Input
          id={priceId}
          name="price"
          placeholder="Bijv. 12,50"
          inputMode="decimal"
          defaultValue={
            initial
              ? (initial.priceCents / 100).toFixed(2).replace(".", ",")
              : ""
          }
          required
        />
      </div>
      <div className="flex gap-2">
        <Button type="submit" className="flex-1">
          {submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          <X size={18} />
        </Button>
      </div>
    </form>
  );
}
