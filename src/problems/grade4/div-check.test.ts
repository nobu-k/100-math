import { describe, it, expect } from "vitest";
import { generateDivCheck } from "./div-check";

const seeds = [1, 2, 42, 100, 999];

// ---------------------------------------------------------------------------
// generateDivCheck
// ---------------------------------------------------------------------------
describe("generateDivCheck", () => {
  it("returns 10 problems", () => {
    const problems = generateDivCheck(42);
    expect(problems).toHaveLength(10);
  });

  it("questions reference division verification", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        expect(p.question).toContain("÷");
        expect(p.question).toContain("確かめ");
      }
    }
  });

  it("division check: divisor * quotient + remainder = dividend", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        // Parse question: "dividend ÷ divisor ＝ quotient [あまり remainder] を確かめなさい"
        const withRemMatch = p.question.match(
          /^(\d+) ÷ (\d+) ＝ (\d+) あまり (\d+)/,
        );
        const noRemMatch = p.question.match(/^(\d+) ÷ (\d+) ＝ (\d+) を/);

        if (withRemMatch) {
          const dividend = Number(withRemMatch[1]);
          const divisor = Number(withRemMatch[2]);
          const quotient = Number(withRemMatch[3]);
          const remainder = Number(withRemMatch[4]);
          expect(divisor * quotient + remainder).toBe(dividend);
          expect(remainder).toBeLessThan(divisor);
          expect(remainder).toBeGreaterThan(0);
        } else if (noRemMatch) {
          const dividend = Number(noRemMatch[1]);
          const divisor = Number(noRemMatch[2]);
          const quotient = Number(noRemMatch[3]);
          expect(divisor * quotient).toBe(dividend);
        }
      }
    }
  });

  it("answer format matches check formula", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        // Answer should contain "＝ <dividend>"
        expect(p.answer).toContain("＝");
        const parts = p.answer.split("＝");
        const dividend = Number(parts[parts.length - 1].trim());
        expect(Number.isInteger(dividend)).toBe(true);
        expect(dividend).toBeGreaterThan(0);
      }
    }
  });

  it("divisors are between 2 and 9", () => {
    for (const seed of seeds) {
      const problems = generateDivCheck(seed);
      for (const p of problems) {
        const match = p.question.match(/÷ (\d+)/);
        expect(match).not.toBeNull();
        const divisor = Number(match![1]);
        expect(divisor).toBeGreaterThanOrEqual(2);
        expect(divisor).toBeLessThanOrEqual(9);
      }
    }
  });

  it("is deterministic with the same seed", () => {
    const a = generateDivCheck(42);
    const b = generateDivCheck(42);
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateDivCheck(1);
    const b = generateDivCheck(2);
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
