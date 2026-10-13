/** Closed-loop product points. Not a coin, not cash, and not a claim on a tax lien. */
export const POINT_VALUES = {
  county_update: 25,
  auction_update: 20,
  property_photo: 15,
};

export const EXPIRE_MONTHS = 24;

export const REWARDS = [
  { code: "research_desk", label: "Research desk for 30 days", cost: 200, detail: "Opens paid research tools on this site for 30 days. This is not a tax lien and it is not cash." },
  { code: "photo_archive", label: "Shared photo archive for 12 months", cost: 150, detail: "Keeps your approved scout photos in the paid-member research layer for 12 months." },
  { code: "subscription_credit", label: "Subscription credit", cost: 800, detail: "One credit toward a Hands On Tax Liens subscription. It cannot be cashed out or used to buy a tax lien." },
];

export const RULES = [
  "Points are a closed-loop product reward. They are not a cryptocurrency, they cannot be transferred, and they have no cash value.",
  "Points cannot be exchanged for property, a tax lien, or a tax deed, and they are not a return on an investment.",
  "You earn points only for research you choose to submit to the shared paid-member layer.",
  "A private watchlist, note, bid limit, or saved search does not earn points.",
  "A person reviews the submission before any points are posted. Duplicate, unsupported, misleading, or improperly shared material is rejected and earns nothing.",
  "Each approved contribution is rewarded once. A second approval does not post a second award.",
  "A redemption is refused if it would drop the balance below zero. The attempt is not written as a spend.",
  "Rejecting a submission that was never approved posts no points. Withdrawing an approved contribution, or rejecting it after approval, posts one reversal for that award.",
  "Unused points from an award expire 24 months after the award is posted. Expiration is its own ledger entry.",
  "A reviewer may post an adjustment only with a written reason. Members cannot edit the balance.",
];

export function rewardByCode(code) {
  return REWARDS.find((r) => r.code === code) || null;
}
