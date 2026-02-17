import { describe, it, expect } from "vitest";
import { generateRepresentative } from "./representative";

const seeds = [1, 2, 42, 100, 999];

describe("generateRepresentative", () => {
  it("returns 8 problems", () => {
    const problems = generateRepresentative(42, "mixed");
    expect(problems).toHaveLength(8);
  });

  it("is deterministic with the same seed", () => {
    const a = generateRepresentative(42, "mixed");
    const b = generateRepresentative(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateRepresentative(1, "mixed");
    const b = generateRepresentative(2, "mixed");
    const aData = a.map((p) => p.data);
    const bData = b.map((p) => p.data);
    expect(aData).not.toEqual(bData);
  });

  it("data has 7-10 elements with values in 1-20", () => {
    for (const seed of seeds) {
      const problems = generateRepresentative(seed, "mixed");
      for (const p of problems) {
        expect(p.data.length).toBeGreaterThanOrEqual(7);
        expect(p.data.length).toBeLessThanOrEqual(10);
        for (const d of p.data) {
          expect(d).toBeGreaterThanOrEqual(1);
          expect(d).toBeLessThanOrEqual(20);
        }
      }
    }
  });

  it("mean answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateRepresentative(seed, "mean");
      for (const p of problems) {
        const sum = p.data.reduce((a, b) => a + b, 0);
        const mean = sum / p.data.length;
        const expected = Number.isInteger(mean)
          ? String(mean)
          : Number(mean.toFixed(1)).toString();
        expect(p.meanAnswer).toBe(expected);
      }
    }
  });

  it("median answer is correct", () => {
    for (const seed of seeds) {
      const problems = generateRepresentative(seed, "median");
      for (const p of problems) {
        const sorted = [...p.data].sort((a, b) => a - b);
        const n = sorted.length;
        let median: number;
        if (n % 2 === 0) {
          median = (sorted[n / 2 - 1] + sorted[n / 2]) / 2;
        } else {
          median = sorted[Math.floor(n / 2)];
        }
        const expected = Number.isInteger(median)
          ? String(median)
          : Number(median.toFixed(1)).toString();
        expect(p.medianAnswer).toBe(expected);
      }
    }
  });

  it("mode answer is correct (most frequent value)", () => {
    for (const seed of seeds) {
      const problems = generateRepresentative(seed, "mode");
      for (const p of problems) {
        const freq = new Map<number, number>();
        for (const d of p.data) freq.set(d, (freq.get(d) ?? 0) + 1);
        let maxFreq = 0;
        let mode = p.data[0];
        for (const [val, cnt] of freq) {
          if (cnt > maxFreq) { maxFreq = cnt; mode = val; }
        }
        expect(p.modeAnswer).toBe(String(mode));
      }
    }
  });
});
