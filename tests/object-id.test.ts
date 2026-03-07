import { describe, expect, it } from "vitest";
import { ApiError } from "@/lib/server/api/errors";
import { assertValidObjectId, isValidObjectId } from "@/lib/server/api/object-id";

describe("object id validation", () => {
  it("accepts valid object ids", () => {
    const value = "507f1f77bcf86cd799439011";
    expect(isValidObjectId(value)).toBe(true);
    expect(assertValidObjectId(value, "listId")).toBe(value);
  });

  it("rejects invalid object ids", () => {
    expect(isValidObjectId("not-an-id")).toBe(false);

    try {
      assertValidObjectId("bad-id", "listId");
      throw new Error("Expected validation to fail");
    } catch (error) {
      expect(error).toBeInstanceOf(ApiError);
      expect((error as ApiError).status).toBe(400);
    }
  });
});
