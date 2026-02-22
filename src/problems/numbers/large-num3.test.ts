import { describe, it, expect } from "vitest";
import { generateLargeNum3 } from "./large-num3";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateLargeNum3
// ---------------------------------------------------------------------------
describe("generateLargeNum3", () => {
  it("returns 10 problems", () => {
    const problems = generateLargeNum3(42, "mixed");
    expect(problems).toHaveLength(10);
  });

  it("read mode: all problems involve large number reading", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "read");
      for (const p of problems) {
        // Either question is a number (answer is kanji) or vice versa
        const qIsNum = /^\d+$/.test(p.question);
        const aIsNum = /^\d+$/.test(p.answer);
        expect(qIsNum || aIsNum).toBe(true);
      }
    }
  });

  it("count mode: all problems ask how many units", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "count");
      for (const p of problems) {
        expect(p.question).toContain("が□個");
        const ans = Number(p.answer);
        expect(Number.isInteger(ans)).toBe(true);
        expect(ans).toBeGreaterThan(0);
      }
    }
  });

  it("count mode: n = count * unit is correct", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "count");
      for (const p of problems) {
        // Parse "Nは<kanjiUnit>が□個"
        const match = p.question.match(/^(\d+)は(.+)が□個$/);
        expect(match).not.toBeNull();
        const n = Number(match![1]);
        const count = Number(p.answer);
        // n / count should be a power-of-10 unit
        const unit = n / count;
        expect([10, 100, 1000, 10000]).toContain(unit);
      }
    }
  });

  it("multiply mode: all problems ask about multiplying or dividing", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "multiply");
      for (const p of problems) {
        const hasMul = p.question.includes("倍");
        const hasDiv = p.question.includes("1/");
        expect(hasMul || hasDiv).toBe(true);
      }
    }
  });

  it("multiply mode: multiplication answers are correct", () => {
    for (const seed of seeds) {
      const problems = generateLargeNum3(seed, "multiply");
      for (const p of problems) {
        const mulMatch = p.question.match(/^(\d+)の(\d+)倍は？$/);
        if (mulMatch) {
          const base = Number(mulMatch[1]);
          const mul = Number(mulMatch[2]);
          expect(p.answer).toBe(`${base * mul}`);
        }
        const divMatch = p.question.match(/^(\d+)の1\/(\d+)は？$/);
        if (divMatch) {
          const base = Number(divMatch[1]);
          const div = Number(divMatch[2]);
          expect(p.answer).toBe(`${base / div}`);
          // result should be an integer
          expect(Number.isInteger(base / div)).toBe(true);
        }
      }
    }
  });

  it("mixed mode produces multiple sub-modes", () => {
    let hasRead = false;
    let hasCount = false;
    let hasMultiply = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateLargeNum3(seed, "mixed");
      for (const p of problems) {
        if (p.question.includes("が□個")) hasCount = true;
        else if (p.question.includes("倍") || p.question.includes("1/")) hasMultiply = true;
        else hasRead = true;
      }
    }
    expect(hasRead).toBe(true);
    expect(hasCount).toBe(true);
    expect(hasMultiply).toBe(true);
  });

  it("every problem has a non-empty question and answer", () => {
    for (const seed of seeds) {
      for (const mode of ["read", "count", "multiply", "mixed"] as const) {
        const problems = generateLargeNum3(seed, mode);
        for (const p of problems) {
          expect(p.question.length).toBeGreaterThan(0);
          expect(p.answer.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateLargeNum3(42, "mixed");
    const b = generateLargeNum3(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateLargeNum3(1, "read");
    const b = generateLargeNum3(2, "read");
    const aQuestions = a.map((p) => p.question);
    const bQuestions = b.map((p) => p.question);
    expect(aQuestions).not.toEqual(bQuestions);
  });
});
