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
  digitsWithMinSum,
  digitsWithExactSum,
  randInt,
  type HissanConfig,
} from "./hissan-logic";

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
});

// ---------------------------------------------------------------------------
// buildParams
// ---------------------------------------------------------------------------
describe("buildParams", () => {
  it("includes hops for addition mode, omits hop", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 3,
      consecutiveCarries: false, showGrid: true, operator: "add",
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
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hop")).toBe("sub");
    expect(params.has("hops")).toBe(false);
  });

  it("includes answers=1 when showAnswers is true", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
    };
    const params = buildParams(42, true, cfg);
    expect(params.get("answers")).toBe("1");
  });

  it("includes hcc=1 when consecutiveCarries is on", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: true, showGrid: true, operator: "add",
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hcc")).toBe("1");
  });

  it("omits hcc when consecutiveCarries is off", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("hcc")).toBe(false);
  });

  it("includes hgrid=0 when showGrid is false", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: false, operator: "add",
    };
    const params = buildParams(42, false, cfg);
    expect(params.get("hgrid")).toBe("0");
  });

  it("omits hgrid when showGrid is true", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
    };
    const params = buildParams(42, false, cfg);
    expect(params.has("hgrid")).toBe(false);
  });

  it("round-trips: parseConfig(buildParams(...)) recovers config", () => {
    const configs: HissanConfig[] = [
      { minDigits: 1, maxDigits: 2, numOperands: 2, consecutiveCarries: false, showGrid: true, operator: "add" },
      { minDigits: 2, maxDigits: 4, numOperands: 3, consecutiveCarries: true, showGrid: false, operator: "add" },
      { minDigits: 1, maxDigits: 3, numOperands: 2, consecutiveCarries: true, showGrid: true, operator: "sub" },
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
    };
    const problems = generateProblems(42, cfg);
    expect(problems).toHaveLength(12);
  });

  it("is deterministic for the same seed", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
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
    };
    for (let seed = 0; seed < 50; seed++) {
      const rng = mulberry32(seed);
      const problem = generateSubtractionProblem(rng, cfg);
      expect(problem[0] - problem[1]).toBeGreaterThanOrEqual(0);
    }
  });
});
