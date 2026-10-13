import React, { useEffect, useState } from "react";
import { supabase } from "../../lib/supabase";
import { ARTIFACT } from "../../lib/env";
import { useStore } from "../store";
import { POST_MAX, CHAT_MAX } from "./room";
import { communityError, loadCommunity, publishPost, publishReply, publishChat, removeCommunityPost, removeCommunityChat } from "../communityApi";
import { Button } from "../ds";

const when = (iso) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? "" : d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });
};

/** Posts or chat that signed-in members can read. Nothing is shared until you are signed in. */
export function Floor({ pane = "posts" }) {
  const { holo, sync } = useStore();
  const signedIn = !!(sync?.signedIn && sync?.userId) && !ARTIFACT;
  const [feed, setFeed] = useState({ posts: [], chat: [] });
  const [draft, setDraft] = useState("");
  const [line, setLine] = useState("");
  const [replyTo, setReplyTo] = useState(null);
  const [reply, setReply] = useState("");
  const [err, setErr] = useState("");
  const [busy, setBusy] = useState(false);

  const refresh = async () => {
    try {
      const next = await loadCommunity();
      setFeed(next);
      setErr("");
    } catch (e) {
      setErr(communityError(e));
    }
  };

  useEffect(() => {
    if (!signedIn) return undefined;
    refresh();
    const timer = setInterval(refresh, 20000);
    const channel = supabase.channel("community-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "community_posts" }, () => refresh())
      .on("postgres_changes", { event: "*", schema: "public", table: "community_chat" }, () => refresh())
      .subscribe();
    return () => { clearInterval(timer); supabase.removeChannel(channel); };
  }, [signedIn]);

  const run = async (fn) => {
    setBusy(true);
    const res = await fn();
    setBusy(false);
    if (!res.ok) { setErr(res.reason); return false; }
    setErr("");
    await refresh();
    return true;
  };

  if (!signedIn) {
    const saved = (holo.room?.posts || []).length + (holo.room?.chat || []).length;
    return (
      <section className="room" aria-label="Community">
        <div className="mkt-banner" role="status">Sign in to read and write. A signed-in member can see every post and chat line. Nothing is shared from this device until you post it.</div>
        {saved > 0 && <p className="faint">{saved} older notes are still only on this device. They are not visible to members.</p>}
        <Button className="btn sm" type="button" onClick={() => window.dispatchEvent(new Event("hotl:open-account"))}>Sign in so members can see you</Button>
      </section>
    );
  }

  const mine = (row) => row.author_id === sync.userId;
  const who = (row) => mine(row) ? `You · ${row.author_label}` : row.author_label;

  return (
    <section className="room" aria-label={pane === "chat" ? "Chat" : "Posts"}>
      {err && <div className="mkt-banner alert" role="status">{err}</div>}
      <p className="faint" style={{ margin: 0 }}>Signed-in members can see this. A post is not a listing and not a county fact.</p>
      {pane === "posts" ? (
        <div className="room-col">
          <form onSubmit={async (e) => { e.preventDefault(); if (await run(() => publishPost(draft))) setDraft(""); }} className="col" style={{ gap: 6 }}>
            <textarea className="input" rows={3} maxLength={POST_MAX} value={draft} onChange={(e) => setDraft(e.target.value)} placeholder="Write a note members can read. Do not promise a return or call something sold." aria-label="Post text" />
            <div className="row between">
              <span className="faint num">{draft.trim().length}/{POST_MAX}</span>
              <Button className="btn sm" type="submit" disabled={busy}>Post this note</Button>
            </div>
          </form>
          <div className="room-scroll tall">
            {!feed.posts.length && <div className="empty">No posts yet. The next note is visible to signed-in members.</div>}
            {feed.posts.map((p) => (
              <article key={p.id} className="room-post">
                <div className="row between wrap" style={{ gap: 6 }}>
                  <span className="micro">{who(p)}</span>
                  <span className="faint num">{when(p.created_at)}</span>
                </div>
                <p>{p.body}</p>
                <div className="row wrap" style={{ gap: 6, marginTop: 8 }}>
                  <Button className="btn ghost sm" type="button" onClick={() => { setReplyTo(replyTo === p.id ? null : p.id); setReply(""); }}>{replyTo === p.id ? "Cancel this reply" : "Reply to this post"}</Button>
                  {mine(p) && <Button className="btn quiet sm" type="button" onClick={() => run(() => removeCommunityPost(p.id))}>Remove this post</Button>}
                </div>
                {(p.replies || []).length > 0 && (
                  <div className="room-replies">
                    {p.replies.map((r) => (
                      <div key={r.id}>
                        <span className="micro">{who(r)}</span>
                        <span className="faint num" style={{ marginLeft: 8 }}>{when(r.created_at)}</span>
                        <p>{r.body}</p>
                        {mine(r) && <Button className="btn quiet sm" type="button" onClick={() => run(() => removeCommunityPost(r.id))}>Remove this reply</Button>}
                      </div>
                    ))}
                  </div>
                )}
                {replyTo === p.id && (
                  <form onSubmit={async (e) => { e.preventDefault(); if (await run(() => publishReply(p.id, reply))) { setReply(""); setReplyTo(null); } }} className="col" style={{ gap: 6, marginTop: 8 }}>
                    <input className="input" maxLength={CHAT_MAX} value={reply} onChange={(e) => setReply(e.target.value)} placeholder="Write a reply members can read" aria-label="Reply text" />
                    <Button className="btn sm" type="submit" disabled={busy}>Post this reply</Button>
                  </form>
                )}
              </article>
            ))}
          </div>
        </div>
      ) : (
        <div className="room-col">
          <div className="room-scroll tall">
            {!feed.chat.length && <div className="empty">No messages yet. The next message is visible to signed-in members.</div>}
            {feed.chat.map((m) => (
              <div key={m.id} className="room-msg">
                <div className="row between wrap" style={{ gap: 6 }}>
                  <span className="micro">{who(m)}</span>
                  <span className="faint num">{when(m.created_at)}</span>
                </div>
                <p>{m.body}</p>
                {mine(m) && <Button className="btn quiet sm" type="button" style={{ marginTop: 6 }} onClick={() => run(() => removeCommunityChat(m.id))}>Remove this message</Button>}
              </div>
            ))}
          </div>
          <form onSubmit={async (e) => { e.preventDefault(); if (await run(() => publishChat(line))) setLine(""); }} className="col" style={{ gap: 6 }}>
            <input className="input" maxLength={CHAT_MAX} value={line} onChange={(e) => setLine(e.target.value)} placeholder="Write a message members can read" aria-label="Chat message" />
            <Button className="btn sm" type="submit" disabled={busy}>Send this message</Button>
          </form>
        </div>
      )}
    </section>
  );
}
