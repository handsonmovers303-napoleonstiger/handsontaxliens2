import { describe, expect, it } from "vitest";
import { memberLabel, shapePosts, communityError } from "../src/holo/communityApi.js";

describe("member community", () => {
  it("names a member without publishing an email", () => {
    expect(memberLabel("Ada Lovelace", "11111111-2222-3333-4444-555555555555")).toBe("Ada Lovelace");
    expect(memberLabel("", "abcd1234-0000-0000-0000-000000000000")).toBe("Member abcd");
    expect(memberLabel("x", "id")).not.toMatch(/@/);
  });

  it("threads replies under the post and shows newer posts first", () => {
    const posts = shapePosts([
      { id: "a", parent_id: null, body: "first", created_at: "2026-10-07T01:00:00Z" },
      { id: "b", parent_id: null, body: "second", created_at: "2026-10-07T02:00:00Z" },
      { id: "c", parent_id: "a", body: "reply", created_at: "2026-10-07T03:00:00Z" },
    ]);
    expect(posts.map((p) => p.id)).toEqual(["b", "a"]);
    expect(posts[1].replies.map((r) => r.id)).toEqual(["c"]);
  });

  it("says when the shared table is missing", () => {
    expect(communityError({ message: "relation community_posts does not exist" })).toMatch(/not on the database yet/);
  });
});
