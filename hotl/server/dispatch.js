import { presentAlerts, salePushPayload, upcomingAlerts } from "../src/holo/saleAlerts.js";

export function planPushes(subs, events, today, sent, base = "/") {
  const jobs = [];
  for (const sub of subs) {
    if (!sub?.subscription?.endpoint?.startsWith("https://") || !sub.subscription.keys?.p256dh || !sub.subscription.keys?.auth) continue;
    const alerts = presentAlerts(upcomingAlerts(events, {
      today,
      leadDays: sub.leadDays,
      watch: sub.watch || [],
      allSales: !!sub.allSales,
    }));
    for (const alert of alerts) {
      const dedupe = `${sub.subscription.endpoint}|${alert.id}`;
      if (sent.has(dedupe)) continue;
      jobs.push({ dedupe, subscription: sub.subscription, payload: salePushPayload(alert, base) });
    }
  }
  return jobs;
}
