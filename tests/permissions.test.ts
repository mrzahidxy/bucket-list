import { describe, expect, it } from "vitest";
import { canEditList, canManageCollaborators, canViewList } from "@/lib/permissions";

describe("permissions", () => {
  it("handles view permissions", () => {
    expect(canViewList("OWNER")).toBe(true);
    expect(canViewList("EDITOR")).toBe(true);
    expect(canViewList("VIEWER")).toBe(true);
    expect(canViewList(null)).toBe(false);
  });

  it("handles edit permissions", () => {
    expect(canEditList("OWNER")).toBe(true);
    expect(canEditList("EDITOR")).toBe(true);
    expect(canEditList("VIEWER")).toBe(false);
  });

  it("restricts collaborator management to owner", () => {
    expect(canManageCollaborators("OWNER")).toBe(true);
    expect(canManageCollaborators("EDITOR")).toBe(false);
    expect(canManageCollaborators("VIEWER")).toBe(false);
  });
});
