"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type EditItemModalProps = {
  open: boolean;
  title: string;
  description: string;
  updatingItem: boolean;
  onClose: () => void;
  onTitleChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onSave: () => Promise<void>;
};

export const EditItemModal = ({
  open,
  title,
  description,
  updatingItem,
  onClose,
  onTitleChange,
  onDescriptionChange,
  onSave
}: EditItemModalProps): React.JSX.Element => {
  return (
    <Modal open={open} onClose={onClose} title="Edit Adventure" subtitle="Update this bucket list item.">
      <div className="space-y-3">
        <div>
          <label htmlFor="edit-item-title" className="mb-1 block text-sm font-medium text-text">
            Title
          </label>
          <Input id="edit-item-title" value={title} onChange={(event) => onTitleChange(event.target.value)} />
        </div>
        <div>
          <label htmlFor="edit-item-description" className="mb-1 block text-sm font-medium text-text">
            Description
          </label>
          <textarea
            id="edit-item-description"
            value={description}
            onChange={(event) => onDescriptionChange(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-text outline-none ring-primary/40 placeholder:text-slate-400 focus:ring-2"
            placeholder="Add details for this adventure"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={updatingItem}>
            Cancel
          </Button>
          <Button onClick={() => onSave().catch(() => undefined)} loading={updatingItem}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
