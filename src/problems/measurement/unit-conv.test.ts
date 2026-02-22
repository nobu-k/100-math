import { describe, it, expect } from "vitest";
import { generateUnitConv } from "./unit-conv";

const seeds = [1, 2, 42, 100, 999];

describe("generateUnitConv", () => {
  it("returns 10 problems", () => {
    const problems = generateUnitConv(42, "length");
    expect(problems).toHaveLength(10);
  });

  it("length mode: all questions involve cm/mm/m units", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "length");
      for (const p of problems) {
        const hasLengthUnit = /mm|cm|m/.test(p.question);
        expect(hasLengthUnit).toBe(true);
        expect(p.question).not.toContain("dL");
        expect(p.question).not.toContain("mL");
        expect(p.question).not.toMatch(/\dL\s/);
      }
    }
  });

  it("volume mode: all questions involve L/dL/mL units", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "volume");
      for (const p of problems) {
        const hasVolumeUnit = /[LdmM]L|dL|mL/.test(p.question);
        expect(hasVolumeUnit).toBe(true);
      }
    }
  });

  it("length conversions are mathematically correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "length");
      for (const p of problems) {
        const cmMmToMm = p.question.match(/^(\d+)cm (\d+)mm ＝ □mm$/);
        if (cmMmToMm) {
          const cm = Number(cmMmToMm[1]);
          const mm = Number(cmMmToMm[2]);
          expect(p.answer).toBe(`${cm * 10 + mm}`);
          continue;
        }
        const mmToCmMm = p.question.match(/^(\d+)mm ＝ □cm □mm$/);
        if (mmToCmMm) {
          const totalMm = Number(mmToCmMm[1]);
          const cm = Math.floor(totalMm / 10);
          const mm = totalMm % 10;
          expect(p.answer).toBe(`${cm}cm ${mm}mm`);
          continue;
        }
        const mCmToCm = p.question.match(/^(\d+)m (\d+)cm ＝ □cm$/);
        if (mCmToCm) {
          const m = Number(mCmToCm[1]);
          const cm = Number(mCmToCm[2]);
          expect(p.answer).toBe(`${m * 100 + cm}`);
          continue;
        }
        const cmToMCm = p.question.match(/^(\d+)cm ＝ □m □cm$/);
        if (cmToMCm) {
          const totalCm = Number(cmToMCm[1]);
          const m = Math.floor(totalCm / 100);
          const cm = totalCm % 100;
          expect(p.answer).toBe(`${m}m ${cm}cm`);
          continue;
        }
      }
    }
  });

  it("volume conversions are mathematically correct", () => {
    for (const seed of seeds) {
      const problems = generateUnitConv(seed, "volume");
      for (const p of problems) {
        const lDlToDl = p.question.match(/^(\d+)L (\d+)dL ＝ □dL$/);
        if (lDlToDl) {
          const l = Number(lDlToDl[1]);
          const dl = Number(lDlToDl[2]);
          expect(p.answer).toBe(`${l * 10 + dl}`);
          continue;
        }
        const dlToLDl = p.question.match(/^(\d+)dL ＝ □L □dL$/);
        if (dlToLDl) {
          const totalDl = Number(dlToLDl[1]);
          const l = Math.floor(totalDl / 10);
          const dl = totalDl % 10;
          expect(p.answer).toBe(`${l}L ${dl}dL`);
          continue;
        }
        const lMlToMl = p.question.match(/^(\d+)L (\d+)mL ＝ □mL$/);
        if (lMlToMl) {
          const l = Number(lMlToMl[1]);
          const ml = Number(lMlToMl[2]);
          expect(p.answer).toBe(`${l * 1000 + ml}`);
          continue;
        }
        const mlToLMl = p.question.match(/^(\d+)mL ＝ □L □mL$/);
        if (mlToLMl) {
          const totalMl = Number(mlToLMl[1]);
          const l = Math.floor(totalMl / 1000);
          const ml = totalMl % 1000;
          expect(p.answer).toBe(`${l}L ${ml}mL`);
          continue;
        }
      }
    }
  });

  it("mixed mode produces both length and volume problems", () => {
    let hasLength = false;
    let hasVolume = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateUnitConv(seed, "mixed");
      for (const p of problems) {
        if (/mm|cm ＝|m \d+cm/.test(p.question)) hasLength = true;
        if (/[Ld]L|mL/.test(p.question)) hasVolume = true;
      }
    }
    expect(hasLength).toBe(true);
    expect(hasVolume).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateUnitConv(42, "mixed");
    const b = generateUnitConv(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateUnitConv(1, "length");
    const b = generateUnitConv(2, "length");
    const aQs = a.map((p) => p.question);
    const bQs = b.map((p) => p.question);
    expect(aQs).not.toEqual(bQs);
  });
});
