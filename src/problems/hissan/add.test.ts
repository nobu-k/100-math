import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { generateCarryChainProblem } from "./add";
import { parseConfig, buildParams, generateProblems } from "./Addition";

describe("generateCarryChainProblem", () => {
  /** Check that at least 2 consecutive columns (from ones) produce a carry. */
  const verifyCarryChain = (problem: number[]) => {
    const width = Math.max(...problem.map((n) => String(n).length));
    const getDigit = (n: number, col: number): number => {
      return Math.floor(n / Math.pow(10, col)) % 10;
    };

    let carry = 0;
    let consecutiveCarries = 0;
    for (let col = 0; col < width; col++) {
      let colSum = carry;
      for (const n of problem) {
        colSum += getDigit(n, col);
      }
      carry = Math.floor(colSum / 10);
      if (carry > 0) {
        consecutiveCarries++;
      } else {
        break;
      }
    }
    return consecutiveCarries;
  };

  it("every column in chain produces a carry (2-digit, 2 operands)", () => {
    const cfg = {
      minDigits: 2, maxDigits: 2, addMinDigits: 2, addMaxDigits: 2, numOperands: 2,
    };
    const seeds = [1, 2, 3, 4, 5, 10, 20, 50, 100, 200];
    for (const seed of seeds) {
      const rng = mulberry32(seed);
      const problem = generateCarryChainProblem(rng, cfg);
      const chain = verifyCarryChain(problem);
      expect(chain).toBeGreaterThanOrEqual(2);
    }
  });

  it("works with 3 operands", () => {
    const cfg = {
      minDigits: 2, maxDigits: 3, addMinDigits: 2, addMaxDigits: 3, numOperands: 3,
    };
    const seeds = [1, 5, 10, 42, 99];
    for (const seed of seeds) {
      const rng = mulberry32(seed);
      const problem = generateCarryChainProblem(rng, cfg);
      expect(problem).toHaveLength(3);
      const chain = verifyCarryChain(problem);
      expect(chain).toBeGreaterThanOrEqual(2);
    }
  });
});

describe("parseConfig / buildParams round-trip", () => {
  it("recovers config for various addition configs", () => {
    const configs = [
      { minDigits: 1, maxDigits: 2, addMinDigits: 1, addMaxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, useDecimals: false },
      { minDigits: 2, maxDigits: 4, addMinDigits: 2, addMaxDigits: 4, numOperands: 3, consecutiveCarries: true, showGrid: false, useDecimals: false },
      { minDigits: 1, maxDigits: 3, addMinDigits: 1, addMaxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, useDecimals: true },
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
    const cfg = { minDigits: 1, maxDigits: 2, addMinDigits: 1, addMaxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, useDecimals: false };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(12);
  });

  it("returns 8 problems for decimal mode", () => {
    const cfg = { minDigits: 1, maxDigits: 2, addMinDigits: 1, addMaxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, useDecimals: true };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(8);
  });

  it("is deterministic for the same seed", () => {
    const cfg = { minDigits: 1, maxDigits: 3, addMinDigits: 1, addMaxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, useDecimals: false };
    const a = generateProblems(12345, cfg);
    const b = generateProblems(12345, cfg);
    expect(a).toEqual(b);
  });
});
