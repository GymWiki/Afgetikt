import { PageShell } from "@/components/ui/page-shell";
import { getDraftBillForEdit } from "@/lib/bills";
import { notFound } from "next/navigation";
import { addItemAction, deleteItemAction, updateItemAction } from "./actions";
import { ItemEditor } from "./item-editor";

export default async function ControlerenPage({
  params,
  searchParams,
}: {
  params: Promise<{ code: string }>;
  searchParams: Promise<{ key?: string }>;
}) {
  const { code } = await params;
  const { key } = await searchParams;

  if (!key) notFound();
  const draft = await getDraftBillForEdit(code, key);
  if (!draft) notFound();

  return (
    <PageShell className="gap-6">
      <div>
        <div className="text-sm text-muted">Stap 1 van 2</div>
        <h1 className="text-xl font-semibold text-foreground">
          Klopt de bon?
        </h1>
        <p className="mt-1 text-[15px] text-muted">
          Controleer de producten en prijzen voordat je de link deelt.
        </p>
      </div>

      <ItemEditor
        initialItems={draft.items}
        continueHref={`/nieuw/${code}/betaallink?key=${key}`}
        actions={{
          addItem: addItemAction.bind(null, code, key),
          updateItem: updateItemAction.bind(null, code, key),
          deleteItem: deleteItemAction.bind(null, code, key),
        }}
      />
    </PageShell>
  );
}
