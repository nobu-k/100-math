import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import {
  generateProblem,
  generateProblems,
  getProblemCount,
  divisionTerminates,
  divisionCycleLength,
  decimalDisplayWidth,
  type HissanConfig,
} from "./index";

const divDefaults = { divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, divAllowRepeating: false, useDecimals: false } as const;

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
      divAllowRepeating: false, useDecimals: false,
    };
    expect(getProblemCount(cfg)).toBe(6);
  });

  it("returns 8 for add with useDecimals", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults, useDecimals: true,
    };
    expect(getProblemCount(cfg)).toBe(8);
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
    const { problems } = generateProblems(42, cfg);
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
// generateProblems — mul count
// ---------------------------------------------------------------------------
describe("generateProblems (mul)", () => {
  it("returns 6 problems for 2-digit multiplier", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 2, ...divDefaults,
    };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(6);
  });

  it("returns 12 problems for 1-digit multiplier", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "mul",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const { problems } = generateProblems(42, cfg);
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
      divAllowRepeating: false, useDecimals: false,
    };
    const { problems } = generateProblems(42, cfg);
    expect(problems).toHaveLength(6);
  });
});

describe("generateProblems (decimal)", () => {
  it("returns 8 problems with decimalPlaces for decimal add", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults, useDecimals: true,
    };
    const { problems, decimalPlaces } = generateProblems(42, cfg);
    expect(problems).toHaveLength(8);
    expect(decimalPlaces).toHaveLength(8);
    for (let i = 0; i < 8; i++) {
      expect(decimalPlaces[i]).toHaveLength(problems[i].length);
      for (let j = 0; j < problems[i].length; j++) {
        const dp = decimalPlaces[i][j];
        expect(dp).toBeGreaterThanOrEqual(1);
        // Integer part must be at most 2 digits (value < 100)
        const numDigits = String(problems[i][j]).length;
        expect(numDigits - dp).toBeLessThanOrEqual(2);
      }
    }
  });

  it("returns 8 problems with decimalPlaces for decimal sub", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "sub",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults, useDecimals: true,
    };
    const { problems, decimalPlaces } = generateProblems(42, cfg);
    expect(problems).toHaveLength(8);
    expect(decimalPlaces).toHaveLength(8);
    for (let i = 0; i < 8; i++) {
      expect(decimalPlaces[i]).toHaveLength(problems[i].length);
      for (let j = 0; j < problems[i].length; j++) {
        const dp = decimalPlaces[i][j];
        expect(dp).toBeGreaterThanOrEqual(1);
        const numDigits = String(problems[i][j]).length;
        expect(numDigits - dp).toBeLessThanOrEqual(2);
      }
      // Decimal answer must be non-negative (minuend dp ≤ subtrahend dp)
      const maxDP = Math.max(...decimalPlaces[i]);
      const aligned = problems[i].map((op, j) => op * Math.pow(10, maxDP - decimalPlaces[i][j]));
      expect(aligned[0] - aligned[1]).toBeGreaterThanOrEqual(0);
    }
  });

  it("decimal sub answer is non-negative across many seeds", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "sub",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults, useDecimals: true,
    };
    for (let seed = 0; seed < 50; seed++) {
      const { problems, decimalPlaces } = generateProblems(seed, cfg);
      for (let i = 0; i < problems.length; i++) {
        const maxDP = Math.max(...decimalPlaces[i]);
        const aligned = problems[i].map((op, j) => op * Math.pow(10, maxDP - decimalPlaces[i][j]));
        expect(aligned[0] - aligned[1]).toBeGreaterThanOrEqual(0);
      }
    }
  });

  it("returns 6 problems with decimalPlaces and divExtra for decimal div", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false,
      divAllowRepeating: false, useDecimals: true,
    };
    for (let seed = 0; seed < 20; seed++) {
      const { problems, decimalPlaces, divExtra } = generateProblems(seed, cfg);
      expect(problems).toHaveLength(6);
      expect(decimalPlaces).toHaveLength(6);
      expect(divExtra).toHaveLength(6);
      for (let i = 0; i < 6; i++) {
        expect(decimalPlaces[i]).toHaveLength(2);
        expect(decimalPlaces[i][0]).toBeGreaterThan(0); // dividend has dp
        expect(decimalPlaces[i][1]).toBeGreaterThanOrEqual(0); // divisor may have dp
        const entry = divExtra![i];
        if (entry.cycleStart !== undefined) {
          // Pattern 3: repeating — has cycle info
          expect(entry.cycleLength).toBeGreaterThanOrEqual(1);
          expect(entry.cycleLength).toBeLessThanOrEqual(6);
          expect(entry.extraDigits).toBe(entry.cycleStart! + entry.cycleLength!);
        } else if (entry.extraDigits > 0) {
          // Pattern 2: finite extension
          const result = divisionTerminates(problems[i][0], problems[i][1], entry.extraDigits);
          expect(result.terminates).toBe(true);
          expect(result.stepsNeeded).toBe(entry.extraDigits);
        } else {
          // Pattern 1: exact
          expect(problems[i][0] % problems[i][1]).toBe(0);
        }
      }
    }
  });

  it("returns all-zero decimalPlaces for non-decimal mode", () => {
    const cfg: HissanConfig = {
      minDigits: 1, maxDigits: 2, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "add",
      mulMinDigits: 1, mulMaxDigits: 1, ...divDefaults,
    };
    const { decimalPlaces } = generateProblems(42, cfg);
    for (const dps of decimalPlaces) {
      for (const dp of dps) {
        expect(dp).toBe(0);
      }
    }
  });
});

