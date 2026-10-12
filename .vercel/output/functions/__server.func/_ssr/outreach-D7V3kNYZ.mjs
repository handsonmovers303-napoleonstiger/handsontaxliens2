import { t as supabase } from "./supabase-BlpIHCeZ.mjs";
//#region node_modules/.nitro/vite/services/ssr/assets/outreach-D7V3kNYZ.js
var DUPE_DAYS = 14;
async function recent(fips) {
	const since = (/* @__PURE__ */ new Date(Date.now() - DUPE_DAYS * 864e5)).toISOString();
	const { data } = await supabase.from("outreach").select("id,author_name,status,created_at,to_address").eq("fips", fips).gte("created_at", since).order("created_at", { ascending: false }).limit(1);
	return data && data[0];
}
async function log({ county, to, toName, subject, body, asked, status }) {
	const { data: { user } } = await supabase.auth.getUser();
	if (!user) return {
		ok: false,
		reason: "sign in to log outreach"
	};
	const { error } = await supabase.from("outreach").insert({
		fips: county.fips,
		county_name: county.name,
		state: county.state,
		channel: "email",
		to_address: to,
		to_name: toName,
		subject,
		body,
		asked,
		status,
		author: user.id,
		author_name: user.email
	});
	if (error) return {
		ok: false,
		reason: error.message
	};
	return { ok: true };
}
async function openAndLog({ county, to, toName, subject, body, asked, client }) {
	if (!to) return {
		ok: false,
		reason: "No verified email on file for this office."
	};
	const logged = await log({
		county,
		to,
		toName,
		subject,
		body,
		asked,
		status: "OPENED"
	});
	const url = client === "mailto" ? `mailto:${encodeURIComponent(to)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` : `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
	window.open(url, "_blank", "noopener");
	return {
		ok: true,
		logged
	};
}
async function sendEmail({ county, to, force }) {
	if (!to) return {
		ok: false,
		reason: "No verified email on file for this office."
	};
	if (!force && county.fips) {
		const r = await recent(county.fips).catch(() => null);
		if (r) return {
			ok: false,
			duplicate: true,
			reason: `${r.author_name || "A teammate"} already wrote ${county.name} County on ${r.created_at.slice(0, 10)}.`,
			hint: "Send anyway only if the question is new."
		};
	}
	return {
		ok: false,
		reason: "direct send needs a mail gateway, which this build does not have",
		hint: "use Open in Gmail — it logs first, then opens the draft"
	};
}
//#endregion
export { openAndLog, sendEmail };
