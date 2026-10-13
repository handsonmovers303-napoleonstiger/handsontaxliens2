/** Manual title-search steps. The app does not query a recorder or a title plant. */
export const TITLE_STEPS = [
  { id: "assessor", name: "Assessor or treasurer", gets: "The tax owner, the parcel number, and the legal description.", misses: "Mortgages, easements, heirs, and most liens. This step is not a title search." },
  { id: "recorder", name: "Recorder name index", gets: "Deeds, mortgages, and liens recorded under the names you searched.", misses: "Another spelling, a prior owner, or a document indexed only by legal description." },
  { id: "tract", name: "Tract index, if the county has one", gets: "Documents tied to this parcel rather than to a person.", misses: "Counties that keep only a name index." },
  { id: "court", name: "Court index", gets: "Judgments, lis pendens, and probate under the names you searched.", misses: "A case in another county, or a case under an heir's name." },
  { id: "federal", name: "Federal liens and bankruptcy", gets: "IRS liens and bankruptcy cases you looked up.", misses: "The county recorder. A federal lien can also carry a redemption right after a tax sale." },
  { id: "muni", name: "City or code enforcement", gets: "Open fines, demolition orders, and nuisance liens the office will confirm.", misses: "Items that never get recorded. Many of those survive a tax sale." },
  { id: "oe", name: "Ownership and encumbrance report", gets: "A title company or abstractor's list of recorded documents.", misses: "Insurance. It is a report of what they searched." },
  { id: "insure", name: "Insurability ask", gets: "Whether an underwriter will insure a tax deed from this county, and what they will except.", misses: "A promise. Tax deeds are often uninsurable until a quiet-title case or a waiting period." },
  { id: "quiet", name: "Quiet-title quote", gets: "A local attorney's fee, filing costs, and months.", misses: "Possession. An occupant is a separate case. The quote belongs in your cost before you bid." },
];

export const TITLE_RESULTS = [
  ["open", "Not searched"],
  ["found", "Record found"],
  ["none", "No record in the sources searched"],
  ["unavailable", "Source unavailable"],
  ["paid", "Paid search still required"],
];

const BANNED = /clear title|free and clear|lien-free|title is clear|no liens exist/i;

export function titleConclusion(saved) {
  const notes = TITLE_STEPS.map((step) => saved && saved[step.id]).filter((row) => row && row.result && row.result !== "open");
  const found = notes.filter((row) => row.result === "found").length;
  const detail = notes.length
    ? `${notes.length} of ${TITLE_STEPS.length} steps have a note. ${found} note a record found. No record in the sources searched is not proof that none exists.`
    : "No step has been searched. An empty file is not a clear title.";
  const text = `This is not a title opinion. ${detail} Nothing here insures the title.`;
  if (BANNED.test(text)) throw new Error("Title conclusion used a banned phrase.");
  return text;
}
