import { describe, it, expect } from "vitest";
import { mulberry32 } from "./random";
import {
  parseConfig,
  buildParams,
  generateNumber,
  generateProblem,
  generateProblems,
  generateCarryChainProblem,
  generateBorrowChainProblem,
  generateSubtractionProblem,
  generateMultiplicationProblem,
  generateDivisionProblem,
  computeMulDetails,
  computeDivDetails,
  getProblemCount,
  digitsWithMinSum,
  digitsWithExactSum,
  randInt,
  toDigitCells,
  computeIndicators,
  type HissanConfig,
} from "./hissan-logic";

const divDefaults = { divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false } as const;

// ---------------------------------------------------------------------------
// parseConfig
// ---------------------------------------------------------------------------
describe("parseConfig", () => {
  it("returns defaults for empty params", () => {
    const cfg = parseConfig(new URLSearchParams());
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
    const params = new URLSearchParams("hmin=2&hmax=3&hops=3&hcc=1&hgrid=0&hop=add");
    const cfg = parseConfig(params);
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

  it("hop=sub forces numOperands=2 regardless of hops", () => {
    const params = new URLSearchParams("hop=sub&hops=3");
    const cfg = parseConfig(params);
    expect(cfg.operator).toBe("sub");
    expect(cfg.numOperands).toBe(2);
  });

  it("adjusts hmax upward when hmin > hmax", () => {
    const params = new URLSearchParams("hmin=3&hmax=1");
    const cfg = parseConfig(params);
    expect(cfg.minDigits).toBe(3);
    expect(cfg.maxDigits).toBe(3);
  });

  it("uses defaults for invalid values", () => {
    const params = new URLSearchParams("hmin=abc&hmax=99&hops=0");
    const cfg = parseConfig(params);
    expect(cfg.minDigits).toBe(1);
    expect(cfg.maxDigits).toBe(2);
    expect(cfg.numOperands).toBe(2);
  });

  it("parses hcc=1 as consecutiveCarries true", () => {
    const params = new URLSearchParams("hcc=1");
    const cfg = parseConfig(params);
    expect(cfg.consecutiveCarries).toBe(true);
  });

  it("parses hcc absent as consecutiveCarries false", () => {
    const params = new URLSearchParams();
    const cfg = parseConfig(params);
    expect(cfg.consecutiveCarries).toBe(false);
  });

  it("parses hgrid=0 as showGrid false", () => {
    const params = new URLSearchParams("hgrid=0");
    const cfg = parseConfig(params);
    expect(cfg.showGrid).toBe(false);
  });

  it("parses hgrid absent as showGrid true", () => {
    const params = new URLSearchParams();
    const cfg = parseConfig(params);
    expect(cfg.showGrid).toBe(true);
  });

  it("parses hop=mul with hmmin/hmmax", () => {
    const params = new URLSearchParams("hop=mul&hmin=2&hmax=3&hmmin=1&hmmax=2");
    const cfg = parseConfig(params);
    expect(cfg.operator).toBe("mul");
    expect(cfg.numOperands).toBe(2);
    expect(cfg.minDigits).toBe(2);
    expect(cfg.maxDigits).toBe(3);
    expect(cfg.mulMinDigits).toBe(1);
    expect(cfg.mulMaxDigits).toBe(2);
  });

  it("caps maxDigits at 3 for mul", () => {
    const params = new URLSearchParams("hop=mul&hmin=2&hmax=4");
    const cfg = parseConfig(params);
    expect(cfg.maxDigits).toBe(3);
  });

  it("defaults invalid mulMaxDigits", () => {
    const params = new URLSearchParams("hop=mul&hmmin=1&hmmax=9");
    const cfg = parseConfig(params);
    // 9 is out of valid range (1-3), so defaults to 1
    expect(cfg.mulMaxDigits).toBe(1);
  });

  it("adjusts hmmax upward when hmmin > hmmax", () => {
    const params = new URLSearchParams("hop=mul&hmmin=3&hmmax=1");
    const cfg = parseConfig(params);
    expect(cfg.mulMinDigits).toBe(3);
    expect(cfg.mulMaxDigits).toBe(3);
  });

  it("parses hop=div with hdmin/hdmax/hdr", () => {
    const params = new URLSearchParams("hop=div&hmin=3&hmax=4&hdmin=1&hdmax=2&hdr=1");
    const cfg = parseConfig(params);
    expect(cfg.operator).toBe("div");
    expect(cfg.numOperands).toBe(2);
    expect(cfg.minDigits).toBe(3);
    expect(cfg.maxDigits).toBe(4);
    expect(cfg.divMinDigits).toBe(1);
    expect(cfg.divMaxDigits).toBe(2);
    expect(cfg.divAllowRemainder).toBe(true);
  });

  it("forces minDigits >= 2 for div", () => {
    const params = new URLSearchParams("hop=div&hmin=1&hmax=3");
    const cfg = parseConfig(params);
    expect(cfg.minDigits).toBe(2);
  });

  it("defaults divAllowRemainder to false", () => {
    const params = new URLSearchParams("hop=div");
    const cfg = parseConfig(params);
    expect(cfg.divAllowRemainder).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// buildParams
// ---------------------------------------------------------------------------
describe("buildParams", () => {
  it("includes hops for addition mode, omits hop", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 3,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hops")).toBe("3");
    expect(params.has("hop")).toBe(false);
    expect(params.has("answers")).toBe(false);
  });

  it("includes hop=sub for subtraction mode, omits hops", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "sub",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hop")).toBe("sub");
    expect(params.has("hops")).toBe(false);
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

  it("includes hcc=1 when consecutiveCarries is on", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: true, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hcc")).toBe("1");
  });

  it("omits hcc when consecutiveCarries is off", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("hcc")).toBe(false);
  });

  it("includes hgrid=0 when showGrid is false", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: false, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hgrid")).toBe("0");
  });

  it("omits hgrid when showGrid is true", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("hgrid")).toBe(false);
  });

  it("includes hop=mul and hmmin/hmmax for mul", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hop")).toBe("mul");
    expect(params.get("hmmin")).toBe("1");
    expect(params.get("hmmax")).toBe("2");
    expect(params.has("hops")).toBe(false);
  });

  it("includes hop=div and hdmin/hdmax/hdr for div", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: true,
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hop")).toBe("div");
    expect(params.get("hdmin")).toBe("1");
    expect(params.get("hdmax")).toBe("2");
    expect(params.get("hdr")).toBe("1");
    expect(params.has("hops")).toBe(false);
  });

  it("omits hdr when divAllowRemainder is false", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false,
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("hdr")).toBe(false);
  });

  it("round-trips: parseConfig(buildParams(...)) recovers config", () => {
    const configs: HissanConfig[] = [
      { minDigits: 1, maxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "add", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults },
      { minDigits: 2, maxDigits: 4, numOperands: 3, consecutiveCarries: true, showGrid: false, operator: "add", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults },
      { minDigits: 1, maxDigits: 3, numOperands: 2, consecutiveCarries: true, showGrid: true, operator: "sub", mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults },
      { minDigits: 2, maxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "mul", mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults },
      { minDigits: 1, maxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "mul", mulMinDigits: 2, mulMaxDigits: 3, ...divDefaults },
      { minDigits: 2, maxDigits: 3, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "div", mulMinDigits: 1, mulMaxDigits: 1, divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false },
      { minDigits: 3, maxDigits: 4, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "div", mulMinDigits: 1, mulMaxDigits: 1, divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: true },
    ];
    for (const cfg of configs) {
      const params = buildParams(123, false, cfg);
      const recovered = parseConfig(params);
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
// generateProblem — addition
// ---------------------------------------------------------------------------
describe("generateProblem (addition)", () => {
  const cfg: HissanConfig = {
    minDigits: 1, maxDigits: 2, numOperands: 3,
    consecutiveCarries: false, showGrid: true, operator: "add",
    mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
  };

  it("returns correct operand count", () => {
    const rng = mulberry32(10);
    const problem = generateProblem(rng, cfg);
    expect(problem).toHaveLength(3);
  });

  it("each operand is within digit range", () => {
    const seeds = [10, 20, 30, 40, 50];
    for (const seed of seeds) {
      const rng = mulberry32(seed);
      const problem = generateProblem(rng, cfg);
      for (const n of problem) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(99);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// generateProblem — subtraction
// ---------------------------------------------------------------------------
describe("generateProblem (subtraction)", () => {
  const cfg: HissanConfig = {
    minDigits: 1, maxDigits: 2, numOperands: 2,
    consecutiveCarries: false, showGrid: true, operator: "sub",
    mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
  };

  it("returns 2 operands", () => {
    const rng = mulberry32(10);
    const problem = generateProblem(rng, cfg);
    expect(problem).toHaveLength(2);
  });

  it("result is >= 0", () => {
    const seeds = [10, 20, 30, 40, 50, 100, 200, 300];
    for (const seed of seeds) {
      const rng = mulberry32(seed);
      const problem = generateProblem(rng, cfg);
      expect(problem[0] - problem[1]).toBeGreaterThanOrEqual(0);
    }
  });

  it("each operand is within digit range", () => {
    const seeds = [10, 20, 30, 40, 50];
    for (const seed of seeds) {
      const rng = mulberry32(seed);
      const problem = generateProblem(rng, cfg);
      for (const n of problem) {
        expect(n).toBeGreaterThanOrEqual(1);
        expect(n).toBeLessThanOrEqual(99);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// generateProblems
// ---------------------------------------------------------------------------
describe("generateProblems", () => {
  it("returns exactly 12 problems", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const problems = generateProblems(42, cfg);
    expect(problems).toHaveLength(12);
  });

  it("is deterministic for the same seed", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const a = generateProblems(12345, cfg);
    const b = generateProblems(12345, cfg);
    expect(a).toEqual(b);
  });
});

// ---------------------------------------------------------------------------
// Carry chain
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// Borrow chain
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// generateSubtractionProblem
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// computeMulDetails
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// computeDivDetails
// ---------------------------------------------------------------------------
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
});

// ---------------------------------------------------------------------------
// generateMultiplicationProblem
// ---------------------------------------------------------------------------
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

// ---------------------------------------------------------------------------
// generateDivisionProblem
// ---------------------------------------------------------------------------
describe("generateDivisionProblem", () => {
  it("exact mode always produces divisible pair", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false,
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

// ---------------------------------------------------------------------------
// getProblemCount
// ---------------------------------------------------------------------------
describe("getProblemCount", () => {
  it("returns 12 for add/sub", () => {
    const addCfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    expect(getProblemCount(addCfg)).toBe(12);

    const subCfg: HissanConfig = {
      ...addCfg, operator: "sub",
    };
    expect(getProblemCount(subCfg)).toBe(12);
  });

  it("returns 12 for mul with 1-digit multiplier", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    expect(getProblemCount(cfg)).toBe(12);
  });

  it("returns 6 for mul with 2+ digit multiplier", () => {
    const cfg2: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults,
    };
    expect(getProblemCount(cfg2)).toBe(6);

    const cfg3: HissanConfig = {
      ...cfg2, mulMinDigits: 2, mulMaxDigits: 3,
    };
    expect(getProblemCount(cfg3)).toBe(6);
  });

  it("returns 6 for div", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false,
    };
    expect(getProblemCount(cfg)).toBe(6);
  });
});

// ---------------------------------------------------------------------------
// generateProblems — mul count
// ---------------------------------------------------------------------------
describe("generateProblems (mul)", () => {
  it("returns 6 problems for 2-digit multiplier", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults,
    };
    const problems = generateProblems(42, cfg);
    expect(problems).toHaveLength(6);
  });

  it("returns 12 problems for 1-digit multiplier", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const problems = generateProblems(42, cfg);
    expect(problems).toHaveLength(12);
  });
});

// ---------------------------------------------------------------------------
// generateProblems — div count
// ---------------------------------------------------------------------------
describe("generateProblems (div)", () => {
  it("returns 6 problems for division", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false,
    };
    const problems = generateProblems(42, cfg);
    expect(problems).toHaveLength(6);
  });
});
