import { Schema, model, models, type InferSchemaType } from "mongoose";

const invitationSchema = new Schema(
  {
    listId: { type: Schema.Types.ObjectId, ref: "BucketList", required: true, index: true },
    senderId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    recipientEmail: {
      type: String,
      required: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^\S+@\S+\.\S+$/
    },
    role: { type: String, enum: ["EDITOR", "VIEWER"], required: true },
    tokenHash: { type: String, required: true, unique: true, minlength: 64, maxlength: 64 },
    status: {
      type: String,
      enum: ["pending", "accepted", "expired", "revoked"],
      default: "pending",
      index: true
    },
    expiresAt: { type: Date, required: true, index: true }
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

invitationSchema.index({ listId: 1, recipientEmail: 1, status: 1 });

export type InvitationDocument = InferSchemaType<typeof invitationSchema>;

export const InvitationModel = models.Invitation || model("Invitation", invitationSchema);
