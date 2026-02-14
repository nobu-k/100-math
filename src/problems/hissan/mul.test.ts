import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { computeMulDetails, generateMultiplicationProblem } from "./mul";
import type { HissanConfig } from "./common";

const divDefaults = { divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, useDecimals: false } as const;

describe("computeMulDetails", () => {
  it("computes 123 × 5 (single-digit multiplier)", () => {
    const { partials, finalAnswer } = computeMulDetails(123, 5);
    expect(finalAnswer).toBe(615);
    expect(partials).toHaveLength(1);
    expect(partials[0].value).toBe(615);
    expect(partials[0].shift).toBe(0);
    // carries: 5×3=15 carry 1, 5×2+1=11 carry 1, 5×1+1=6 carry 0
    expect(partials[0].carries).toEqual([0, 1, 1]);
  });

  it("computes 123 × 45 (two-digit multiplier)", () => {
    const { partials, finalAnswer } = computeMulDetails(123, 45);
    expect(finalAnswer).toBe(5535);
    expect(partials).toHaveLength(2);
    // 123 × 5 = 615
    expect(partials[0].value).toBe(615);
    expect(partials[0].shift).toBe(0);
    // 123 × 4 = 492
    expect(partials[1].value).toBe(492);
    expect(partials[1].shift).toBe(1);
  });

  it("computes 456 × 789 (three-digit multiplier)", () => {
    const { partials, finalAnswer } = computeMulDetails(456, 789);
    expect(finalAnswer).toBe(359784);
    expect(partials).toHaveLength(3);
    // 456 × 9 = 4104
    expect(partials[0].value).toBe(4104);
    expect(partials[0].shift).toBe(0);
    // 456 × 8 = 3648
    expect(partials[1].value).toBe(3648);
    expect(partials[1].shift).toBe(1);
    // 456 × 7 = 3192
    expect(partials[2].value).toBe(3192);
    expect(partials[2].shift).toBe(2);
  });

  it("handles multiplier digit 0 gracefully", () => {
    const { partials, finalAnswer } = computeMulDetails(25, 10);
    expect(finalAnswer).toBe(250);
    expect(partials).toHaveLength(2);
    expect(partials[0].value).toBe(0); // 25 × 0
    expect(partials[0].shift).toBe(0);
    expect(partials[1].value).toBe(25); // 25 × 1
    expect(partials[1].shift).toBe(1);
  });

  it("carries are correct for 99 × 9", () => {
    const { partials, finalAnswer } = computeMulDetails(99, 9);
    expect(finalAnswer).toBe(891);
    // 9×9=81 carry 8, 9×9+8=89 carry 8
    expect(partials[0].carries).toEqual([8, 8]);
  });
});

describe("generateMultiplicationProblem", () => {
  it("returns 2 operands within digit ranges", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults,
    };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const [multiplicand, multiplier] = generateMultiplicationProblem(rng, cfg);
      expect(multiplicand).toBeGreaterThanOrEqual(10);
      expect(multiplicand).toBeLessThanOrEqual(999);
      expect(multiplier).toBeGreaterThanOrEqual(1);
      expect(multiplier).toBeLessThanOrEqual(99);
    }
  });
});
