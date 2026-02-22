import { describe, it, expect } from "vitest";
import { generateFreqTable } from "./freq-table";

const seeds = [1, 2, 42, 100, 999];

describe("generateFreqTable", () => {
  it("returns 4 problems", () => {
    const problems = generateFreqTable(42);
    expect(problems).toHaveLength(4);
  });

  it("is deterministic with the same seed", () => {
    const a = generateFreqTable(42);
    const b = generateFreqTable(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateFreqTable(1);
    const b = generateFreqTable(2);
    const aData = a.map((p) => p.data);
    const bData = b.map((p) => p.data);
    expect(aData).not.toEqual(bData);
  });

  it("data has 15-25 elements", () => {
    for (const seed of seeds) {
      const problems = generateFreqTable(seed);
      for (const p of problems) {
        expect(p.data.length).toBeGreaterThanOrEqual(15);
        expect(p.data.length).toBeLessThanOrEqual(25);
      }
    }
  });

  it("classWidth is 5 or 10", () => {
    for (const seed of seeds) {
      const problems = generateFreqTable(seed);
      for (const p of problems) {
        expect([5, 10]).toContain(p.classWidth);
      }
    }
  });

  it("has 4-6 classes", () => {
    for (const seed of seeds) {
      const problems = generateFreqTable(seed);
      for (const p of problems) {
        expect(p.classes.length).toBeGreaterThanOrEqual(4);
        expect(p.classes.length).toBeLessThanOrEqual(6);
      }
    }
  });

  it("frequencies and answers are consistent with data", () => {
    for (const seed of seeds) {
      const problems = generateFreqTable(seed);
      for (const p of problems) {
        // Recompute frequencies from data
        const expectedFreqs: number[] = [];
        for (let c = 0; c < p.classes.length; c++) {
          const lo = p.classStart + c * p.classWidth;
          const hi = lo + p.classWidth;
          expectedFreqs.push(p.data.filter((d) => d >= lo && d < hi).length);
        }

        // Reconstruct full frequencies from blanks + answers
        let ansIdx = 0;
        for (let c = 0; c < p.frequencies.length; c++) {
          if (p.frequencies[c] !== null) {
            expect(p.frequencies[c]).toBe(expectedFreqs[c]);
          } else {
            expect(p.answers[ansIdx]).toBe(expectedFreqs[c]);
            ansIdx++;
          }
        }
      }
    }
  });

  it("has 2-3 blanks per problem", () => {
    for (const seed of seeds) {
      const problems = generateFreqTable(seed);
      for (const p of problems) {
        const blanks = p.frequencies.filter((f) => f === null);
        expect(blanks.length).toBeGreaterThanOrEqual(2);
        expect(blanks.length).toBeLessThanOrEqual(3);
        expect(p.answers).toHaveLength(blanks.length);
      }
    }
  });

  it("all frequency values are non-negative integers", () => {
    for (const seed of seeds) {
      const problems = generateFreqTable(seed);
      for (const p of problems) {
        let ansIdx = 0;
        for (const f of p.frequencies) {
          const val = f !== null ? f : p.answers[ansIdx++];
          expect(Number.isInteger(val)).toBe(true);
          expect(val).toBeGreaterThanOrEqual(0);
        }
      }
    }
  });
});
