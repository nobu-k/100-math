import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import {
  parseConfig,
  buildParams,
  generateNumber,
  randInt,
  digitsWithMinSum,
  digitsWithExactSum,
  toDigitCells,
  toDecimalDigitCells,
  computeIndicators,
  type HissanConfig,
} from "./common";

const divDefaults = { divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, useDecimals: false } as const;

// ---------------------------------------------------------------------------
// parseConfig
// ---------------------------------------------------------------------------
describe("parseConfig", () => {
  it("returns defaults for empty params", () => {
    const cfg = parseConfig(new URLSearchParams(), "add");
    expect(cfg).toEqual({
      minDigits: 1,
      maxDigits: 2,
      numOperands: 2,
      consecutiveCarries: false,
      showGrid: true,
      operator: "add",
      mulMinDigits: 1,
      mulMaxDigits: 1,
      ...divDefaults,
    });
  });

  it("parses all params explicitly", () => {
    const params = new URLSearchParams("min=2&max=3&ops=3&cc=1&grid=0");
    const cfg = parseConfig(params, "add");
    expect(cfg).toEqual({
      minDigits: 2,
      maxDigits: 3,
      numOperands: 3,
      consecutiveCarries: true,
      showGrid: false,
      operator: "add",
      mulMinDigits: 1,
      mulMaxDigits: 1,
      ...divDefaults,
    });
  });

  it("parses dec=1 as useDecimals true", () => {
    const params = new URLSearchParams("dec=1");
    const cfg = parseConfig(params, "add");
    expect(cfg.useDecimals).toBe(true);
  });

  it("defaults useDecimals to false", () => {
    const cfg = parseConfig(new URLSearchParams(), "add");
    expect(cfg.useDecimals).toBe(false);
  });

  it("sub forces numOperands=2 regardless of ops", () => {
    const params = new URLSearchParams("ops=3");
    const cfg = parseConfig(params, "sub");
    expect(cfg.operator).toBe("sub");
    expect(cfg.numOperands).toBe(2);
  });

  it("adjusts max upward when min > max", () => {
    const params = new URLSearchParams("min=3&max=1");
    const cfg = parseConfig(params, "add");
    expect(cfg.minDigits).toBe(3);
    expect(cfg.maxDigits).toBe(3);
  });

  it("uses defaults for invalid values", () => {
    const params = new URLSearchParams("min=abc&max=99&ops=0");
    const cfg = parseConfig(params, "add");
    expect(cfg.minDigits).toBe(1);
    expect(cfg.maxDigits).toBe(2);
    expect(cfg.numOperands).toBe(2);
  });

  it("parses cc=1 as consecutiveCarries true", () => {
    const params = new URLSearchParams("cc=1");
    const cfg = parseConfig(params, "add");
    expect(cfg.consecutiveCarries).toBe(true);
  });

  it("parses cc absent as consecutiveCarries false", () => {
    const params = new URLSearchParams();
    const cfg = parseConfig(params, "add");
    expect(cfg.consecutiveCarries).toBe(false);
  });

  it("parses grid=0 as showGrid false", () => {
    const params = new URLSearchParams("grid=0");
    const cfg = parseConfig(params, "add");
    expect(cfg.showGrid).toBe(false);
  });

  it("parses grid absent as showGrid true", () => {
    const params = new URLSearchParams();
    const cfg = parseConfig(params, "add");
    expect(cfg.showGrid).toBe(true);
  });

  it("parses mul with mmin/mmax", () => {
    const params = new URLSearchParams("min=2&max=3&mmin=1&mmax=2");
    const cfg = parseConfig(params, "mul");
    expect(cfg.operator).toBe("mul");
    expect(cfg.numOperands).toBe(2);
    expect(cfg.minDigits).toBe(2);
    expect(cfg.maxDigits).toBe(3);
    expect(cfg.mulMinDigits).toBe(1);
    expect(cfg.mulMaxDigits).toBe(2);
  });

  it("caps maxDigits at 3 for mul", () => {
    const params = new URLSearchParams("min=2&max=4");
    const cfg = parseConfig(params, "mul");
    expect(cfg.maxDigits).toBe(3);
  });

  it("defaults invalid mulMaxDigits", () => {
    const params = new URLSearchParams("mmin=1&mmax=9");
    const cfg = parseConfig(params, "mul");
    // 9 is out of valid range (1-3), so defaults to 1
    expect(cfg.mulMaxDigits).toBe(1);
  });

  it("adjusts mmax upward when mmin > mmax", () => {
    const params = new URLSearchParams("mmin=3&mmax=1");
    const cfg = parseConfig(params, "mul");
    expect(cfg.mulMinDigits).toBe(3);
    expect(cfg.mulMaxDigits).toBe(3);
  });

  it("parses div with dmin/dmax/dr", () => {
    const params = new URLSearchParams("min=3&max=4&dmin=1&dmax=2&dr=1");
    const cfg = parseConfig(params, "div");
    expect(cfg.operator).toBe("div");
    expect(cfg.numOperands).toBe(2);
    expect(cfg.minDigits).toBe(3);
    expect(cfg.maxDigits).toBe(4);
    expect(cfg.divMinDigits).toBe(1);
    expect(cfg.divMaxDigits).toBe(2);
    expect(cfg.divAllowRemainder).toBe(true);
  });

  it("forces minDigits >= 2 for div", () => {
    const params = new URLSearchParams("min=1&max=3");
    const cfg = parseConfig(params, "div");
    expect(cfg.minDigits).toBe(2);
  });

  it("defaults divAllowRemainder to false", () => {
    const params = new URLSearchParams();
    const cfg = parseConfig(params, "div");
    expect(cfg.divAllowRemainder).toBe(false);
  });

  it("defaults divAllowRepeating to false", () => {
    const cfg = parseConfig(new URLSearchParams(), "div");
    expect(cfg.divAllowRepeating).toBe(false);
  });

  it("parses dre=1 as divAllowRepeating true", () => {
    const cfg = parseConfig(new URLSearchParams("dre=1"), "div");
    expect(cfg.divAllowRepeating).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// buildParams
// ---------------------------------------------------------------------------
describe("buildParams", () => {
  it("includes dec=1 when useDecimals is on", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults, useDecimals: true,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("dec")).toBe("1");
  });

  it("omits dec when useDecimals is off", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("dec")).toBe(false);
  });

  it("includes ops for addition mode", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 3,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("ops")).toBe("3");
    expect(params.has("answers")).toBe(false);
  });

  it("omits ops for subtraction mode", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "sub",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("ops")).toBe(false);
  });

  it("includes answers=1 when showAnswers is true", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, true, cfg);
    expect(params.get("answers")).toBe("1");
  });

  it("includes cc=1 when consecutiveCarries is on", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: true, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("cc")).toBe("1");
  });

  it("omits cc when consecutiveCarries is off", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("cc")).toBe(false);
  });

  it("includes grid=0 when showGrid is false", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: false, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("grid")).toBe("0");
  });

  it("omits grid when showGrid is true", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("grid")).toBe(false);
  });

  it("includes mmin/mmax for mul", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("mmin")).toBe("1");
    expect(params.get("mmax")).toBe("2");
    expect(params.has("ops")).toBe(false);
  });

  it("includes dmin/dmax/dr for div", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: true, divAllowRepeating: false,
      useDecimals: false,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("dmin")).toBe("1");
    expect(params.get("dmax")).toBe("2");
    expect(params.get("dr")).toBe("1");
    expect(params.has("ops")).toBe(false);
  });

  it("omits dr when divAllowRemainder is false", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false,
      useDecimals: false,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("dr")).toBe(false);
  });

  it("round-trips: parseConfig(buildParams(...), operator) recovers config", () => {
    const configs: HissanConfig[] = [
      { minDigits: 1, maxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "add", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults },
      { minDigits: 2, maxDigits: 4, numOperands: 3, consecutiveCarries: true, showGrid: false, operator: "add", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults },
      { minDigits: 1, maxDigits: 3, numOperands: 2, consecutiveCarries: true, showGrid: true, operator: "sub", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults },
      { minDigits: 2, maxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "mul", mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults },
      { minDigits: 1, maxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "mul", mulMinDigits: 2, mulMaxDigits: 3, ...divDefaults },
      { minDigits: 2, maxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "div", mulMinDigits: 1, mulMaxDigits: 1, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, useDecimals: false },
      { minDigits: 3, maxDigits: 4, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "div", mulMinDigits: 1, mulMaxDigits: 1, divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: true, divAllowRepeating: false, useDecimals: false },
      { minDigits: 2, maxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "div", mulMinDigits: 1, mulMaxDigits: 1, divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: false, divAllowRepeating: true, useDecimals: true },
      { minDigits: 1, maxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "add", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults, useDecimals: true },
      { minDigits: 1, maxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "sub", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults, useDecimals: true },
    ];
    for (const cfg of configs) {
      const params = buildParams(123, false, cfg);
      const recovered = parseConfig(params, cfg.operator);
      expect(recovered).toEqual(cfg);
    }
  });
});

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
    // 123 with dp=2 → 1.23, totalIntCols=2, totalDecCols=2
    expect(toDecimalDigitCells(123, 2, 2, 2)).toEqual(["", 1, 2, 3]);
  });

  it("handles dp=0 (no decimal part)", () => {
    // 42 with dp=0, totalIntCols=3, totalDecCols=2
    expect(toDecimalDigitCells(42, 0, 3, 2)).toEqual(["", 4, 2, "", ""]);
  });

  it("handles dp=numDigits (integer part is 0)", () => {
    // 5 with dp=1 → 0.5, totalIntCols=2, totalDecCols=1
    expect(toDecimalDigitCells(5, 1, 2, 1)).toEqual(["", 0, 5]);
  });

  it("handles dp=numDigits with multi-digit operand", () => {
    // 123 with dp=3 → 0.123, totalIntCols=2, totalDecCols=3
    expect(toDecimalDigitCells(123, 3, 2, 3)).toEqual(["", 0, 1, 2, 3]);
  });

  it("pads decimal part with leading zeros when dp > numDigits", () => {
    // 5 with dp=2 → 0.05, totalIntCols=2, totalDecCols=2
    expect(toDecimalDigitCells(5, 2, 2, 2)).toEqual(["", 0, 0, 5]);
  });

  it("leaves trailing decimal cells empty for operands", () => {
    // 12 with dp=1 → 1.2, totalIntCols=2, totalDecCols=3
    expect(toDecimalDigitCells(12, 1, 2, 3)).toEqual(["", 1, 2, "", ""]);
  });

  it("shows trailing zeros for answer", () => {
    // 460 with dp=2 → 4.60, totalIntCols=2, totalDecCols=2
    expect(toDecimalDigitCells(460, 2, 2, 2)).toEqual(["", 4, 6, 0]);
  });
});

