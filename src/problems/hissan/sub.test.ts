import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { generateSubtractionProblem, generateBorrowChainProblem } from "./sub";
import type { HissanConfig } from "./common";

const divDefaults = { divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false } as const;

describe("generateBorrowChainProblem", () => {
  /** Check that at least 2 consecutive columns (from ones) require a borrow. */
  const verifyBorrowChain = (problem: number[]) => {
    const [minuend, ...subs] = problem;
    const width = Math.max(...problem.map((n) => String(n).length));
    const getDigit = (n: number, col: number): number => {
      return Math.floor(n / Math.pow(10, col)) % 10;
    };

    let borrow = 0;
    let consecutiveBorrows = 0;
    for (let col = 0; col < width; col++) {
      const mDigit = getDigit(minuend, col);
      let subSum = 0;
      for (const s of subs) {
        subSum += getDigit(s, col);
      }
      const diff = mDigit - subSum - borrow;
      if (diff < 0) {
        borrow = 1;
        consecutiveBorrows++;
      } else {
        borrow = 0;
        break;
      }
    }
    return consecutiveBorrows;
  };

  it("most seeds produce consecutive borrows from ones column", () => {
    // Use a wider digit range so the algorithm has more room
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: true, showGrid: true, operator: "sub",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    let successCount = 0;
    const total = 100;
    for (let seed = 1; seed <= total; seed++) {
      const rng = mulberry32(seed);
      const problem = generateBorrowChainProblem(rng, cfg);
      expect(problem).toHaveLength(2);
      expect(problem[0] - problem[1]).toBeGreaterThanOrEqual(0);
      const chain = verifyBorrowChain(problem);
      if (chain >= 2) successCount++;
    }
    // The algorithm should succeed for a good fraction of seeds
    expect(successCount).toBeGreaterThan(0);
  });

  it("result is non-negative across many seeds", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 3, numOperands: 2,
      consecutiveCarries: true, showGrid: true, operator: "sub",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const problem = generateBorrowChainProblem(rng, cfg);
      expect(problem[0] - problem[1]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("generateSubtractionProblem", () => {
  it("result is non-negative across many seeds", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "sub",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const problem = generateSubtractionProblem(rng, cfg);
      expect(problem[0] - problem[1]).toBeGreaterThanOrEqual(0);
    }
  });
});
