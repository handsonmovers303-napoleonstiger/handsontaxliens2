import React from "react";
import { createRoot } from "react-dom/client";
import { installStorage } from "./lib/storage";
import { installLive } from "./lib/live";
import { ARTIFACT } from "./lib/env";
import App from "./App.jsx";

installStorage();   // window.storage → local first, Supabase sync when signed in
if (!ARTIFACT) installLive();   // window.__hotlLive → verified team corrections from county_intel_current

createRoot(document.getElementById("root")).render(<App />);
