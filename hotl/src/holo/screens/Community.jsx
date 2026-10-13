import React, { useState } from "react";
import { ScreenLead, SecHead, Tabs } from "../ui";
import { Floor } from "../home/Floor";

export default function Community() {
  const [tab, setTab] = useState("posts");
  return (
    <div className="materialize">
      <SecHead ix="12" title="Community" sub="Posts and chat members can see" />
      <ScreenLead does="Read and write posts and chat that signed-in members can see." leads="The member posts, or the member chat. It does not open a listing." />
      <div className="mkt-banner" role="status">A post is not a listing and not a county fact. Do not promise a return or call something sold. Not financial, legal, or tax advice.</div>
      <div style={{ marginTop: 12 }}>
        <Tabs tabs={[["posts", "Posts"], ["chat", "Chat"]]} on={tab} set={setTab} />
      </div>
      <Floor pane={tab} />
    </div>
  );
}
