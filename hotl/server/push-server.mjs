import fs from "node:fs";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import webpush from "web-push";
import { planPushes } from "./dispatch.js";
import { saleEventsFromSource } from "./sales.js";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const vapidPath = path.join(root, "server", "vapid.json");
const subPath = path.join(root, "server", "subscriptions.json");
const sentPath = path.join(root, "server", "sent.json");
const port = Number(process.env.PUSH_PORT || 8787);

const vapid = JSON.parse(fs.readFileSync(vapidPath, "utf8"));
webpush.setVapidDetails(vapid.subject, vapid.publicKey, vapid.privateKey);

const events = saleEventsFromSource(fs.readFileSync(path.join(root, "src", "legacy", "ScoutingDept.jsx"), "utf8"));
const subs = new Map();
const sent = new Set();

function load() {
  try { for (const row of JSON.parse(fs.readFileSync(subPath, "utf8"))) subs.set(row.subscription.endpoint, row); } catch { /* none yet */ }
  try { for (const id of JSON.parse(fs.readFileSync(sentPath, "utf8"))) sent.add(id); } catch { /* none yet */ }
}
function saveSubs() { fs.writeFileSync(subPath, JSON.stringify([...subs.values()])); }
function saveSent() { fs.writeFileSync(sentPath, JSON.stringify([...sent])); }

function validSub(subscription) {
  return subscription && typeof subscription.endpoint === "string" && subscription.endpoint.startsWith("https://")
    && subscription.keys && typeof subscription.keys.p256dh === "string" && typeof subscription.keys.auth === "string";
}

async function dispatch() {
  const today = new Date().toISOString().slice(0, 10);
  const jobs = planPushes([...subs.values()], events, today, sent, "/");
  let sentCount = 0;
  for (const job of jobs) {
    try {
      await webpush.sendNotification(job.subscription, JSON.stringify(job.payload));
      sent.add(job.dedupe);
      sentCount += 1;
    } catch (err) {
      if (err.statusCode === 404 || err.statusCode === 410) subs.delete(job.subscription.endpoint);
    }
  }
  saveSubs();
  saveSent();
  return { checked: subs.size, sent: sentCount, dates: events.length };
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on("data", (c) => chunks.push(c));
    req.on("end", () => {
      try { resolve(chunks.length ? JSON.parse(Buffer.concat(chunks).toString()) : {}); }
      catch { reject(new Error("BAD_JSON")); }
    });
    req.on("error", reject);
  });
}

load();
const server = http.createServer(async (req, res) => {
  const send = (code, body) => { res.writeHead(code, { "content-type": "application/json" }); res.end(JSON.stringify(body)); };
  try {
    if (req.method === "GET" && req.url === "/api/push/health") {
      return send(200, { ok: true, dates: events.length, subscriptions: subs.size, publicKey: vapid.publicKey });
    }
    if (req.method === "POST" && req.url === "/api/push/sync") {
      const body = await readBody(req);
      if (!validSub(body.subscription)) return send(400, { ok: false, message: "A browser push subscription is required." });
      subs.set(body.subscription.endpoint, {
        subscription: { endpoint: body.subscription.endpoint, keys: { p256dh: body.subscription.keys.p256dh, auth: body.subscription.keys.auth } },
        watch: Array.isArray(body.watch) ? body.watch.slice(0, 200) : [],
        leadDays: body.leadDays,
        allSales: !!body.allSales,
      });
      saveSubs();
      const result = await dispatch();
      return send(200, { ok: true, ...result, message: "Subscription saved. Due sale alerts were sent. The server does not accept a custom message." });
    }
    return send(404, { ok: false });
  } catch (err) {
    return send(500, { ok: false, message: "The push server could not finish that." });
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`push server on 127.0.0.1:${port} with ${events.length} sale dates`);
  setInterval(dispatch, 5 * 60 * 1000).unref();
});
