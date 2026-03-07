"use client";

import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Modal } from "@/components/ui/Modal";

type EditListModalProps = {
  open: boolean;
  editTitle: string;
  editDescription: string;
  updatingList: boolean;
  onClose: () => void;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onSave: () => Promise<void>;
};

export const EditListModal = ({
  open,
  editTitle,
  editDescription,
  updatingList,
  onClose,
  onEditTitleChange,
  onEditDescriptionChange,
  onSave
}: EditListModalProps): React.JSX.Element => {
  return (
    <Modal open={open} onClose={onClose} title="Edit List" subtitle="Update list title and description.">
      <div className="space-y-3">
        <div>
          <label htmlFor="edit-list-title" className="mb-1 block text-sm font-medium text-text">
            Title
          </label>
          <Input id="edit-list-title" value={editTitle} onChange={(event) => onEditTitleChange(event.target.value)} />
        </div>
        <div>
          <label htmlFor="edit-list-description" className="mb-1 block text-sm font-medium text-text">
            Description
          </label>
          <textarea
            id="edit-list-description"
            value={editDescription}
            onChange={(event) => onEditDescriptionChange(event.target.value)}
            rows={4}
            className="w-full rounded-xl border border-line bg-white px-3 py-2 text-sm text-text outline-none ring-primary/40 placeholder:text-slate-400 focus:ring-2"
            placeholder="Add a short description"
          />
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="ghost" onClick={onClose} disabled={updatingList}>
            Cancel
          </Button>
          <Button onClick={() => onSave().catch(() => undefined)} loading={updatingList}>
            Save
          </Button>
        </div>
      </div>
    </Modal>
  );
};
