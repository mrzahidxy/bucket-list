import { Types } from "mongoose";
import { badRequest } from "@/lib/server/api/errors";

const OBJECT_ID_REGEX = /^[a-f\d]{24}$/i;

export const isValidObjectId = (value: string): boolean => OBJECT_ID_REGEX.test(value) && Types.ObjectId.isValid(value);

export const assertValidObjectId = (value: string, fieldName: string): string => {
  if (!isValidObjectId(value)) {
    throw badRequest(`Invalid ${fieldName}`, {
      code: "INVALID_OBJECT_ID",
      details: { [fieldName]: value }
    });
  }

  return value;
};