// ---------------------------------------------------------------------------
// divisionTerminates
// ---------------------------------------------------------------------------
describe("divisionTerminates", () => {
  it("returns 0 steps for exact division", () => {
    expect(divisionTerminates(12, 4, 3)).toEqual({ terminates: true, stepsNeeded: 0 });
  });

  it("detects termination in 1 step", () => {
    // 14 / 4 = 3 r2 → 20/4 = 5 r0
    expect(divisionTerminates(14, 4, 3)).toEqual({ terminates: true, stepsNeeded: 1 });
  });

  it("detects termination in 2 steps", () => {
    // 75 / 4 = 18 r3 → 30/4=7r2, 20/4=5r0
    expect(divisionTerminates(75, 4, 3)).toEqual({ terminates: true, stepsNeeded: 2 });
  });

  it("detects non-termination within limit", () => {
    // 10 / 3 = 3 r1 → repeats forever
    expect(divisionTerminates(10, 3, 3)).toEqual({ terminates: false, stepsNeeded: 0 });
  });

  it("respects maxExtraSteps limit", () => {
    // 75 / 4 needs 2 steps, but only allow 1
    expect(divisionTerminates(75, 4, 1)).toEqual({ terminates: false, stepsNeeded: 0 });
  });
});

// ---------------------------------------------------------------------------
// divisionCycleLength
// ---------------------------------------------------------------------------
describe("divisionCycleLength", () => {
  it("returns null for exact division", () => {
    expect(divisionCycleLength(12, 4, 10)).toBeNull();
  });

  it("returns null for terminating division", () => {
    // 14 / 4 terminates at step 1
    expect(divisionCycleLength(14, 4, 10)).toBeNull();
  });

  it("detects cycle of length 1 for 10 / 3", () => {
    expect(divisionCycleLength(10, 3, 10)).toEqual({ cycleStart: 0, cycleLength: 1 });
  });

  it("detects cycle of length 6 for 22 / 7", () => {
    expect(divisionCycleLength(22, 7, 10)).toEqual({ cycleStart: 0, cycleLength: 6 });
  });

  it("detects cycle with preamble for 14 / 12", () => {
    // 14/12: remainder 2 → 20/12=1r8, 80/12=6r8 → cycle "6" starts at step 1
    expect(divisionCycleLength(14, 12, 10)).toEqual({ cycleStart: 1, cycleLength: 1 });
  });

  it("returns null when cycle exceeds maxSteps", () => {
    // 22/7 has cycle length 6, but maxSteps=3 is too small
    expect(divisionCycleLength(22, 7, 3)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// decimal div column width constraint
// ---------------------------------------------------------------------------
describe("decimal div column width constraint", () => {
  it("total columns (using divisor display width) ≤ 9 across many seeds", () => {
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 2, divAllowRemainder: false,
      divAllowRepeating: false, useDecimals: true,
    };
    for (let seed = 0; seed < 50; seed++) {
      const { problems, decimalPlaces, divExtra } = generateProblems(seed, cfg);
      for (let i = 0; i < problems.length; i++) {
        const [dividend, divisor] = problems[i];
        const [dividendDP, divisorDP] = decimalPlaces[i];
        const extraDigits = divExtra![i].extraDigits;
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
    // Regression: a single-digit divisor with divisorDP=1 (e.g. 2 → 0.2)
    // must occupy 2 columns, not 1
    expect(decimalDisplayWidth(1, 1)).toBe(2); // "0.2" needs 2 chars
    expect(decimalDisplayWidth(1, 0)).toBe(1); // "2" needs 1 char
    expect(decimalDisplayWidth(2, 1)).toBe(2); // "1.2" needs 2 chars
    expect(decimalDisplayWidth(2, 2)).toBe(3); // "0.12" needs 3 chars

    // Verify generated problems: when divisorDP > 0, divCols must use display width
    const cfg: HissanConfig = {
      minDigits: 2, maxDigits: 3, numOperands: 2,
      consecutiveCarries: false, showGrid: true, operator: "div",
      mulMinDigits: 1, mulMaxDigits: 1,
      divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false,
      divAllowRepeating: false, useDecimals: true,
    };
    for (let seed = 0; seed < 100; seed++) {
      const { problems, decimalPlaces } = generateProblems(seed, cfg);
      for (let i = 0; i < problems.length; i++) {
        const divisor = problems[i][1];
        const divisorDP = decimalPlaces[i][1];
        if (divisorDP > 0) {
          const rawLen = String(divisor).length;
          const displayWidth = decimalDisplayWidth(rawLen, divisorDP);
          // Display width must be enough to show all digits + leading zero if needed
          expect(displayWidth).toBeGreaterThanOrEqual(rawLen);
          expect(displayWidth).toBeGreaterThanOrEqual(divisorDP + 1);
        }
      }
    }
  });
});
