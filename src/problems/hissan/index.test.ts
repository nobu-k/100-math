import { describe, it, expect } from "vitest";
import { mulberry32 } from "../random";
import {
  generateProblem,
  generateProblems,
  getProblemCount,
  type HissanConfig,
} from "./index";

const divDefaults = { divMinDigits: 1, divMaxDigits: 1, divAllowRemainder: false, useDecimals: false } as const;

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
      useDecimals: false,
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
      useDecimals: false,
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
      // All operands in a problem share the same dp
      const dp = decimalPlaces[i][0];
      expect(dp).toBeGreaterThanOrEqual(1);
      for (let j = 0; j < problems[i].length; j++) {
        expect(decimalPlaces[i][j]).toBe(dp);
        // Integer part must be at most 2 digits (value < 100)
        const numDigits = String(problems[i][j]).length;
        expect(numDigits - dp).toBeLessThanOrEqual(2);
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
