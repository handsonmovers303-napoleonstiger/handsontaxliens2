export type FactLevel = "opened" | "on_file" | "statute" | "derived" | "workbook" | "gap";

export type SourceRef = {
  title: string;
  url?: string;
  retrieved?: string;
};

export type Fact = {
  label: string;
  value: string;
  level: FactLevel;
  source?: SourceRef;
  caveat?: string;
};

export type CountyLink = {
  label: string;
  url: string;
  level: "OFFICIAL" | "SECONDARY" | "DIRECT" | "UNVERIFIED";
  kind: string;
  note?: string;
};

export type CalEvent = {
  id: string;
  kind: "sale" | "registration" | "payment" | "reminder";
  iso: string;
  title: string;
  details: string;
  location?: string;
  level: FactLevel;
  source?: SourceRef;
};

export type County = {
  fips: string;
  name: string;
  state: string;
  stateName: string;
  system: "lien" | "deed" | "unknown";
  bidLead: string | null;
  phone: string | null;
  phoneLevel: "opened" | "workbook";
  population: number | null;
  terrain: string | null;
  workbookHeadline: string | null;
  statuteVerified: boolean;
  links: CountyLink[];
  facts: Fact[];
  events: CalEvent[];
  officialUrl: string | null;
};

export type StateRule = {
  abbr: string;
  name: string;
  verified: boolean;
  mechanism: string | null;
  instrument: string;
  headline: string | null;
  statutoryRate: number | null;
  redemption: string | null;
  note: string | null;
  stale: string | null;
  rules: string[];
  sources: { title: string; host: string; checked: string }[];
};

export type Catalog = {
  built: string;
  sourceArchive: string;
  readingsRetrieved: string;
  countyCount: number;
  states: Record<string, StateRule>;
  counties: County[];
};
