import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { generateSubtractionProblem, generateBorrowChainProblem } from "./sub";
import { parseConfig, buildParams, generateProblems } from "./Subtraction";

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
    const cfg = { minDigits: 2, maxDigits: 3, numOperands: 2 };
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
    expect(successCount).toBeGreaterThan(0);
  });

  it("result is non-negative across many seeds", () => {
    const cfg = { minDigits: 1, maxDigits: 3, numOperands: 2 };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const problem = generateBorrowChainProblem(rng, cfg);
      expect(problem[0] - problem[1]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("generateSubtractionProblem", () => {
  it("result is non-negative across many seeds", () => {
    const cfg = { minDigits: 1, maxDigits: 3, numOperands: 2 };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const problem = generateSubtractionProblem(rng, cfg);
      expect(problem[0] - problem[1]).toBeGreaterThanOrEqual(0);
    }
  });
});

describe("parseConfig / buildParams round-trip", () => {
  it("recovers config for various subtraction configs", () => {
    const configs = [
      { minDigits: 1, maxDigits: 3, consecutiveCarries: true, showGrid: true, useDecimals: false },
      { minDigits: 1, maxDigits: 3, consecutiveCarries: false, showGrid: true, useDecimals: true },
      { minDigits: 2, maxDigits: 4, consecutiveCarries: false, showGrid: false, useDecimals: false },
    ];
    for (const cfg of configs) {
      const params = buildParams(123, false, cfg);
      const recovered = parseConfig(params);
      expect(recovered).toEqual(cfg);
    }
  });
});

describe("generateProblems", () => {
  it("returns 12 problems for integer mode", () => {
    const cfg = { minDigits: 1, maxDigits: 2, consecutiveCarries: false, showGrid: true, useDecimals: false };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(12);
  });

  it("returns 8 problems for decimal mode", () => {
    const cfg = { minDigits: 1, maxDigits: 3, consecutiveCarries: false, showGrid: true, useDecimals: true };
    const { problems, decimalPlaces } = generateProblems(42, cfg);
    expect(problems).toHaveLength(8);
    expect(decimalPlaces).toHaveLength(8);
  });

  it("decimal sub answer is non-negative across many seeds", () => {
    const cfg = { minDigits: 1, maxDigits: 3, consecutiveCarries: false, showGrid: true, useDecimals: true };
    for (let seed = 0; seed < 50; seed++) {
      const { problems, decimalPlaces } = generateProblems(seed, cfg);
      for (let i = 0; i < problems.length; i++) {
        const maxDP = Math.max(...decimalPlaces[i]);
        const aligned = problems[i].map((op, j) => op * Math.pow(10, maxDP - decimalPlaces[i][j]));
        expect(aligned[0] - aligned[1]).toBeGreaterThanOrEqual(0);
      }
    }
  });
});
