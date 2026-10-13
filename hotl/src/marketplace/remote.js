/** Server-side ledger. Roles come from the caller, never from bootstrapLocalOperator. */
import { createLedger } from "./engine.js";

export function createRemoteMarket({ roles = {}, clock = "2026-10-06T15:00:00.000Z" } = {}) {
  let snap = null;
  function open(actorId) {
    const ledger = createLedger({
      ...(snap || {}),
      mode: "remote",
      roles,
      audience: "review",
      clock: snap?.clock || clock,
    });
    if (!(roles[actorId] || []).includes("reviewer")) ledger.setAudience("member");
    return ledger;
  }
  return {
    async command(actor, name, payload, opts) {
      const ledger = open(actor?.id);
      const res = await ledger.command(actor, name, payload, opts);
      if (res.ok) {
        const saved = ledger.snapshot();
        saved.mode = "remote";
        saved.roles = {};
        saved.audience = "review";
        snap = saved;
      }
      return res;
    },
    snapshot() {
      return snap;
    },
    view(actorId) {
      return open(actorId).view(actorId);
    },
  };
}
