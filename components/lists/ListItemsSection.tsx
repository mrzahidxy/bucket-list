"use client";

import { Check, Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import type { ListItem } from "@/components/lists/types";

type ListItemsSectionProps = {
  items: ListItem[];
  canEdit: boolean;
  newTitle: string;
  saving: boolean;
  onNewTitleChange: (value: string) => void;
  onAddItem: () => Promise<void>;
  onToggleItem: (item: ListItem) => Promise<void>;
  onOpenEditItem: (item: ListItem) => void;
  onDeleteItem: (itemId: string) => Promise<void>;
};

export const ListItemsSection = ({
  items,
  canEdit,
  newTitle,
  saving,
  onNewTitleChange,
  onAddItem,
  onToggleItem,
  onOpenEditItem,
  onDeleteItem
}: ListItemsSectionProps): React.JSX.Element => {
  return (
    <>
      <section className="space-y-3">
        {items.length === 0 ? (
          <Card className="text-center text-muted">No items yet. Add your first adventure below.</Card>
        ) : null}

        {items.map((item) => (
          <Card key={item.id} className="flex items-start gap-3">
            <button
              type="button"
              className={`mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border ${
                item.completed ? "border-primary bg-primary text-white" : "border-line"
              } ${canEdit ? "" : "cursor-default"}`}
              onClick={() => (canEdit ? onToggleItem(item).catch(() => undefined) : undefined)}
              aria-label={item.completed ? "Mark incomplete" : "Mark complete"}
            >
              {item.completed ? <Check className="h-4 w-4" /> : null}
            </button>
            <div className="flex-1">
              <p className={`text-lg ${item.completed ? "text-slate-400 line-through" : "text-text"}`}>{item.title}</p>
              {item.description ? <p className="text-sm text-muted">{item.description}</p> : null}
            </div>
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" disabled={!canEdit} onClick={() => onOpenEditItem(item)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                disabled={!canEdit}
                onClick={() => onDeleteItem(item.id).catch(() => undefined)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          </Card>
        ))}
      </section>

      <div className="rounded-2xl border border-line bg-panel p-3">
        <div className="flex gap-2">
          <Input
            placeholder={canEdit ? "Add a new adventure to the bucket list..." : "Viewer role cannot add items"}
            value={newTitle}
            onChange={(event) => onNewTitleChange(event.target.value)}
            disabled={!canEdit}
          />
          <Button onClick={() => onAddItem().catch(() => undefined)} loading={saving} disabled={!canEdit || !newTitle.trim()}>
            <Plus className="h-4 w-4" /> Add
          </Button>
        </div>
      </div>
    </>
  );
};
