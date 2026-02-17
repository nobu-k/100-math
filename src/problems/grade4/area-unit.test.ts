import { describe, it, expect } from "vitest";
import { generateAreaUnit } from "./area-unit";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateAreaUnit
// ---------------------------------------------------------------------------
describe("generateAreaUnit", () => {
  it("returns 10 problems", () => {
    const problems = generateAreaUnit(42, "cm-m");
    expect(problems).toHaveLength(10);
  });

  it("cm-m mode: questions involve cm² and m² conversions", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "cm-m");
      for (const p of problems) {
        const hasCmM =
          p.question.includes("cm²") || p.question.includes("m²");
        expect(hasCmM).toBe(true);
      }
    }
  });

  it("m-ha mode: questions involve ha, a, km², or m² conversions", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "m-ha");
      for (const p of problems) {
        const hasUnit =
          p.question.includes("ha") ||
          p.question.includes("a ") ||
          p.question.includes("km²") ||
          p.question.includes("m²");
        expect(hasUnit).toBe(true);
      }
    }
  });

  it("mixed mode produces both cm-m and m-ha types", () => {
    let hasCmM = false;
    let hasMHa = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateAreaUnit(seed, "mixed");
      for (const p of problems) {
        // cm-m problems mention cm² to m² or vice versa without ha
        if (
          p.question.includes("m² ＝ □cm²") ||
          p.question.includes("cm² ＝ □m²")
        )
          hasCmM = true;
        if (
          p.question.includes("ha") ||
          p.question.includes("km²") ||
          p.question.match(/\d+a ＝/)
        )
          hasMHa = true;
      }
    }
    expect(hasCmM).toBe(true);
    expect(hasMHa).toBe(true);
  });

  it("cm-m conversions are correct (1 m² = 10000 cm²)", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "cm-m");
      for (const p of problems) {
        const m2ToCm2 = p.question.match(/^(\d+)m² ＝ □cm²$/);
        if (m2ToCm2) {
          const m2 = Number(m2ToCm2[1]);
          expect(p.answer).toBe(`${m2 * 10000}`);
        }
        const cm2ToM2 = p.question.match(/^(\d+)cm² ＝ □m²$/);
        if (cm2ToM2) {
          const cm2 = Number(cm2ToM2[1]);
          expect(p.answer).toBe(`${cm2 / 10000}`);
        }
      }
    }
  });

  it("m-ha conversions are correct", () => {
    for (const seed of seeds) {
      const problems = generateAreaUnit(seed, "m-ha");
      for (const p of problems) {
        // ha to m²: 1 ha = 10000 m²
        const haToM2 = p.question.match(/^(\d+)ha ＝ □m²$/);
        if (haToM2) {
          const ha = Number(haToM2[1]);
          expect(p.answer).toBe(`${ha * 10000}`);
        }
        // m² to ha
        const m2ToHa = p.question.match(/^(\d+)m² ＝ □ha$/);
        if (m2ToHa) {
          const m2 = Number(m2ToHa[1]);
          expect(p.answer).toBe(`${m2 / 10000}`);
        }
        // a to m²: 1 a = 100 m²
        const aToM2 = p.question.match(/^(\d+)a ＝ □m²$/);
        if (aToM2) {
          const a = Number(aToM2[1]);
          expect(p.answer).toBe(`${a * 100}`);
        }
        // km² to ha: 1 km² = 100 ha
        const km2ToHa = p.question.match(/^(\d+)km² ＝ □ha$/);
        if (km2ToHa) {
          const km2 = Number(km2ToHa[1]);
          expect(p.answer).toBe(`${km2 * 100}`);
        }
      }
    }
  });

  it("answers are valid numbers", () => {
    for (const seed of seeds) {
      for (const unitType of ["cm-m", "m-ha", "mixed"] as const) {
        const problems = generateAreaUnit(seed, unitType);
        for (const p of problems) {
          const ansNum = Number(p.answer);
          expect(Number.isNaN(ansNum)).toBe(false);
          expect(ansNum).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateAreaUnit(42, "mixed");
    const b = generateAreaUnit(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateAreaUnit(1, "cm-m");
    const b = generateAreaUnit(2, "cm-m");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
