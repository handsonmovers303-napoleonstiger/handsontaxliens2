export function loadResearchApp() {
  return Promise.all([
    import("./src/lib/storage.js"),
    import("./src/lib/live.js"),
    import("./src/lib/env.js"),
    import("./src/App.jsx"),
  ]).then(([storage, live, env, app]) => ({
    installStorage: storage.installStorage,
    installLive: live.installLive,
    artifact: env.ARTIFACT,
    App: app.default,
  }));
}
