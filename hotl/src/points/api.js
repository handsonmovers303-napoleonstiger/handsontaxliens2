import { supabase } from "../lib/supabase";

export function pointsError(error) {
  const message = error?.message || "The points ledger did not respond.";
  if (/does not exist|schema cache|scout_/i.test(message)) return "The Scout Points tables are not on this database yet.";
  return message;
}

export async function loadAccountPoints() {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { signedIn: false };
  const [balance, contributions, ledger, reviewer, rewards] = await Promise.all([
    supabase.rpc("scout_my_balance"),
    supabase.from("scout_contributions").select("*").order("created_at", { ascending: false }),
    supabase.from("scout_point_ledger").select("*").order("created_at", { ascending: false }),
    supabase.from("scout_reviewers").select("user_id").eq("user_id", user.id).maybeSingle(),
    supabase.from("scout_rewards").select("*"),
  ]);
  const error = balance.error || contributions.error || ledger.error || reviewer.error;
  if (error) return { signedIn: true, userId: user.id, error: pointsError(error) };
  let pending = [];
  if (reviewer.data) {
    const queue = await supabase.from("scout_contributions").select("*").eq("status", "pending").order("created_at");
    if (queue.error) return { signedIn: true, userId: user.id, error: pointsError(queue.error) };
    pending = queue.data || [];
  }
  return {
    signedIn: true,
    userId: user.id,
    reviewer: !!reviewer.data,
    balance: balance.data || 0,
    contributions: contributions.data || [],
    ledger: ledger.data || [],
    rewards: rewards.data || [],
    pending,
  };
}

export async function submitContribution(input) {
  const { data, error } = await supabase.rpc("scout_submit", {
    p_kind: input.kind,
    p_title: input.title || "",
    p_context: input.context || "",
    p_source_url: input.sourceUrl || "",
    p_county: input.county || "",
    p_state: input.state || "",
    p_parcel_ref: input.parcelRef || "",
    p_share: !!input.share,
    p_rules: !!input.rulesAccepted,
  });
  if (error) throw new Error(pointsError(error));
  return data;
}

export async function reviewContribution(id, decision, note) {
  const { data, error } = await supabase.rpc("scout_review", { p_id: id, p_decision: decision, p_note: note || "" });
  if (error) throw new Error(pointsError(error));
  return data;
}

export async function withdrawContribution(id) {
  const { data, error } = await supabase.rpc("scout_withdraw", { p_id: id });
  if (error) throw new Error(pointsError(error));
  return data;
}

export async function redeemReward(code, requestKey) {
  const { data, error } = await supabase.rpc("scout_redeem", { p_code: code, p_request: requestKey });
  if (error) throw new Error(pointsError(error));
  return data;
}

export async function adjustPoints(memberId, amount, reason, requestKey) {
  const { data, error } = await supabase.rpc("scout_adjust", { p_member: memberId, p_amount: amount, p_reason: reason, p_request: requestKey });
  if (error) throw new Error(pointsError(error));
  return data;
}
