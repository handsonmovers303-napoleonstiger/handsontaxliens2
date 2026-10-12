import { t as supabase } from "./supabase-BlpIHCeZ.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/live-C-rRXH6n.js
var live_exports = /* @__PURE__ */ __exportAll({
	installLive: () => installLive,
	loadLive: () => loadLive,
	onLive: () => onLive,
	reportIntel: () => reportIntel
});
var state = {
	loaded: false,
	rows: 0,
	at: null,
	error: null,
	listen: "off"
};
var subs = /* @__PURE__ */ new Set();
var onLive = (f) => {
	subs.add(f);
	f(state);
	return () => subs.delete(f);
};
var emit = () => {
	subs.forEach((f) => f(state));
	window.dispatchEvent(new CustomEvent("hotl:live", { detail: state }));
};
async function pageAll(table, cols) {
	const out = [];
	for (let from = 0;; from += 1e3) {
		const { data, error } = await supabase.from(table).select(cols).range(from, from + 999);
		if (error) throw error;
		out.push(...data);
		if (data.length < 1e3) return out;
	}
}
async function loadLive() {
	try {
		const rows = await pageAll("county_intel_current", "fips,field,value,source,confidence,author_name,created_at");
		const m = /* @__PURE__ */ new Map();
		for (const r of rows) m.set(`${r.fips}:${r.field}`, r);
		window.__hotlLive = m;
		try {
			const mail = await pageAll("outreach_latest", "*");
			window.__hotlOutreach = new Map(mail.map((r) => [r.fips, r]));
		} catch {}
		state = {
			...state,
			loaded: true,
			rows: rows.length,
			at: (/* @__PURE__ */ new Date()).toISOString(),
			error: null
		};
	} catch (e) {
		state = {
			...state,
			error: e.message || String(e)
		};
	}
	emit();
	return state;
}
var channel = null;
var reloadTimer = null;
function scheduleReload() {
	clearTimeout(reloadTimer);
	reloadTimer = setTimeout(() => {
		loadLive();
	}, 400);
}
function listen() {
	if (channel) return;
	channel = supabase.channel("county-intel-live", { config: {
		private: true,
		postgres_changes_options: { wait: true }
	} }).on("postgres_changes", {
		event: "*",
		schema: "public",
		table: "county_intel"
	}, () => scheduleReload()).subscribe((status) => {
		const listen = status === "SUBSCRIBED" ? "realtime" : status === "CHANNEL_ERROR" || status === "TIMED_OUT" || status === "CLOSED" ? "poll" : "connecting";
		state = {
			...state,
			listen
		};
		emit();
	});
}
function stopListening() {
	clearTimeout(reloadTimer);
	if (channel) supabase.removeChannel(channel);
	channel = null;
	state = {
		...state,
		listen: "off"
	};
	emit();
}
function installLive() {
	const go = (session) => {
		if (!session) {
			stopListening();
			return;
		}
		loadLive();
		listen();
	};
	supabase.auth.getSession().then(({ data }) => go(data.session));
	supabase.auth.onAuthStateChange((evt, session) => {
		if (evt === "SIGNED_IN" || evt === "TOKEN_REFRESHED") go(session);
		if (evt === "SIGNED_OUT") stopListening();
	});
	setInterval(() => supabase.auth.getSession().then(({ data }) => {
		if (data.session) loadLive();
	}), 6e5);
}
/** Team-submitted correction: goes to county_intel as REPORTED; review promotes it. */
async function reportIntel({ fips, field, value, source, authorName }) {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) throw new Error("Sign in to submit intel");
	const { error } = await supabase.from("county_intel").insert({
		fips,
		field,
		value,
		source,
		confidence: "REPORTED",
		author: user.id,
		author_name: authorName || user.email
	});
	if (error) throw error;
	await loadLive();
}
//#endregion
export { onLive as n, live_exports as t };
