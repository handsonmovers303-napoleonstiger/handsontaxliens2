import { describe, expect, it } from "vitest";
import { allCounties, countyDetail } from "../src/holo/data.js";
import { resourceRows } from "../src/holo/home/CommandCenter.jsx";
import { linkStatus, repairLink, presentLink } from "../src/holo/linkCheck.js";

const day = "2026-10-11";

describe("stored assessor links", () => {
  it("puts the county-file assessor page on the county card without calling it source-supported", () => {
    const county = allCounties().find((row) => row.state === "CO" && row.name === "El Paso");
    const detail = countyDetail(county);
    const assessor = detail.links.find((row) => row[0] === "assessor");
    expect(assessor[2]).toBe("https://assessor.elpasoco.com");
    expect(assessor[3]).toBe("DIRECT");
    const card = resourceRows(detail, day);
    const shown = card.find((row) => row.id === "assessor");
    expect(shown.url).toBe("https://assessor.elpasoco.com");
    expect(shown.status).toBe("Checked");
    expect(shown.note).toMatch(/page was not read/i);
  });

  it("keeps a stored parcel viewer separate from the assessor page", () => {
    const county = allCounties().find((row) => row.state === "IA" && row.name === "Mitchell");
    const detail = countyDetail(county);
    const card = resourceRows(detail, day);
    expect(card.find((row) => row.id === "assessor").url).toBe("https://mitchellcounty.iowa.gov/departments/county-assessor/");
    expect(card.find((row) => row.id === "gis").url).toBe("https://mitchellcounty.iowa.gov/departments/gis/");
    expect(card.find((row) => row.id === "assessor").status).toBe("Checked");
    expect(card.find((row) => row.id === "gis").status).toBe("Checked");
  });

  it("does not mark a link checked when the request was refused", () => {
    const county = allCounties().find((row) => row.state === "CO" && row.name === "Eagle");
    const card = resourceRows(countyDetail(county), day);
    const shown = card.find((row) => row.id === "assessor");
    expect(shown.url).toBe("https://www.eaglecounty.us/departments___services/assessor/index.php");
    expect(shown.status).toBe("Unavailable");
    expect(shown.note).toMatch(/HTTP 403/);
    expect(shown.note).toMatch(/not proof the office removed the page/i);
  });
});

describe("link reachability", () => {
  it("marks a responding stored link checked and says the page was not read", () => {
    const book = { checkedAt: day, urls: { "https://assessor.example.gov": { ok: true, status: 200 } } };
    const mark = linkStatus("https://assessor.example.gov", "DIRECT", book);
    expect(mark.status).toBe("Checked");
    expect(mark.note).toMatch(/page was not read/i);
    expect(mark.status).not.toBe("Source-supported");
  });

  it("keeps an official link source-supported when it still responds or has not been probed", () => {
    const live = { checkedAt: day, urls: { "https://treasurer.example.gov": { ok: true, status: 200 } } };
    expect(linkStatus("https://treasurer.example.gov", "OFFICIAL", live).status).toBe("Source-supported");
    expect(linkStatus("https://treasurer.example.gov", "OFFICIAL", { checkedAt: day, urls: {} }).status).toBe("Source-supported");
  });

  it("marks an official link stale when today's request failed", () => {
    const book = { checkedAt: day, urls: { "https://treasurer.example.gov": { ok: false, status: 404 } } };
    const mark = linkStatus("https://treasurer.example.gov", "OFFICIAL", book);
    expect(mark.status).toBe("Stale");
    expect(mark.note).toMatch(/Opened and read before/);
  });

  it("finds an origin link whether or not the stored check kept the trailing slash", () => {
    const book = { checkedAt: day, urls: { "https://assessor.example.gov": { ok: true, status: 200 } } };
    expect(linkStatus("https://assessor.example.gov/", "DIRECT", book).status).toBe("Checked");
  });

  it("does not call a failed stored link checked", () => {
    const book = { checkedAt: day, urls: { "https://assessor.example.gov": { ok: false, error: "timeout" } } };
    const mark = linkStatus("https://assessor.example.gov", "DIRECT", book);
    expect(mark.status).toBe("Unavailable");
    expect(mark.note).toMatch(/not proof the office removed the page/i);
  });

  it("uses https when the stored http address did not answer and https did", () => {
    const book = {
      checkedAt: day,
      urls: {
        "http://assessor.example.gov/office": { ok: false, status: 404 },
        "https://assessor.example.gov/office": { ok: true, status: 200 },
      },
    };
    expect(presentLink("http://assessor.example.gov/office", book)).toBe("https://assessor.example.gov/office");
    expect(linkStatus("http://assessor.example.gov/office", "DIRECT", book).status).toBe("Checked");
  });
});

describe("scraped link repair", () => {
  it("drops email and javascript placeholders instead of opening them", () => {
    expect(repairLink("http://carrollcounty.us/mailto:jdavidson@carrollcountyassessor.com")).toBeNull();
    expect(repairLink("https://www.reevescounty.org/javascript:void(0);")).toBeNull();
    const reeves = allCounties().find((row) => row.state === "TX" && row.name === "Reeves");
    const links = countyDetail(reeves).links.map((link) => link[2]);
    expect(links.some((url) => /javascript/i.test(url))).toBe(false);
  });

  it("keeps the real address when a scrape glued two links together", () => {
    expect(repairLink("https://www.co.black-hawk.ia.us/ h:ava.fidlar.com/IABlackHawk/AvaWeb/#/search.")).toBe("https://ava.fidlar.com/IABlackHawk/AvaWeb/#/search");
    const county = allCounties().find((row) => row.state === "IA" && row.name === "Black Hawk");
    const recorder = countyDetail(county).links.find((link) => link[0] === "recorder");
    expect(recorder[2]).toBe("https://ava.fidlar.com/IABlackHawk/AvaWeb/#/search");
  });

  it("removes a host that was pasted twice and encodes a space in a file path", () => {
    expect(repairLink("http://grimescountytexas.gov//grimescountytexas.gov/county-clerk")).toBe("http://grimescountytexas.gov/county-clerk");
    expect(repairLink("https://www.leecountync.gov/Document Center/Government/SOTC22_FINAL_10-3-22.pdf")).toBe("https://www.leecountync.gov/Document%20Center/Government/SOTC22_FINAL_10-3-22.pdf");
    expect(repairLink("https://www.islandcountywa.gov/ /271/Parcel-Search")).toBe("https://www.islandcountywa.gov/271/Parcel-Search");
  });
});
