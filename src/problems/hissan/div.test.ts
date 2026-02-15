import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { computeDivDetails, generateDivisionProblem } from "./div";
import type { HissanConfig } from "./common";

describe("computeDivDetails", () => {
  it("computes 72 ÷ 3 = 24 (exact, 1-digit divisor)", () => {
    const { quotient, remainder, steps } = computeDivDetails(72, 3);
    expect(quotient).toBe(24);
    expect(remainder).toBe(0);
    expect(steps).toHaveLength(2);
    // Step 1: position 0, dividendSoFar=7, quotientDigit=2, product=6, remainder=1
    expect(steps[0]).toEqual({ position: 0, dividendSoFar: 7, quotientDigit: 2, product: 6, remainder: 1 });
    // Step 2: position 1, dividendSoFar=12, quotientDigit=4, product=12, remainder=0
    expect(steps[1]).toEqual({ position: 1, dividendSoFar: 12, quotientDigit: 4, product: 12, remainder: 0 });
  });

  it("computes 75 ÷ 4 = 18 r3 (remainder, 1-digit divisor)", () => {
    const { quotient, remainder, steps } = computeDivDetails(75, 4);
    expect(quotient).toBe(18);
    expect(remainder).toBe(3);
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ position: 0, dividendSoFar: 7, quotientDigit: 1, product: 4, remainder: 3 });
    expect(steps[1]).toEqual({ position: 1, dividendSoFar: 35, quotientDigit: 8, product: 32, remainder: 3 });
  });

  it("computes 1024 ÷ 16 = 64 (exact, 2-digit divisor)", () => {
    const { quotient, remainder, steps } = computeDivDetails(1024, 16);
    expect(quotient).toBe(64);
    expect(remainder).toBe(0);
    // Digits: 1, 0, 2, 4
    // current=1 < 16, skip; current=10 < 16, skip; current=102, qd=6, prod=96, rem=6; current=64, qd=4, prod=64, rem=0
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ position: 2, dividendSoFar: 102, quotientDigit: 6, product: 96, remainder: 6 });
    expect(steps[1]).toEqual({ position: 3, dividendSoFar: 64, quotientDigit: 4, product: 64, remainder: 0 });
  });

  it("computes 100 ÷ 10 = 10 (quotient has interior zero)", () => {
    const { quotient, remainder, steps } = computeDivDetails(100, 10);
    expect(quotient).toBe(10);
    expect(remainder).toBe(0);
    // Digits: 1, 0, 0
    // current=1 < 10, skip; current=10 >= 10, qd=1, prod=10, rem=0; current=0, qd=0, prod=0, rem=0
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ position: 1, dividendSoFar: 10, quotientDigit: 1, product: 10, remainder: 0 });
    expect(steps[1]).toEqual({ position: 2, dividendSoFar: 0, quotientDigit: 0, product: 0, remainder: 0 });
  });

  it("computes 8 ÷ 4 = 2 (single-step)", () => {
    const { quotient, remainder, steps } = computeDivDetails(8, 4);
    expect(quotient).toBe(2);
    expect(remainder).toBe(0);
    expect(steps).toHaveLength(1);
    expect(steps[0]).toEqual({ position: 0, dividendSoFar: 8, quotientDigit: 2, product: 8, remainder: 0 });
  });

  it("extends 14 ÷ 4 with 1 extra digit (finite extension)", () => {
    const { quotient, remainder, steps, extraStepCount } = computeDivDetails(14, 4, 1);
    expect(quotient).toBe(3);
    expect(remainder).toBe(0); // extended remainder is 0
    expect(extraStepCount).toBe(1);
    expect(steps).toHaveLength(2);
    // Normal step: pos=1, dividendSoFar=14, qd=3, product=12, remainder=2
    expect(steps[0]).toEqual({ position: 1, dividendSoFar: 14, quotientDigit: 3, product: 12, remainder: 2 });
    // Extra step: pos=2, dividendSoFar=20, qd=5, product=20, remainder=0
    expect(steps[1]).toEqual({ position: 2, dividendSoFar: 20, quotientDigit: 5, product: 20, remainder: 0 });
  });

  it("extends 75 ÷ 4 with 2 extra digits", () => {
    // 75 ÷ 4 = 18 r3 → 18.75 (3→30÷4=7r2, 2→20÷4=5r0)
    const { quotient, remainder, steps, extraStepCount } = computeDivDetails(75, 4, 2);
    expect(quotient).toBe(18);
    expect(remainder).toBe(0);
    expect(extraStepCount).toBe(2);
    expect(steps).toHaveLength(4);
    // Extra steps
    expect(steps[2]).toEqual({ position: 2, dividendSoFar: 30, quotientDigit: 7, product: 28, remainder: 2 });
    expect(steps[3]).toEqual({ position: 3, dividendSoFar: 20, quotientDigit: 5, product: 20, remainder: 0 });
  });

  it("stops extra steps early when remainder reaches 0", () => {
    // 14 ÷ 4 with 3 extra digits requested, but only 1 needed
    const { extraStepCount } = computeDivDetails(14, 4, 3);
    expect(extraStepCount).toBe(1);
  });

  it("no extra steps when division is exact", () => {
    const { extraStepCount } = computeDivDetails(12, 4, 3);
    expect(extraStepCount).toBe(0);
  });
});

describe("generateDivisionProblem", () => {
  it("exact mode always produces divisible pair", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false,
      useDecimals: false,
    };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const [dividend, divisor] = generateDivisionProblem(rng, cfg);
      expect(dividend % divisor).toBe(0);
      expect(dividend).toBeGreaterThanOrEqual(10);
      expect(dividend).toBeLessThanOrEqual(999);
      expect(divisor).toBeGreaterThanOrEqual(1);
      expect(divisor).toBeLessThanOrEqual(9);
    }
  });

  it("exact mode with 2-digit divisor", () => {
    const cfg: HissanConfig = {
      minDigits: 3, maxDigits: 4, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 2, divMaxDigits: 2, divAllowRemainder: false,
      useDecimals: false,
    };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const [dividend, divisor] = generateDivisionProblem(rng, cfg);
      expect(dividend % divisor).toBe(0);
      expect(dividend).toBeGreaterThanOrEqual(100);
      expect(dividend).toBeLessThanOrEqual(9999);
      expect(divisor).toBeGreaterThanOrEqual(10);
      expect(divisor).toBeLessThanOrEqual(99);
    }
  });

  it("remainder mode produces valid dividend >= divisor", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: true,
      useDecimals: false,
    };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const [dividend, divisor] = generateDivisionProblem(rng, cfg);
      expect(dividend).toBeGreaterThanOrEqual(divisor);
      expect(dividend).toBeGreaterThanOrEqual(10);
      expect(dividend).toBeLessThanOrEqual(999);
      expect(divisor).toBeGreaterThanOrEqual(1);
      expect(divisor).toBeLessThanOrEqual(9);
    }
  });
});