// ---------------------------------------------------------------------------
// computeIndicators
// ---------------------------------------------------------------------------
describe("computeIndicators", () => {
  describe("addition carries", () => {
    it("no carry for small numbers", () => {
      // 12 + 34 = 46, no carry
      const { indicators } = computeIndicators([12, 34], 2, "add");
      // totalCols = 3: [col0, col1, col2]
      expect(indicators).toEqual([0, 0, 0]);
    });

    it("carry from ones to tens", () => {
      // 18 + 15 = 33, carry from ones
      const { indicators } = computeIndicators([18, 15], 2, "add");
      // indicators show carry *into* each column
      // col 0 (hundreds): carry from tens? 8+5=13 ones carry=1, 1+1+1=3 tens no carry → 0
      // col 1 (tens): carry from ones = 1
      // col 2 (ones): no carry in = 0
      expect(indicators[2]).toBe(0); // ones: no carry in
      expect(indicators[1]).toBe(1); // tens: carry from ones
    });

    it("carry chain across all columns", () => {
      // 99 + 11 = 110, carries in every column
      const { indicators } = computeIndicators([99, 11], 2, "add");
      // col 2 (ones): no carry in → 0
      // col 1 (tens): carry from ones (9+1=10) → 1
      // col 0 (hundreds): carry from tens (9+1+1=11) → 1
      expect(indicators).toEqual([1, 1, 0]);
    });
  });

  describe("subtraction borrows", () => {
    it("no borrow when minuend digits are larger", () => {
      // 85 - 23 = 62, no borrow
      const { indicators, borrowOut } = computeIndicators([85, 23], 2, "sub");
      expect(indicators).toEqual([0, 0, 0]);
      expect(borrowOut).toEqual([0, 0, 0]);
    });

    it("borrow from tens to ones", () => {
      // 42 - 15 = 27, ones: 2-5 < 0 → borrow
      const { indicators, borrowOut, borrowDisplay } = computeIndicators([42, 15], 2, "sub");
      // col 2 (ones): no borrow in → indicators[2]=0, but 2-5<0 → borrowOut[2]=1
      expect(indicators[2]).toBe(0);
      expect(borrowOut[2]).toBe(1);
      // col 1 (tens): borrow from ones → indicators[1]=1
      expect(indicators[1]).toBe(1);
      // borrowDisplay[1]: minuendDigit(4) - 1 + borrowOut[1]*10
      // 4-1-1=2 >=0, so borrowOut[1]=0, display = 4-1+0 = 3
      expect(borrowDisplay[1]).toBe(3);
    });

    it("consecutive borrows show large display value", () => {
      // 100 - 1 = 99
      // col 2 (ones): 0-1<0 → borrow
      // col 1 (tens): 0-0-1<0 → borrow again
      // borrowDisplay[1]: minuendDigit(0) - 1 + borrowOut[1]*10 = -1+10 = 9
      const { indicators, borrowOut, borrowDisplay } = computeIndicators([100, 1], 3, "sub");
      // totalCols = 4
      expect(indicators[3]).toBe(0); // ones: no borrow in
      expect(borrowOut[3]).toBe(1);  // ones borrows
      expect(indicators[2]).toBe(1); // tens: borrow in
      expect(borrowOut[2]).toBe(1);  // tens also borrows
      expect(borrowDisplay[2]).toBe(9); // 0-1+10=9
      expect(indicators[1]).toBe(1); // hundreds: borrow in
      expect(borrowDisplay[1]).toBe(0); // 1-1+0=0
    });
  });
});
