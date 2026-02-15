import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { generateCarryChainProblem } from "./add";
import type { HissanConfig } from "./common";

const divDefaults = { divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, useDecimals: false } as const;

describe("generateCarryChainProblem", () => {
  /** Check that at least 2 consecutive columns (from ones) produce a carry. */
  const verifyCarryChain = (problem: number[]) => {
    const width = Math.max(...problem.map((n) => String(n).length));
    // Extract digits per column (right = col 0)
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
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 2, numOperands: 2,
      consecutiveCarries: true, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
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
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 3,
      consecutiveCarries: true, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
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
