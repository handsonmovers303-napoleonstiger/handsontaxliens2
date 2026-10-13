import { describe, expect, it } from "vitest";
import { buttonClass, cardClass } from "../src/holo/ds.jsx";

describe("design system classes", () => {
  it("keeps one button class list for each variant", () => {
    expect(buttonClass({ variant: "primary", size: "md" })).toBe("btn");
    expect(buttonClass({ variant: "secondary", size: "sm", pressed: true })).toBe("btn quiet sm on");
    expect(buttonClass({ variant: "destructive", loading: true, fullWidth: true })).toBe("btn danger is-loading block");
    expect(buttonClass({ variant: "ghost", className: "btn ghost sm" })).toBe("btn ghost sm");
    expect(buttonClass({ className: "chip btn-chip cy" })).toBe("chip btn-chip cy");
  });

  it("uses the card shell for panels and the row shell for lists", () => {
    expect(cardClass({ variant: "selected", clickable: true })).toBe("icard selected is-click");
    expect(cardClass({ variant: "warning", clickable: true, className: "list-item on" })).toBe("is-click list-item on");
    expect(cardClass({ className: "mnode", clickable: true })).toBe("is-click mnode");
  });
});
