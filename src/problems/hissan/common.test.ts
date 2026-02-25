import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import {
  generateNumber,
  randInt,
  digitsWithMinSum,
  digitsWithExactSum,
  toDigitCells,
  toDecimalDigitCells,
  computeIndicators,
} from "./common";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------
describe("randInt", () => {
  it("returns values in [lo, hi]", () => {
    const rng = mulberry32(42);
    for (let i = 0; i < 100; i++) {
      const v = randInt(rng, 3, 7);
      expect(v).toBeGreaterThanOrEqual(3);
      expect(v).toBeLessThanOrEqual(7);
    }
  });
});

describe("digitsWithMinSum", () => {
  it("returns n digits each 0-9 with sum >= minSum", () => {
    const rng = mulberry32(99);
    for (let trial = 0; trial < 50; trial++) {
      const digits = digitsWithMinSum(rng, 3, 15);
      expect(digits).toHaveLength(3);
      const sum = digits.reduce((a, b) => a + b, 0);
      expect(sum).toBeGreaterThanOrEqual(15);
      for (const d of digits) {
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(9);
      }
    }
  });
});

describe("digitsWithExactSum", () => {
  it("returns n digits each 0-9 with sum = exactSum", () => {
    const rng = mulberry32(77);
    for (let trial = 0; trial < 50; trial++) {
      const digits = digitsWithExactSum(rng, 3, 12);
      expect(digits).toHaveLength(3);
      const sum = digits.reduce((a, b) => a + b, 0);
      expect(sum).toBe(12);
      for (const d of digits) {
        expect(d).toBeGreaterThanOrEqual(0);
        expect(d).toBeLessThanOrEqual(9);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// generateNumber
// ---------------------------------------------------------------------------
describe("generateNumber", () => {
  it("result has correct digit count", () => {
    const rng = mulberry32(1);
    for (let i = 0; i < 100; i++) {
      const n = generateNumber(rng, 2, 3);
      expect(n).toBeGreaterThanOrEqual(10);
      expect(n).toBeLessThanOrEqual(999);
    }
  });

  it("single digit numbers are 1-9", () => {
    const rng = mulberry32(2);
    for (let i = 0; i < 50; i++) {
      const n = generateNumber(rng, 1, 1);
      expect(n).toBeGreaterThanOrEqual(1);
      expect(n).toBeLessThanOrEqual(9);
    }
  });
});

// ---------------------------------------------------------------------------
// toDigitCells
// ---------------------------------------------------------------------------
describe("toDigitCells", () => {
  it("pads with empty strings on the left", () => {
    expect(toDigitCells(42, 4)).toEqual(["", "", 4, 2]);
  });

  it("fills exact width with no padding", () => {
    expect(toDigitCells(123, 3)).toEqual([1, 2, 3]);
  });

  it("handles single digit", () => {
    expect(toDigitCells(5, 3)).toEqual(["", "", 5]);
  });
});

// ---------------------------------------------------------------------------
// toDecimalDigitCells
// ---------------------------------------------------------------------------
describe("toDecimalDigitCells", () => {
  it("splits integer and decimal parts", () => {
    expect(toDecimalDigitCells(123, 2, 2, 2)).toEqual(["", 1, 2, 3]);
  });

  it("handles dp=0 (no decimal part)", () => {
    expect(toDecimalDigitCells(42, 0, 3, 2)).toEqual(["", 4, 2, "", ""]);
  });

  it("handles dp=numDigits (integer part is 0)", () => {
    expect(toDecimalDigitCells(5, 1, 2, 1)).toEqual(["", 0, 5]);
  });

  it("handles dp=numDigits with multi-digit operand", () => {
    expect(toDecimalDigitCells(123, 3, 2, 3)).toEqual(["", 0, 1, 2, 3]);
  });

  it("pads decimal part with leading zeros when dp > numDigits", () => {
    expect(toDecimalDigitCells(5, 2, 2, 2)).toEqual(["", 0, 0, 5]);
  });

  it("leaves trailing decimal cells empty for operands", () => {
    expect(toDecimalDigitCells(12, 1, 2, 3)).toEqual(["", 1, 2, "", ""]);
  });

  it("shows trailing zeros for answer", () => {
    expect(toDecimalDigitCells(460, 2, 2, 2)).toEqual(["", 4, 6, 0]);
  });
});

// ---------------------------------------------------------------------------
// computeIndicators
// ---------------------------------------------------------------------------
describe("computeIndicators", () => {
  describe("addition carries", () => {
    it("no carry for small numbers", () => {
      const { indicators } = computeIndicators([12, 34], 2, "add");
      expect(indicators).toEqual([0, 0, 0]);
    });

    it("carry from ones to tens", () => {
      const { indicators } = computeIndicators([18, 15], 2, "add");
      expect(indicators[2]).toBe(0);
      expect(indicators[1]).toBe(1);
    });

    it("carry chain across all columns", () => {
      const { indicators } = computeIndicators([99, 11], 2, "add");
      expect(indicators).toEqual([1, 1, 0]);
    });
  });

  describe("subtraction borrows", () => {
    it("no borrow when minuend digits are larger", () => {
      const { indicators, borrowOut } = computeIndicators([85, 23], 2, "sub");
      expect(indicators).toEqual([0, 0, 0]);
      expect(borrowOut).toEqual([0, 0, 0]);
    });

    it("borrow from tens to ones", () => {
      const { indicators, borrowOut, borrowDisplay } = computeIndicators([42, 15], 2, "sub");
      expect(indicators[2]).toBe(0);
      expect(borrowOut[2]).toBe(1);
      expect(indicators[1]).toBe(1);
      expect(borrowDisplay[1]).toBe(3);
    });

    it("consecutive borrows show large display value", () => {
      const { indicators, borrowOut, borrowDisplay } = computeIndicators([100, 1], 3, "sub");
      expect(indicators[3]).toBe(0);
      expect(borrowOut[3]).toBe(1);
      expect(indicators[2]).toBe(1);
      expect(borrowOut[2]).toBe(1);
      expect(borrowDisplay[2]).toBe(9);
      expect(indicators[1]).toBe(1);
      expect(borrowDisplay[1]).toBe(0);
    });
  });
});
