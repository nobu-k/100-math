import { describe, it, expect } from "vitest";
import { generateScale } from "./scale";

const seeds = [1, 2, 42, 100, 999];

describe("generateScale", () => {
  it("returns 8 problems", () => {
    const problems = generateScale(42);
    expect(problems).toHaveLength(8);
  });

  it("is deterministic with the same seed", () => {
    const a = generateScale(42);
    const b = generateScale(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateScale(1);
    const b = generateScale(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("uses valid scale values", () => {
    const validScales = [1000, 2000, 5000, 10000, 25000, 50000];
    for (const seed of seeds) {
      const problems = generateScale(seed);
      for (const p of problems) {
        const scaleMatch = p.question.match(/1\/(\d+)/);
        expect(scaleMatch).not.toBeNull();
        const scale = Number(scaleMatch![1]);
        expect(validScales).toContain(scale);
      }
    }
  });

  it("map→real: answer is correct in m or km", () => {
    for (const seed of seeds) {
      const problems = generateScale(seed);
      for (const p of problems) {
        if (p.question.includes("実際には")) {
          const scaleMatch = p.question.match(/1\/(\d+)/);
          const mapCmMatch = p.question.match(/で(\d+)cm/);
          expect(scaleMatch).not.toBeNull();
          expect(mapCmMatch).not.toBeNull();
          const scale = Number(scaleMatch![1]);
          const mapCm = Number(mapCmMatch![1]);
          const realCm = mapCm * scale;
          const realM = realCm / 100;
          if (p.answer.endsWith("km")) {
            const km = Number(p.answer.replace("km", ""));
            expect(km).toBe(realM / 1000);
          } else {
            const m = Number(p.answer.replace("m", ""));
            expect(m).toBe(realM);
          }
        }
      }
    }
  });

  it("real→map: answer is correct in cm", () => {
    for (const seed of seeds) {
      const problems = generateScale(seed);
      for (const p of problems) {
        if (p.question.includes("描くと何cm")) {
          const scaleMatch = p.question.match(/1\/(\d+)/);
          const realMMatch = p.question.match(/距離(\d+)m/);
          expect(scaleMatch).not.toBeNull();
          expect(realMMatch).not.toBeNull();
          const scale = Number(scaleMatch![1]);
          const realM = Number(realMMatch![1]);
          const expectedCm = (realM * 100) / scale;
          const expectedStr = Number.isInteger(expectedCm)
            ? String(expectedCm)
            : Number(expectedCm.toFixed(1)).toString();
          expect(p.answer).toBe(`${expectedStr}cm`);
        }
      }
    }
  });
});
