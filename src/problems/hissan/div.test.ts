import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import { computeDivDetails, generateDivisionProblem, divisionTerminates, divisionCycleLength } from "./div";
import { parseConfig, buildParams, generateProblems } from "./Division";
import { decimalDisplayWidth } from "./common";

describe("computeDivDetails", () => {
  it("computes 72 ÷ 3 = 24 (exact, 1-digit divisor)", () => {
    const { quotient, remainder, steps } = computeDivDetails(72, 3);
    expect(quotient).toBe(24);
    expect(remainder).toBe(0);
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ position: 0, dividendSoFar: 7, quotientDigit: 2, product: 6, remainder: 1 });
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
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ position: 2, dividendSoFar: 102, quotientDigit: 6, product: 96, remainder: 6 });
    expect(steps[1]).toEqual({ position: 3, dividendSoFar: 64, quotientDigit: 4, product: 64, remainder: 0 });
  });

  it("computes 100 ÷ 10 = 10 (quotient has interior zero)", () => {
    const { quotient, remainder, steps } = computeDivDetails(100, 10);
    expect(quotient).toBe(10);
    expect(remainder).toBe(0);
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
    expect(remainder).toBe(0);
    expect(extraStepCount).toBe(1);
    expect(steps).toHaveLength(2);
    expect(steps[0]).toEqual({ position: 1, dividendSoFar: 14, quotientDigit: 3, product: 12, remainder: 2 });
    expect(steps[1]).toEqual({ position: 2, dividendSoFar: 20, quotientDigit: 5, product: 20, remainder: 0 });
  });

  it("extends 75 ÷ 4 with 2 extra digits", () => {
    const { quotient, remainder, steps, extraStepCount } = computeDivDetails(75, 4, 2);
    expect(quotient).toBe(18);
    expect(remainder).toBe(0);
    expect(extraStepCount).toBe(2);
    expect(steps).toHaveLength(4);
    expect(steps[2]).toEqual({ position: 2, dividendSoFar: 30, quotientDigit: 7, product: 28, remainder: 2 });
    expect(steps[3]).toEqual({ position: 3, dividendSoFar: 20, quotientDigit: 5, product: 20, remainder: 0 });
  });

  it("stops extra steps early when remainder reaches 0", () => {
    const { extraStepCount } = computeDivDetails(14, 4, 3);
    expect(extraStepCount).toBe(1);
  });

  it("no extra steps when division is exact", () => {
    const { extraStepCount } = computeDivDetails(12, 4, 3);
    expect(extraStepCount).toBe(0);
  });

  it("detects repeating cycle for 10 ÷ 3 (period 1)", () => {
    const { cycleStart, cycleLength, extraStepCount } = computeDivDetails(10, 3, 1);
    expect(extraStepCount).toBe(1);
    expect(cycleStart).toBe(0);
    expect(cycleLength).toBe(1);
  });

  it("detects repeating cycle for 22 ÷ 7 (period 6)", () => {
    const { cycleStart, cycleLength, extraStepCount, steps } = computeDivDetails(22, 7, 6);
    expect(extraStepCount).toBe(6);
    expect(cycleStart).toBe(0);
    expect(cycleLength).toBe(6);
    const extraDigits = steps.slice(-6).map(s => s.quotientDigit);
    expect(extraDigits).toEqual([1, 4, 2, 8, 5, 7]);
  });

  it("detects cycle with preamble for 14 ÷ 12 (1 non-repeating + period 1)", () => {
    const { cycleStart, cycleLength, extraStepCount } = computeDivDetails(14, 12, 2);
    expect(extraStepCount).toBe(2);
    expect(cycleStart).toBe(1);
    expect(cycleLength).toBe(1);
  });

  it("no cycle when division terminates", () => {
    const { cycleStart, cycleLength } = computeDivDetails(14, 4, 1);
    expect(cycleStart).toBeUndefined();
    expect(cycleLength).toBeUndefined();
  });
});

describe("divisionTerminates", () => {
  it("returns 0 steps for exact division", () => {
    expect(divisionTerminates(12, 4, 3)).toEqual({ terminates: true, stepsNeeded: 0 });
  });

  it("detects termination in 1 step", () => {
    expect(divisionTerminates(14, 4, 3)).toEqual({ terminates: true, stepsNeeded: 1 });
  });

  it("detects termination in 2 steps", () => {
    expect(divisionTerminates(75, 4, 3)).toEqual({ terminates: true, stepsNeeded: 2 });
  });

  it("detects non-termination within limit", () => {
    expect(divisionTerminates(10, 3, 3)).toEqual({ terminates: false, stepsNeeded: 0 });
  });

  it("respects maxExtraSteps limit", () => {
    expect(divisionTerminates(75, 4, 1)).toEqual({ terminates: false, stepsNeeded: 0 });
  });
});

