import { describe, expect, it } from "vitest";
import { addPost, addReply, addChat, removePost, removeChat } from "../src/holo/home/room.js";

const now = "2026-10-07T19:00:00.000Z";

describe("community room", () => {
  it("keeps a post and a chat line on this device", () => {
    const posted = addPost([], "Checking Mesa before Friday.", now);
    expect(posted.ok).toBe(true);
    expect(posted.posts).toHaveLength(1);
    expect(posted.posts[0].text).toBe("Checking Mesa before Friday.");
    const replied = addReply(posted.posts, posted.posts[0].id, "Sale list is the county file, not this note.", now);
    expect(replied.ok).toBe(true);
    expect(replied.posts[0].replies).toHaveLength(1);
    const chat = addChat([], "Anyone opening the treasurer page today?", now);
    expect(chat.ok).toBe(true);
    expect(removePost(replied.posts, replied.posts[0].id)).toEqual([]);
    expect(removeChat(chat.chat, chat.chat[0].id)).toEqual([]);
  });

  it("refuses a promised return or a sold claim", () => {
    expect(addPost([], "guaranteed return on this lien", now).ok).toBe(false);
    expect(addChat([], "this is sold", now).ok).toBe(false);
    expect(addPost([], "   ", now).reason).toMatch(/Write something/);
  });
});
