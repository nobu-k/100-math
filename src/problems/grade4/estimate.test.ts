import { describe, it, expect } from "vitest";
import { generateEstimate } from "./estimate";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateEstimate
// ---------------------------------------------------------------------------
describe("generateEstimate", () => {
  it("returns 10 problems", () => {
    const problems = generateEstimate(42, 10);
    expect(problems).toHaveLength(10);
  });

  it("question mentions rounding and estimation", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        expect(p.question).toContain("概数");
        expect(p.question).toContain("見積もり");
      }
    }
  });

  it("roundTo=10: question mentions 十の位", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        expect(p.question).toContain("十の位");
      }
    }
  });

  it("roundTo=100: question mentions 百の位", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 100);
      for (const p of problems) {
        expect(p.question).toContain("百の位");
      }
    }
  });

  it("answer contains rounded values and a result", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        // answer format: "aRound OP bRound ＝ result"
        expect(p.answer).toContain("＝");
        const parts = p.answer.split("＝");
        const result = Number(parts[parts.length - 1].trim());
        expect(Number.isNaN(result)).toBe(false);
      }
    }
  });

  it("rounded values in answer are multiples of roundTo", () => {
    for (const seed of seeds) {
      for (const roundTo of [10, 100]) {
        const problems = generateEstimate(seed, roundTo);
        for (const p of problems) {
          // Parse answer: "aRound OP bRound ＝ result"
          const matchAdd = p.answer.match(/^(\d+) ＋ (\d+) ＝/);
          const matchSub = p.answer.match(/^(\d+) − (\d+) ＝/);
          const matchMul = p.answer.match(/^(\d+) × (\d+) ＝/);
          const match = matchAdd || matchSub || matchMul;
          if (match) {
            const aRound = Number(match[1]);
            const bRound = Number(match[2]);
            expect(aRound % roundTo).toBe(0);
            expect(bRound % roundTo).toBe(0);
          }
        }
      }
    }
  });

  it("estimation result is mathematically correct", () => {
    for (const seed of seeds) {
      const problems = generateEstimate(seed, 10);
      for (const p of problems) {
        const matchAdd = p.answer.match(/^(\d+) ＋ (\d+) ＝ (-?\d+)$/);
        const matchSub = p.answer.match(/^(\d+) − (\d+) ＝ (-?\d+)$/);
        const matchMul = p.answer.match(/^(\d+) × (\d+) ＝ (-?\d+)$/);
        if (matchAdd) {
          expect(Number(matchAdd[1]) + Number(matchAdd[2])).toBe(
            Number(matchAdd[3]),
          );
        }
        if (matchSub) {
          expect(Number(matchSub[1]) - Number(matchSub[2])).toBe(
            Number(matchSub[3]),
          );
        }
        if (matchMul) {
          expect(Number(matchMul[1]) * Number(matchMul[2])).toBe(
            Number(matchMul[3]),
          );
        }
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateEstimate(42, 10);
    const b = generateEstimate(42, 10);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateEstimate(1, 10);
    const b = generateEstimate(2, 10);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
