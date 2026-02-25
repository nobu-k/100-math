import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { computeMulDetails, generateMultiplicationProblem } from "./mul";
import { parseConfig, buildParams, generateProblems } from "./Multiplication";

describe("computeMulDetails", () => {
  it("computes 123 × 5 (single-digit multiplier)", () => {
    const { partials, finalAnswer } = computeMulDetails(123, 5);
    expect(finalAnswer).toBe(615);
    expect(partials).toHaveLength(1);
    expect(partials[0].value).toBe(615);
    expect(partials[0].shift).toBe(0);
    expect(partials[0].carries).toEqual([0, 1, 1]);
  });

  it("computes 123 × 45 (two-digit multiplier)", () => {
    const { partials, finalAnswer } = computeMulDetails(123, 45);
    expect(finalAnswer).toBe(5535);
    expect(partials).toHaveLength(2);
    expect(partials[0].value).toBe(615);
    expect(partials[0].shift).toBe(0);
    expect(partials[1].value).toBe(492);
    expect(partials[1].shift).toBe(1);
  });

  it("computes 456 × 789 (three-digit multiplier)", () => {
    const { partials, finalAnswer } = computeMulDetails(456, 789);
    expect(finalAnswer).toBe(359784);
    expect(partials).toHaveLength(3);
    expect(partials[0].value).toBe(4104);
    expect(partials[0].shift).toBe(0);
    expect(partials[1].value).toBe(3648);
    expect(partials[1].shift).toBe(1);
    expect(partials[2].value).toBe(3192);
    expect(partials[2].shift).toBe(2);
  });

  it("handles multiplier digit 0 gracefully", () => {
    const { partials, finalAnswer } = computeMulDetails(25, 10);
    expect(finalAnswer).toBe(250);
    expect(partials).toHaveLength(2);
    expect(partials[0].value).toBe(0);
    expect(partials[0].shift).toBe(0);
    expect(partials[1].value).toBe(25);
    expect(partials[1].shift).toBe(1);
  });

  it("carries are correct for 99 × 9", () => {
    const { partials, finalAnswer } = computeMulDetails(99, 9);
    expect(finalAnswer).toBe(891);
    expect(partials[0].carries).toEqual([8, 8]);
  });
});

describe("generateMultiplicationProblem", () => {
  it("returns 2 operands within digit ranges", () => {
    const cfg = { minDigits: 2, maxDigits: 3, mulMinDigits: 1, mulMaxDigits: 2 };
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

describe("parseConfig / buildParams round-trip", () => {
  it("recovers config for various mul configs", () => {
    const configs = [
      { minDigits: 2, maxDigits: 3, mulMinDigits: 1, mulMaxDigits: 2, showGrid: true, useDecimals: false },
      { minDigits: 1, maxDigits: 2, mulMinDigits: 2, mulMaxDigits: 3, showGrid: true, useDecimals: false },
      { minDigits: 1, maxDigits: 3, mulMinDigits: 1, mulMaxDigits: 1, showGrid: false, useDecimals: true },
    ];
    for (const cfg of configs) {
      const params = buildParams(123, false, cfg);
      const recovered = parseConfig(params);
      expect(recovered).toEqual(cfg);
    }
  });
});

describe("generateProblems", () => {
  it("returns 6 problems for 2-digit multiplier", () => {
    const cfg = { minDigits: 2, maxDigits: 3, mulMinDigits: 1, mulMaxDigits: 2, showGrid: true, useDecimals: false };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(6);
  });

  it("returns 12 problems for 1-digit multiplier", () => {
    const cfg = { minDigits: 2, maxDigits: 3, mulMinDigits: 1, mulMaxDigits: 1, showGrid: true, useDecimals: false };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(12);
  });

  it("returns 6 problems for decimal mode", () => {
    const cfg = { minDigits: 2, maxDigits: 3, mulMinDigits: 1, mulMaxDigits: 1, showGrid: true, useDecimals: true };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(6);
  });
});
