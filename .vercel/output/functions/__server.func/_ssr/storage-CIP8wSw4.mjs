import { t as supabase } from "./supabase-BlpIHCeZ.mjs";
import { t as __exportAll } from "./rolldown-runtime-D7D4PA-g.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/storage-CIP8wSw4.js
var storage_exports = /* @__PURE__ */ __exportAll({
	installStorage: () => installStorage,
	onSyncStatus: () => onSyncStatus,
	storage: () => storage,
	syncStatus: () => syncStatus
});
var LS = "kv:";
var mem = /* @__PURE__ */ new Map();
var listeners = /* @__PURE__ */ new Set();
var backend = null;
var flushTimer = null;
var flushing = false;
var status = {
	online: typeof navigator === "undefined" ? true : navigator.onLine,
	signedIn: false,
	userId: null,
	pending: 0,
	lastSync: null,
	error: null,
	syncing: false,
	email: null,
	mode: "supabase",
	readOnly: false,
	local: false
};
var emit = () => {
	status = {
		...status,
		pending: [...mem.values()].filter((r) => r.dirty).length
	};
	listeners.forEach((f) => f(status));
};
var setStatus = (patch) => {
	status = {
		...status,
		...patch
	};
	emit();
};
var onSyncStatus = (f) => {
	listeners.add(f);
	f(status);
	return () => listeners.delete(f);
};
var syncStatus = () => status;
function readLocal(key) {
	if (mem.has(key)) return mem.get(key);
	try {
		const raw = localStorage.getItem(LS + key);
		if (raw) {
			const r = JSON.parse(raw);
			mem.set(key, r);
			return r;
		}
	} catch {}
	return null;
}
function writeLocal(key, rec) {
	mem.set(key, rec);
	try {
		localStorage.setItem(LS + key, JSON.stringify(rec));
	} catch {}
}
try {
	for (let i = 0; i < localStorage.length; i++) {
		const k = localStorage.key(i);
		if (k && k.startsWith(LS)) readLocal(k.slice(3));
	}
} catch {}
async function flush() {
	flushTimer = null;
	if (!backend || !status.online || status.readOnly) return emit();
	if (flushing) return scheduleFlush();
	const dirty = [...mem.entries()].filter(([, r]) => r.dirty);
	if (!dirty.length) return emit();
	flushing = true;
	setStatus({ syncing: true });
	try {
		const done = await backend.push(dirty.map(([key, r]) => ({
			key,
			v: r.v,
			t: r.t
		})));
		for (const key of done) {
			const cur = mem.get(key);
			const sent = dirty.find(([k]) => k === key);
			if (cur && sent && cur.t === sent[1].t) writeLocal(key, {
				...cur,
				dirty: false
			});
		}
		setStatus({
			syncing: false,
			error: null,
			lastSync: (/* @__PURE__ */ new Date()).toISOString()
		});
	} catch (e) {
		setStatus({
			syncing: false,
			error: e.message || String(e),
			readOnly: !!e.readOnly
		});
	} finally {
		flushing = false;
	}
	if ([...mem.values()].some((r) => r.dirty) && !status.readOnly && !status.error) scheduleFlush();
}
var scheduleFlush = () => {
	if (!flushTimer) flushTimer = setTimeout(flush, 900);
};
/** Merge rows from the backend; newer wins. Returns true when anything changed locally. */
function applyRemote(rows) {
	let changed = false;
	for (const { key, v, t } of rows) {
		const cur = readLocal(key);
		if (!cur || t > cur.t) {
			writeLocal(key, {
				v,
				t,
				dirty: false
			});
			changed = true;
		}
	}
	if (changed) window.dispatchEvent(new CustomEvent("hotl:storage-pulled"));
	return changed;
}
async function pull() {
	if (!backend) return;
	try {
		const rows = await backend.pull();
		applyRemote(rows);
		const remote = new Map(rows.map((r) => [r.key, r.t]));
		for (const [key, r] of mem) if (backend.accepts(key) && (!remote.has(key) || remote.get(key) < r.t)) mem.set(key, {
			...r,
			dirty: true
		});
		setStatus({
			lastSync: (/* @__PURE__ */ new Date()).toISOString(),
			error: null
		});
		await flush();
	} catch (e) {
		setStatus({ error: e.message || String(e) });
	}
}
var storage = {
	async get(key) {
		const r = readLocal(key);
		return r ? {
			key,
			value: r.v
		} : null;
	},
	async set(key, value) {
		writeLocal(key, {
			v: String(value),
			t: Date.now(),
			dirty: true
		});
		emit();
		scheduleFlush();
		return {
			key,
			value
		};
	},
	async delete(key) {
		mem.delete(key);
		try {
			localStorage.removeItem(LS + key);
		} catch {}
		if (backend) await backend.remove(key).catch(() => {});
		return {
			key,
			deleted: true
		};
	},
	async list(prefix = "") {
		return { keys: [...mem.keys()].filter((k) => k.startsWith(prefix)) };
	}
};
function supabaseBackend(user) {
	return {
		accepts: () => true,
		async push(entries) {
			const rows = entries.map((e) => ({
				user_id: user.id,
				key: e.key,
				value: e.v,
				updated_at: new Date(e.t).toISOString()
			}));
			const { error } = await supabase.from("user_kv").upsert(rows, { onConflict: "user_id,key" });
			if (error) throw error;
			return entries.map((e) => e.key);
		},
		async pull() {
			const { data, error } = await supabase.from("user_kv").select("key,value,updated_at");
			if (error) throw error;
			return (data || []).map((r) => ({
				key: r.key,
				v: r.value,
				t: Date.parse(r.updated_at)
			}));
		},
		async remove(key) {
			await supabase.from("user_kv").delete().eq("key", key);
		}
	};
}
function installStorage() {
	if (typeof window === "undefined") return;
	window.storage = storage;
	window.addEventListener("online", () => {
		setStatus({ online: true });
		flush();
	});
	window.addEventListener("offline", () => setStatus({ online: false }));
	const onSession = (session) => {
		const was = backend && backend.uid;
		const user = session ? session.user : null;
		backend = user ? {
			...supabaseBackend(user),
			uid: user.id
		} : null;
		setStatus({
			signedIn: !!user,
			userId: user ? user.id : null,
			email: user ? user.email : null
		});
		if (user && user.id !== was) {
			try {
				sessionStorage.removeItem("hotl:market:ui");
			} catch {}
			window.dispatchEvent(new CustomEvent("hotl:account-switch", { detail: { userId: user.id } }));
			pull();
		}
	};
	supabase.auth.getSession().then(({ data }) => onSession(data.session));
	supabase.auth.onAuthStateChange((_e, session) => onSession(session));
}
//#endregion
export { storage_exports as n, syncStatus as r, onSyncStatus as t };
