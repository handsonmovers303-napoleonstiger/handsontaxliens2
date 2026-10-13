import { supabase } from "../lib/supabase";
import { roomText, POST_MAX, CHAT_MAX } from "./home/room";

export function memberLabel(profileName, userId) {
  const name = String(profileName || "").trim();
  if (name) return name.slice(0, 40);
  const tail = String(userId || "").replace(/-/g, "").slice(0, 4);
  return tail ? `Member ${tail}` : "Member";
}

/** Top-level posts newest first. Replies stay in the order they were written. */
export function shapePosts(rows) {
  const tops = [];
  const byId = new Map();
  for (const row of rows || []) {
    if (row.parent_id) continue;
    const post = { ...row, replies: [] };
    byId.set(row.id, post);
    tops.push(post);
  }
  for (const row of rows || []) {
    if (row.parent_id && byId.has(row.parent_id)) byId.get(row.parent_id).replies.push(row);
  }
  tops.reverse();
  return tops;
}

export function communityError(error) {
  const msg = error?.message || String(error || "");
  if (/community_posts|community_chat|schema cache|does not exist/i.test(msg)) {
    return "The community table is not on the database yet, so other members cannot see posts. Apply supabase/migrations/20261007200000_community.sql.";
  }
  return msg || "The community could not be loaded.";
}

export async function loadCommunity() {
  const [posts, chat] = await Promise.all([
    supabase.from("community_posts").select("id,author_id,author_label,body,created_at,parent_id").order("created_at", { ascending: true }).limit(300),
    supabase.from("community_chat").select("id,author_id,author_label,body,created_at").order("created_at", { ascending: true }).limit(200),
  ]);
  if (posts.error) throw posts.error;
  if (chat.error) throw chat.error;
  return { posts: shapePosts(posts.data), chat: chat.data || [] };
}

async function labelFor(user) {
  const { data } = await supabase.from("profiles").select("full_name").eq("user_id", user.id).maybeSingle();
  return memberLabel(data?.full_name, user.id);
}

async function author() {
  const { data } = await supabase.auth.getUser();
  const user = data?.user;
  if (!user) return { ok: false, reason: "Sign in so other members can see this." };
  return { ok: true, user, label: await labelFor(user) };
}

export async function publishPost(body) {
  const text = roomText(body, POST_MAX);
  if (!text.ok) return text;
  const who = await author();
  if (!who.ok) return who;
  const { error } = await supabase.from("community_posts").insert({ author_id: who.user.id, author_label: who.label, body: text.text });
  if (error) return { ok: false, reason: communityError(error) };
  return { ok: true };
}

export async function publishReply(parentId, body) {
  const text = roomText(body, CHAT_MAX);
  if (!text.ok) return text;
  const who = await author();
  if (!who.ok) return who;
  const { error } = await supabase.from("community_posts").insert({ author_id: who.user.id, author_label: who.label, body: text.text, parent_id: parentId });
  if (error) return { ok: false, reason: communityError(error) };
  return { ok: true };
}

export async function publishChat(body) {
  const text = roomText(body, CHAT_MAX);
  if (!text.ok) return text;
  const who = await author();
  if (!who.ok) return who;
  const { error } = await supabase.from("community_chat").insert({ author_id: who.user.id, author_label: who.label, body: text.text });
  if (error) return { ok: false, reason: communityError(error) };
  return { ok: true };
}

export async function removeCommunityPost(id) {
  const { error } = await supabase.from("community_posts").delete().eq("id", id);
  if (error) return { ok: false, reason: communityError(error) };
  return { ok: true };
}

export async function removeCommunityChat(id) {
  const { error } = await supabase.from("community_chat").delete().eq("id", id);
  if (error) return { ok: false, reason: communityError(error) };
  return { ok: true };
}
