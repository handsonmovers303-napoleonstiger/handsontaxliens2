/** Posts and chat the person writes on this device. No other members are invented. */

export const POST_MAX = 280;
export const CHAT_MAX = 180;

const BLOCK = /\b(guaranteed return|will redeem|risk-free|double your money|this is sold)\b/i;

let seq = 0;

export function roomText(text, max) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  if (!t) return { ok: false, reason: "Write something first." };
  if (BLOCK.test(t)) return { ok: false, reason: "That line promises a result or calls something sold. It was not posted." };
  if (t.length > max) return { ok: false, reason: `Keep it to ${max} characters.` };
  return { ok: true, text: t };
}

function roomId(prefix, now) {
  seq += 1;
  return `${prefix}-${String(now).replace(/\W/g, "")}-${seq}`;
}

export function addPost(posts, text, now) {
  const r = roomText(text, POST_MAX);
  if (!r.ok) return r;
  const post = { id: roomId("p", now), text: r.text, at: now, replies: [] };
  return { ok: true, posts: [post, ...(posts || [])].slice(0, 80) };
}

export function addReply(posts, postId, text, now) {
  const r = roomText(text, CHAT_MAX);
  if (!r.ok) return r;
  let found = false;
  const next = (posts || []).map((p) => {
    if (p.id !== postId) return p;
    found = true;
    return { ...p, replies: [...(p.replies || []), { id: roomId("r", now), text: r.text, at: now }].slice(-40) };
  });
  if (!found) return { ok: false, reason: "That post is gone." };
  return { ok: true, posts: next };
}

export function removePost(posts, postId) {
  return (posts || []).filter((p) => p.id !== postId);
}

export function addChat(chat, text, now) {
  const r = roomText(text, CHAT_MAX);
  if (!r.ok) return r;
  return { ok: true, chat: [...(chat || []), { id: roomId("c", now), text: r.text, at: now }].slice(-120) };
}

export function removeChat(chat, id) {
  return (chat || []).filter((m) => m.id !== id);
}
