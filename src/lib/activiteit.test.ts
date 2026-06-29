import { describe, it, expect } from "vitest";
import { formatDuur, formatDatum, DUUR_OPTIES, ACTIVITEIT_TYPES, ACTIVITEIT_ICON } from "@/lib/activiteit";

describe("activiteit helpers", () => {
  describe("formatDuur", () => {
    it("formatteert minuten onder 60", () => {
      expect(formatDuur(15)).toBe("15m");
      expect(formatDuur(45)).toBe("45m");
    });

    it("formatteert uren voor 60+ minuten", () => {
      expect(formatDuur(60)).toBe("1u");
      expect(formatDuur(90)).toBe("1.5u");
      expect(formatDuur(120)).toBe("2u");
    });
  });

  describe("formatDatum", () => {
    it("formatteert in het Nederlands", () => {
      const d = new Date("2025-06-15T12:00:00");
      expect(formatDatum(d)).toBe("15 jun");
    });

    it("accepteert extra opties", () => {
      const d = new Date("2025-06-15T12:00:00");
      expect(formatDatum(d, { weekday: "short", day: "numeric", month: "short" })).toBe("zo 15 jun");
    });
  });

  describe("DUUR_OPTIES", () => {
    it("bevat de standaard opties", () => {
      expect(DUUR_OPTIES).toEqual(["15", "30", "45", "60", "90", "120"]);
    });
  });

  describe("ACTIVITEIT_TYPES", () => {
    it("bevat alle 8 types", () => {
      expect(ACTIVITEIT_TYPES).toHaveLength(8);
      expect(ACTIVITEIT_TYPES.map((t) => t.label)).toContain("Wandelen");
      expect(ACTIVITEIT_TYPES.map((t) => t.label)).toContain("Anders");
    });
  });

  describe("ACTIVITEIT_ICON", () => {
    it("bevat alle types", () => {
      expect(Object.keys(ACTIVITEIT_ICON)).toHaveLength(8);
      expect(ACTIVITEIT_ICON["Wandelen"]).toBeDefined();
    });

    it("heeft icon, kleur en bg per type", () => {
      const wandelen = ACTIVITEIT_ICON["Wandelen"];
      expect(wandelen).toHaveProperty("icon");
      expect(wandelen).toHaveProperty("kleur");
      expect(wandelen).toHaveProperty("bg");
    });
  });
});
