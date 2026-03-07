import { Schema, model, models, type InferSchemaType } from "mongoose";

const activitySchema = new Schema(
  {
    listId: { type: Schema.Types.ObjectId, ref: "BucketList", required: true, index: true },
    actorId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    action: {
      type: String,
      required: true,
      enum: ["INVITATION_SENT", "COLLABORATOR_JOINED", "ITEM_COMPLETED", "ITEM_UNCOMPLETED"]
    },
    itemId: { type: Schema.Types.ObjectId, ref: "ListItem" },
    itemTitle: { type: String, trim: true, maxlength: 200 }
  },
  { timestamps: true }
);

activitySchema.index({ listId: 1, createdAt: -1 });

export type ActivityDocument = InferSchemaType<typeof activitySchema>;

export const ActivityModel = models.Activity || model("Activity", activitySchema);
