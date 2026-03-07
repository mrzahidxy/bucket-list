import { Schema, model, models, type InferSchemaType, type Model, Types } from "mongoose";

const userSchema = new Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
      match: /^\S+@\S+\.\S+$/
    },
    passwordHash: { type: String },
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 80 },
    avatarUrl: { type: String, trim: true, maxlength: 2_000_000 },
    authProvider: { type: String, enum: ["local", "google"], default: "local" },
    googleId: { type: String, unique: true, sparse: true, trim: true }
  },
  { timestamps: true }
);

export type UserDocument = InferSchemaType<typeof userSchema> & {
  _id: Types.ObjectId;
};

export const UserModel = (models.User as Model<UserDocument>) || model<UserDocument>("User", userSchema);
