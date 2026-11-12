import type { FactLevel } from "./types";

export const LEVEL_LABEL: Record<FactLevel, string> = {
  opened: "Opened and read",
  on_file: "On file",
  statute: "State statute",
  derived: "Derived",
  workbook: "Workbook lead",
  gap: "Not on file",
};

const CAVEAT: Record<string, string> = {
  "statute-county":
    "State statute on file. County procedure can still differ. Confirm on the county page before you register.",
  "workbook-system":
    "Workbook classification. This state's statute has not been verified in this file.",
  "workbook-figure":
    "Workbook figure. Not confirmed against a statute or a county page in this file.",
  "derived-ia":
    "Derived from Iowa's statewide third-Monday-in-June cycle (Iowa Code 446.7). A treasurer may move the sale. This is not a notice opened for this county.",
  "derived-fl":
    "Carried forward from the 2026 Florida certificate-sale cycle. Not a 2027 announcement opened for this county.",
  "derived-az":
    "Stored in the September 2026 research roster for the February cycle. Not reconfirmed as a published auction day on November 12, 2026.",
  derived: "Marked derived in the research file. Not a page opened for this county.",
  file: "County research file, checked September 4, 2026. Not re-opened on November 12, 2026.",
};

export function caveatText(code?: string): string | null {
  if (!code) return null;
  return CAVEAT[code] || code;
}

export function linkNote(note?: string): string {
  if (!note) return "";
  if (note === "direct") return "Directory link from the county database. Not opened for this file.";
  if (note === "file") return CAVEAT.file;
  if (note === "opened") return "Opened and read November 12, 2026.";
  if (note === "dor") return "Listed on the Florida DOR 2026 certificate-sale sheet.";
  return note;
}

export function systemLabel(system: "lien" | "deed" | "unknown"): string {
  if (system === "lien") return "Tax lien";
  if (system === "deed") return "Tax deed";
  return "Unclassified";
}
