# Certificate marketplace — first release

Inspected repository: `handsonmovers303-napoleonstiger/handsontaxliens`
Branch: `claude/serene-cray-lnlmhu`
Commit: `7f4661135e809519eda46b742dd0496632e58d6d`

This patch is not published. Do not merge it to the Pages branch, and do not turn trading flags on, until the launch dependencies below are done.

## What was found

The member app in this repo is the Vite + React cockpit (`src/App.jsx`): Home, Console (Quantum Search), Grid, Counties, Dossiers, Missions, Scout, Routes, Auctions, Portfolio, Learning, and the full deck. Account data is per-scout `user_kv` plus Supabase auth. There is no shared marketplace schema. Portfolio positions are a research ledger. They are not proof of a transferable certificate.

Older HTML and the public `handsontaxliens-production` repo were not used as the source.

## What this adds

- `src/marketplace/engine.js` — tested rules for drafts, review, catalog allowlist, offers, one reserved transfer, redemption, and signed provider events. Flags start off. No county is seeded as tradable.
- `src/holo/screens/Marketplace.jsx` — Browse, Sell, Requests, My offers, Transfers, and a local operator desk.
- Portfolio action **Sell this holding**. Quantum Search actions for marketplace, a sale draft, and a buyer request.
- `supabase/migrations/20261006120000_marketplace.sql` — tables, RLS, catalog view, and a `market_dispatch` function that **refuses commands**. Members have no direct write policies.

The in-browser local ledger is a review copy on one device. It is how the seller → buyer → transfer loop can be walked before Supabase is wired. It is not production, and it is labeled that way. Switching local identities does not create member accounts.

## Launch dependencies

1. Port `src/marketplace/engine.js` into `market_dispatch` (or call that module from a server you control). Until then, signed-in members cannot publish.
2. Assign reviewer rows in `marketplace_roles` with the service role. The client cannot grant that role.
3. Legal review of the operating model, then set flags and county rows explicitly. Do not enable Arizona, Florida, or all of Colorado from the statute links.
4. An external settlement provider approved for this asset class. Configure its signing secret only on the server. The UI has no “mark paid” control. Completion stays blocked with **External settlement integration pending**.
5. Private Storage bucket for evidence, with short-lived signed URLs. This patch stores evidence metadata only; the local copy does not keep file bytes after reload.
6. Apply the migration to project `hapdhoqlouxezgdpfvuu` only when you intend to. This build does not apply it.

## Measures

The operator desk defines the denominators in the engine: listings that became active, offers recorded, transfers opened, reconciled sales, and redemptions counted separately. Empty measures stay blank. There is no liquidity score.

## Live site, later

Do not connect this review copy to the public site while the flow is still being tuned.

Today the public Marketplace is [handsontaxliens.com/marketplace/](https://handsontaxliens.com/marketplace/). It is a research catalog of county open-data lien records. The page already says each entry is a lien filed against a parcel, not an offer of sale. Membership tiers gate that catalog. It is not this secondary-sale flow.

When the member flow is ready, integration is a link, not a second marketplace:

1. A signed-in member can open one public-catalog row into **Sell** as an unconfirmed draft (`publicCatalogToDraft` in `src/marketplace/liveHandoff.js`).
2. Estimated value, discount, and photos are dropped. The lien amount may prefill principal only. Certificate number and asking price stay blank.
3. The draft still cannot be submitted until a county is enabled and the listing flag is on.
4. Offers and asking prices do not appear on the public page until that flag, the county approval, and the settlement provider exist.
5. The public catalog is not imported as inventory. Allegheny County rows, or any other open-data rows, are not listings.

## County record check

A listing cannot be approved from the seller's file. The reviewer checklist requires a county record: an https URL on the official host stored for that county, the date retrieved, and the result. The certificate number, year, shown parcel, and shown amount have to match. Redeemed, assigned, and not-found results cannot be approved. `handsontaxliens.com` cannot be the county host or the source URL. The holder name stays off the buyer catalog. The public line is "Retrieved from [host] on [date]," not a verification badge. A new file or a material edit clears the county record.

`members.handsontaxliens.com` is this same member cockpit. Market is a tab in that app (`#market`, `#market/sell`). A signed-in member's drafts are stored on this browser under that account. They are not shown to other members. The member account cannot turn trading on, approve a county, or approve a listing. The unsigned review copy on this device is a separate ledger, used to walk the operator loop before anything is published.

## Walkthrough in this review copy

Seller: Portfolio **Sell this holding**, or Market → Sell. Steps are the certificate, upload of the tax certificate, how it was acquired and the holder name, the asking price, then send for a county check. The holder name and file stay off the buyer catalog. The seller cannot approve the listing.

Buyer: Browse an active listing, type the certificate number and year, and confirm the offer is for the certificate rather than the property. Then enter an amount and an expiry. Buyer requests match only real geography, year, and price. An offer is not a transfer.

Reviewer: A different person opens the official county host, types the number, year, amount, and holder shown there, and checks the five review items. A mismatch, a HOTL URL, a redeemed or missing record, or the reviewer's own listing is rejected.

Transfer: The seller selects one open offer. A second selection does not open a second case. Completion needs the official assignment reference and a signed provider funds-release event. Redemption freezes the case and is not counted as a sale. With no provider configured, the screen says external settlement is pending and nobody can mark it paid.

The same working tree also has a sale calendar, a local push server, and a social posting checklist. Those are not required to walk the certificate loop, and they are not deployed.

## Validation

`npx vitest run` covers the marketplace rules, including the county-record match, the holder-name match, the required tax-certificate file, and the buyer confirmation. `npm run build` is the member app production build. Neither command publishes the site.

