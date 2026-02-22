import { describe, it, expect } from "vitest";
import { generateSqrt } from "./square-root";

const seeds = [1, 2, 42, 100, 999];

describe("generateSqrt", () => {
  it("returns 12 problems", () => {
    const problems = generateSqrt(42, "mixed");
    expect(problems).toHaveLength(12);
  });

  it("is deterministic with the same seed", () => {
    const a = generateSqrt(42, "mixed");
    const b = generateSqrt(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSqrt(1, "mixed");
    const b = generateSqrt(2, "mixed");
    const aExprs = a.map((p) => p.expr);
    const bExprs = b.map((p) => p.expr);
    expect(aExprs).not.toEqual(bExprs);
  });

  it("each problem has non-empty expr and answerDisplay", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "mixed");
      for (const p of problems) {
        expect(p.expr.length).toBeGreaterThan(0);
        expect(p.answerDisplay.length).toBeGreaterThan(0);
      }
    }
  });

  it("each problem has a valid type", () => {
    const validTypes = ["find", "simplify", "mul-div", "add-sub", "rationalize"];
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "mixed");
      for (const p of problems) {
        expect(validTypes).toContain(p.type);
      }
    }
  });

  it("find mode only produces find problems", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "find");
      for (const p of problems) {
        expect(p.type).toBe("find");
      }
    }
  });

  it("simplify mode only produces simplify problems", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "simplify");
      for (const p of problems) {
        expect(p.type).toBe("simplify");
      }
    }
  });

  it("mul-div mode only produces mul-div problems", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "mul-div");
      for (const p of problems) {
        expect(p.type).toBe("mul-div");
      }
    }
  });

  it("add-sub mode only produces add-sub problems", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "add-sub");
      for (const p of problems) {
        expect(p.type).toBe("add-sub");
      }
    }
  });

  it("rationalize mode only produces rationalize problems", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "rationalize");
      for (const p of problems) {
        expect(p.type).toBe("rationalize");
      }
    }
  });

  it("mixed mode produces multiple types", () => {
    const typesFound = new Set<string>();
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50, 100]) {
      const problems = generateSqrt(seed, "mixed");
      for (const p of problems) {
        typesFound.add(p.type);
      }
    }
    expect(typesFound.size).toBeGreaterThanOrEqual(3);
  });

  it("find problems: answers are numeric values", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "find");
      for (const p of problems) {
        expect(p.answerDisplay).toMatch(/[0-9]/);
      }
    }
  });

  it("rationalize problems: expr contains fraction with root", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "rationalize");
      for (const p of problems) {
        expect(p.expr).toMatch(/\/√/);
      }
    }
  });

  it("mul-div problems: expr contains multiplication or division of roots", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "mul-div");
      for (const p of problems) {
        expect(p.expr).toMatch(/√\d+ [×÷] √\d+/);
      }
    }
  });

  it("all expressions within each seed are unique", () => {
    for (const seed of seeds) {
      const problems = generateSqrt(seed, "mixed");
      const exprs = problems.map((p) => p.expr);
      const unique = new Set(exprs);
      expect(unique.size).toBe(exprs.length);
    }
  });
});
