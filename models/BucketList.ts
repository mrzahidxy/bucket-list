import { Schema, model, models, type InferSchemaType, Types } from "mongoose";

const collaboratorSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    role: {
      type: String,
      enum: ["OWNER", "EDITOR", "VIEWER"],
      required: true
    }
  },
  { _id: false }
);

const bucketListSchema = new Schema(
  {
    title: { type: String, required: true, trim: true, minlength: 1, maxlength: 120 },
    description: { type: String, trim: true, maxlength: 500 },
    owner: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    collaborators: { type: [collaboratorSchema], default: [] }
  },
  { timestamps: true }
);

bucketListSchema.index({ owner: 1, updatedAt: -1 });
bucketListSchema.index({ "collaborators.user": 1 });

export type BucketListDocument = InferSchemaType<typeof bucketListSchema> & {
  _id: Types.ObjectId;
};

export const BucketListModel = models.BucketList || model("BucketList", bucketListSchema);
