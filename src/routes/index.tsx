import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState, type ComponentType } from "react";
import { loadResearchApp } from "research-app";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  const [App, setApp] = useState<ComponentType | null>(null);
  useEffect(() => {
    let on = true;
    void loadResearchApp().then((loaded) => {
      if (!on) return;
      loaded.installStorage();
      if (!loaded.artifact) loaded.installLive();
      setApp(() => loaded.App);
    });
    return () => {
      on = false;
    };
  }, []);
  if (!App) {
    return (
      <main style={{ minHeight: "100vh", background: "#05060A", color: "#F4F8FC", padding: 24 }}>
        Loading the research files…
      </main>
    );
  }
  return <App />;
}
