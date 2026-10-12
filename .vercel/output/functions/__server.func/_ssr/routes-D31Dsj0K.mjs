import { i as __toESM } from "../_runtime.mjs";
import { G as require_jsx_runtime, K as require_react } from "../_libs/@tanstack/react-router+[...].mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/routes-D31Dsj0K.js
var import_react = /* @__PURE__ */ __toESM(require_react());
var import_jsx_runtime = require_jsx_runtime();
function loadResearchApp() {
	return Promise.all([
		import("./storage-CIP8wSw4.mjs").then((n) => n.n),
		import("./live-C-rRXH6n.mjs").then((n) => n.t),
		import("./env-A6UFay6O.mjs").then((n) => n.n),
		import("./App-Bqk9KVKv.mjs")
	]).then(([storage, live, env, app]) => ({
		installStorage: storage.installStorage,
		installLive: live.installLive,
		artifact: env.ARTIFACT,
		App: app.default
	}));
}
function Home() {
	const [App, setApp] = (0, import_react.useState)(null);
	(0, import_react.useEffect)(() => {
		let on = true;
		loadResearchApp().then((loaded) => {
			if (!on) return;
			loaded.installStorage();
			if (!loaded.artifact) loaded.installLive();
			setApp(() => loaded.App);
		});
		return () => {
			on = false;
		};
	}, []);
	if (!App) return /* @__PURE__ */ (0, import_jsx_runtime.jsx)("main", {
		style: {
			minHeight: "100vh",
			background: "#05060A",
			color: "#F4F8FC",
			padding: 24
		},
		children: "Loading the research files…"
	});
	return /* @__PURE__ */ (0, import_jsx_runtime.jsx)(App, {});
}
//#endregion
export { Home as component };