describe("divisionCycleLength", () => {
  it("returns null for exact division", () => {
    expect(divisionCycleLength(12, 4, 10)).toBeNull();
  });

  it("returns null for terminating division", () => {
    expect(divisionCycleLength(14, 4, 10)).toBeNull();
  });

  it("detects cycle of length 1 for 10 / 3", () => {
    expect(divisionCycleLength(10, 3, 10)).toEqual({ cycleStart: 0, cycleLength: 1 });
  });

  it("detects cycle of length 6 for 22 / 7", () => {
    expect(divisionCycleLength(22, 7, 10)).toEqual({ cycleStart: 0, cycleLength: 6 });
  });

  it("detects cycle with preamble for 14 / 12", () => {
    expect(divisionCycleLength(14, 12, 10)).toEqual({ cycleStart: 1, cycleLength: 1 });
  });

  it("returns null when cycle exceeds maxSteps", () => {
    expect(divisionCycleLength(22, 7, 3)).toBeNull();
  });
});

describe("generateDivisionProblem", () => {
  it("exact mode always produces divisible pair", () => {
    const cfg = { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false };
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
    const cfg = { minDigits: 3, maxDigits: 4, divMinDigits: 2, divMaxDigits: 2, divAllowRemainder: false };
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
    const cfg = { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: true };
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

describe("parseConfig / buildParams round-trip", () => {
  it("recovers config for various div configs", () => {
    const configs = [
      { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, showGrid: true, useDecimals: false },
      { minDigits: 3, maxDigits: 4, divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: true, divAllowRepeating: false, showGrid: true, useDecimals: false },
      { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: false, divAllowRepeating: true, showGrid: true, useDecimals: true },
    ];
    for (const cfg of configs) {
      const params = buildParams(123, false, cfg);
      const recovered = parseConfig(params);
      expect(recovered).toEqual(cfg);
    }
  });
});

describe("generateProblems (div)", () => {
  it("returns 6 problems for division", () => {
    const cfg = { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, showGrid: true, useDecimals: false };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(6);
  });

  it("returns 6 problems with decimalPlaces and divExtra for decimal div", () => {
    const cfg = { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, showGrid: true, useDecimals: true };
    for (let seed = 0; seed < 20; seed++) {
      const { problems, decimalPlaces, divExtra } = generateProblems(seed, cfg);
      expect(problems).toHaveLength(6);
      expect(decimalPlaces).toHaveLength(6);
      expect(divExtra).toHaveLength(6);
      for (let i = 0; i < 6; i++) {
        expect(decimalPlaces[i]).toHaveLength(2);
        expect(decimalPlaces[i][0]).toBeGreaterThan(0);
        expect(decimalPlaces[i][1]).toBeGreaterThanOrEqual(0);
        const entry = divExtra[i];
        if (entry.cycleStart !== undefined) {
          expect(entry.cycleLength).toBeGreaterThanOrEqual(1);
          expect(entry.cycleLength).toBeLessThanOrEqual(6);
          expect(entry.extraDigits).toBe(entry.cycleStart! + entry.cycleLength!);
        } else if (entry.extraDigits > 0) {
          const result = divisionTerminates(problems[i][0], problems[i][1], entry.extraDigits);
          expect(result.terminates).toBe(true);
          expect(result.stepsNeeded).toBe(entry.extraDigits);
        } else {
          expect(problems[i][0] % problems[i][1]).toBe(0);
        }
      }
    }
  });
});

describe("decimal div column width constraint", () => {
  it("total columns (using divisor display width) ≤ 9 across many seeds", () => {
    const cfg = { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: false, divAllowRepeating: false, showGrid: true, useDecimals: true };
    for (let seed = 0; seed < 50; seed++) {
      const { problems, decimalPlaces, divExtra } = generateProblems(seed, cfg);
      for (let i = 0; i < problems.length; i++) {
        const [dividend, divisor] = problems[i];
        const [dividendDP, divisorDP] = decimalPlaces[i];
        const extraDigits = divExtra[i].extraDigits;
        const extraZeros = Math.max(0, divisorDP - dividendDP);
        const origDisplayWidth = dividendDP > 0
          ? Math.max(String(dividend).length, dividendDP + 1)
          : String(dividend).length;
        const dividendAreaWidth = origDisplayWidth + extraZeros;
        const divCols = decimalDisplayWidth(String(divisor).length, divisorDP);
        const totalCols = divCols + dividendAreaWidth + extraDigits;
        expect(totalCols).toBeLessThanOrEqual(9);
      }
    }
  });

  it("divisor display width accounts for leading zero when divisorDP >= digit count", () => {
    expect(decimalDisplayWidth(1, 1)).toBe(2);
    expect(decimalDisplayWidth(1, 0)).toBe(1);
    expect(decimalDisplayWidth(2, 1)).toBe(2);
    expect(decimalDisplayWidth(2, 2)).toBe(3);

    const cfg = { minDigits: 2, maxDigits: 3, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, showGrid: true, useDecimals: true };
    for (let seed = 0; seed < 100; seed++) {
      const { problems, decimalPlaces } = generateProblems(seed, cfg);
      for (let i = 0; i < problems.length; i++) {
        const divisor = problems[i][1];
        const divisorDP = decimalPlaces[i][1];
        if (divisorDP > 0) {
          const rawLen = String(divisor).length;
          const displayWidth = decimalDisplayWidth(rawLen, divisorDP);
          expect(displayWidth).toBeGreaterThanOrEqual(rawLen);
          expect(displayWidth).toBeGreaterThanOrEqual(divisorDP + 1);
        }
      }
    }
  });
});
