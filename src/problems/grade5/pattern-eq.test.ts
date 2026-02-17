import { describe, it, expect } from "vitest";
import { generatePatternEq } from "./pattern-eq";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generatePatternEq
// ---------------------------------------------------------------------------
describe("generatePatternEq", () => {
  it("returns 6 problems", () => {
    const problems = generatePatternEq(42);
    expect(problems).toHaveLength(6);
  });

  it("the rule y = a*x + b fits all table values", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        // Parse the answer to extract a and b
        const mulMatch = p.answer.match(/y ＝ (\d+) × x/);
        expect(mulMatch).not.toBeNull();
        const a = Number(mulMatch![1]);
        const addMatch = p.answer.match(/＋ (\d+)/);
        const b = addMatch ? Number(addMatch[1]) : 0;

        // Parse x,y pairs from question
        const pairs = [...p.question.matchAll(/x=(\d+)のときy=(\d+)/g)];
        expect(pairs.length).toBe(5);
        for (const pair of pairs) {
          const x = Number(pair[1]);
          const y = Number(pair[2]);
          expect(y).toBe(a * x + b);
        }
      }
    }
  });

  it("coefficient a is between 2 and 9", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const mulMatch = p.answer.match(/y ＝ (\d+) × x/);
        const a = Number(mulMatch![1]);
        expect(a).toBeGreaterThanOrEqual(2);
        expect(a).toBeLessThanOrEqual(9);
      }
    }
  });

  it("constant b is between 0 and 9", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const addMatch = p.answer.match(/＋ (\d+)/);
        const b = addMatch ? Number(addMatch[1]) : 0;
        expect(b).toBeGreaterThanOrEqual(0);
        expect(b).toBeLessThanOrEqual(9);
      }
    }
  });

  it("x values are always [1, 2, 3, 4, 5]", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const pairs = [...p.question.matchAll(/x=(\d+)のときy=(\d+)/g)];
        const xValues = pairs.map((m) => Number(m[1]));
        expect(xValues).toEqual([1, 2, 3, 4, 5]);
      }
    }
  });

  it("when b=0, answer format is y = a * x (no constant)", () => {
    // Find problems where b=0 across many seeds
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const addMatch = p.answer.match(/＋ (\d+)/);
        if (!addMatch) {
          // b=0 case: answer should be "y = a × x"
          expect(p.answer).toMatch(/^y ＝ \d+ × x$/);
        }
      }
    }
  });

  it("when b>0, answer format includes the constant", () => {
    for (const seed of seeds) {
      const problems = generatePatternEq(seed);
      for (const p of problems) {
        const addMatch = p.answer.match(/＋ (\d+)/);
        if (addMatch) {
          expect(p.answer).toMatch(/^y ＝ \d+ × x ＋ \d+$/);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generatePatternEq(42);
    const b = generatePatternEq(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePatternEq(1);
    const b = generatePatternEq(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
