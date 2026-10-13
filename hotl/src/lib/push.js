import { salePushPayload } from "../holo/saleAlerts.js";

const SUB_KEY = "hotl:push:subscription";

function urlBase64ToUint8Array(base64) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const b64 = (base64 + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(b64);
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

async function syncSubscription(subscription, prefs) {
  const res = await fetch("/api/push/sync", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      subscription: subscription.toJSON(),
      watch: prefs.watch || [],
      leadDays: prefs.leadDays || 7,
      allSales: !!prefs.allSales,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) return { ok: false, message: data.message || "The push server did not accept this browser." };
  return { ok: true, message: data.message };
}

export async function enablePush(prefs = {}) {
  if (typeof navigator === "undefined" || !("serviceWorker" in navigator) || typeof Notification === "undefined") {
    return { ok: false, message: "This browser cannot show system notifications." };
  }
  const permission = await Notification.requestPermission();
  if (permission !== "granted") return { ok: false, message: "Notifications stay off until the browser allows them." };
  const base = import.meta.env.BASE_URL || "/";
  const reg = await navigator.serviceWorker.register(`${base}sw.js`, { scope: base });
  await navigator.serviceWorker.ready;
  const vapid = import.meta.env.VITE_VAPID_PUBLIC_KEY;
  if (!vapid || !reg.pushManager) {
    return { ok: true, subscribed: false, message: "Notifications are on for this device while the app is open. The push key is missing, so a closed browser cannot receive them." };
  }
  const subscription = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: urlBase64ToUint8Array(vapid) });
  try { await window.storage?.set(SUB_KEY, JSON.stringify(subscription.toJSON())); } catch { /* the server copy is the one that sends */ }
  let synced;
  try { synced = await syncSubscription(subscription, prefs); }
  catch { synced = { ok: false, message: "This browser is subscribed, but the push server is not running." }; }
  return { ok: true, subscribed: true, server: synced.ok, message: synced.message || "This browser is subscribed." };
}

export async function syncPushPrefs(prefs) {
  if (!("serviceWorker" in navigator)) return { ok: false };
  const reg = await navigator.serviceWorker.getRegistration();
  const subscription = await reg?.pushManager?.getSubscription();
  if (!subscription) return { ok: false };
  try { return await syncSubscription(subscription, prefs); }
  catch { return { ok: false, message: "The push server is not running." }; }
}

export async function showSalePushes(alerts) {
  if (!("serviceWorker" in navigator)) return false;
  const reg = await navigator.serviceWorker.ready;
  const worker = reg.active;
  if (!worker) return false;
  const base = import.meta.env.BASE_URL || "/";
  for (const alert of alerts) worker.postMessage(salePushPayload(alert, base));
  return true;
}
