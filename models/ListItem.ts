import { Schema, model, models, type InferSchemaType } from "mongoose";

const listItemSchema = new Schema(
  {
    listId: { type: Schema.Types.ObjectId, ref: "BucketList", required: true, index: true },
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 160 },
    description: { type: String, trim: true, maxlength: 500 },
    completed: { type: Boolean, default: false },
    dueDate: { type: Date },
    assignedTo: { type: Schema.Types.ObjectId, ref: "User" },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    completedAt: { type: Date }
  },
  { timestamps: true }
);

listItemSchema.index({ listId: 1, createdAt: -1 });

export type ListItemDocument = InferSchemaType<typeof listItemSchema>;

export const ListItemModel = models.ListItem || model("ListItem", listItemSchema);
