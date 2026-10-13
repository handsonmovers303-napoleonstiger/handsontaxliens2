export const SOCIAL_CHECKS = [
  ["account", "before", "The post is about a certificate in this member account, not a parcel you only researched."],
  ["file", "before", "The tax certificate file is uploaded. A screenshot of a list is not the certificate."],
  ["county", "before", "You are not calling it for sale until someone else has matched it to the county record."],
  ["others", "before", "You are not posting another member's draft, offer, or holder name."],
  ["identity", "say", "The post names the county and certificate year only, and says it is a tax-lien certificate."],
  ["price", "say", "A price appears only if that listing is active. A draft price stays off the post."],
  ["date", "say", "A sale date appears only if it is on file. A derived date is labeled derived."],
  ["not-property", "say", "The post says the buyer is looking at the certificate, not the property."],
  ["no-return", "never", "The post does not promise a return, a redemption, or a buyer."],
  ["no-name", "never", "The holder name, the certificate file, and private messages are not in the post."],
  ["no-closed", "never", "The post does not say sold unless the transfer was reconciled. An offer is not a sale."],
  ["no-self", "never", "The post does not say you approved your own listing. You cannot."],
  ["pull", "after", "You will take the post down if the county shows the certificate redeemed, assigned, or not found."],
  ["stale", "after", "You will correct the post if the listing is paused or the county check expires."],
];

export const SOCIAL_GROUPS = [
  ["before", "Before you post"],
  ["say", "What the post may say"],
  ["never", "What the post must not say"],
  ["after", "After it is up"],
];

export function buildCaption({ county, year, listed }) {
  const place = county && year ? `${String(county).trim()}, ${String(year).trim()} tax-lien certificate.` : "Tax-lien certificate.";
  const sale = listed ? " Shown in the member market after a county check." : " Not listed until a county check is done.";
  return `${place}${sale} This is the certificate, not the property. Redemption is not promised. Not financial, legal, or tax advice.`;
}
