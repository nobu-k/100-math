import { describe, it, expect } from "vitest";
import { generateSqrtExpansion } from "./sqrt-expansion";

const seeds = [1, 2, 42, 100, 999];
const manySeeds = Array.from({ length: 50 }, (_, i) => i + 1);

/** Evaluate a term like "3", "√5" or "2√3" (optional leading −). */
const evalTerm = (raw: string): number => {
  let sign = 1;
  let t = raw;
  if (t.startsWith("−")) {
    sign = -1;
    t = t.slice(1);
  }
  const m = t.match(/^(\d*)√(\d+)$/);
  if (m) return sign * (m[1] ? Number(m[1]) : 1) * Math.sqrt(Number(m[2]));
  return sign * Number(t);
};

/** Evaluate a sum like "5 + 2√6" or "−1 − √5". */
const evalSum = (s: string): number =>
  s.replace(/ − /g, " + −").split(" + ").map(evalTerm).reduce((a, b) => a + b, 0);

/** Evaluate a question expression in any of its three shapes. */
const evalExpr = (expr: string): number => {
  const square = expr.match(/^\(([^)]+)\)²$/);
  if (square) return evalSum(square[1]) ** 2;
  const product = expr.match(/^\(([^)]+)\)\(([^)]+)\)$/);
  if (product) return evalSum(product[1]) * evalSum(product[2]);
  const mono = expr.match(/^(\d*√\d+)\(([^)]+)\)$/);
  if (mono) return evalTerm(mono[1]) * evalSum(mono[2]);
  throw new Error(`unrecognized expr: ${expr}`);
};

const isSquareFree = (n: number): boolean => {
  for (let d = 2; d * d <= n; d++) {
    if (n % (d * d) === 0) return false;
  }
  return true;
};

describe("generateSqrtExpansion", () => {
  it("returns the requested number of problems", () => {
    expect(generateSqrtExpansion(42, "mixed")).toHaveLength(12);
    expect(generateSqrtExpansion(42, "mixed", 8)).toHaveLength(8);
  });

  it("is deterministic with the same seed", () => {
    const a = generateSqrtExpansion(42, "mixed");
    const b = generateSqrtExpansion(42, "mixed");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateSqrtExpansion(1, "mixed").map((p) => p.expr);
    const b = generateSqrtExpansion(2, "mixed").map((p) => p.expr);
    expect(a).not.toEqual(b);
  });

  it("every answer equals its expression numerically", () => {
    for (const seed of manySeeds) {
      for (const mode of ["distribute", "formula", "mixed"] as const) {
        for (const p of generateSqrtExpansion(seed, mode)) {
          expect(
            Math.abs(evalExpr(p.expr) - evalSum(p.answerExpr)),
            `${p.expr} = ${p.answerExpr}`,
          ).toBeLessThan(1e-9);
        }
      }
    }
  });

  it("answers are fully simplified: square-free radicands, no duplicates, rational part first", () => {
    for (const seed of manySeeds) {
      for (const p of generateSqrtExpansion(seed, "mixed")) {
        const rads = [...p.answerExpr.matchAll(/√(\d+)/g)].map((m) => Number(m[1]));
        for (const r of rads) {
          expect(isSquareFree(r), `${p.answerExpr} contains √${r}`).toBe(true);
        }
        expect(new Set(rads).size).toBe(rads.length);
        expect(rads).toEqual([...rads].sort((a, b) => a - b));
      }
    }
  });

  it("distribute mode only produces monomial × binomial forms", () => {
    for (const seed of seeds) {
      for (const p of generateSqrtExpansion(seed, "distribute")) {
        expect(p.expr).toMatch(/^\d*√\d+\(/);
      }
    }
  });

  it("formula mode only produces squares and binomial products", () => {
    for (const seed of seeds) {
      for (const p of generateSqrtExpansion(seed, "formula")) {
        expect(p.expr).toMatch(/^\([^)]+\)(²|\([^)]+\))$/);
      }
    }
  });

  it("covers squares, difference of squares and distribution across seeds", () => {
    const shapes = new Set<string>();
    for (const seed of manySeeds) {
      for (const p of generateSqrtExpansion(seed, "mixed")) {
        if (/²$/.test(p.expr)) shapes.add("square");
        else if (/^\d*√\d+\(/.test(p.expr)) shapes.add("distribute");
        else shapes.add("product");
      }
    }
    expect(shapes).toEqual(new Set(["square", "distribute", "product"]));
  });

  it("all expressions within each seed are unique", () => {
    for (const seed of seeds) {
      const exprs = generateSqrtExpansion(seed, "mixed").map((p) => p.expr);
      expect(new Set(exprs).size).toBe(exprs.length);
    }
  });
});
