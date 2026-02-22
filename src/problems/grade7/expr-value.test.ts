import { describe, it, expect } from "vitest";
import { generateExprValue } from "./expr-value";

const seeds = [1, 2, 42, 100, 999];

describe("generateExprValue", () => {
  it("returns 10 problems", () => {
    const problems = generateExprValue(42, "one");
    expect(problems).toHaveLength(10);
  });

  it("defaults to one variable mode", () => {
    const a = generateExprValue(42);
    const b = generateExprValue(42, "one");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generateExprValue(42, "one");
    const b = generateExprValue(42, "one");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateExprValue(1, "one");
    const b = generateExprValue(2, "one");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });

  it("one variable mode: each problem has a single variable", () => {
    for (const seed of seeds) {
      const problems = generateExprValue(seed, "one");
      for (const p of problems) {
        expect(Object.keys(p.vars).length).toBe(1);
      }
    }
  });

  it("two variable mode: each problem has two variables", () => {
    for (const seed of seeds) {
      const problems = generateExprValue(seed, "two");
      for (const p of problems) {
        expect(Object.keys(p.vars).length).toBe(2);
      }
    }
  });

  it("answer is within [-50, 50]", () => {
    for (const seed of seeds) {
      const problems = generateExprValue(seed, "one");
      for (const p of problems) {
        expect(Math.abs(p.answer)).toBeLessThanOrEqual(50);
      }
    }
  });

  it("answer is within [-50, 50] for two variable mode", () => {
    for (const seed of seeds) {
      const problems = generateExprValue(seed, "two");
      for (const p of problems) {
        expect(Math.abs(p.answer)).toBeLessThanOrEqual(50);
      }
    }
  });

  it("each problem has expr, vars, varDisplay, and answer", () => {
    for (const seed of seeds) {
      const problems = generateExprValue(seed, "one");
      for (const p of problems) {
        expect(p.expr).toBeDefined();
        expect(typeof p.expr).toBe("string");
        expect(p.vars).toBeDefined();
        expect(p.varDisplay).toBeDefined();
        expect(typeof p.answer).toBe("number");
      }
    }
  });

  it("variable values are nonzero", () => {
    for (const seed of seeds) {
      const problems = generateExprValue(seed, "one");
      for (const p of problems) {
        for (const val of Object.values(p.vars)) {
          expect(val).not.toBe(0);
        }
      }
    }
  });

  it("two variable mode returns 10 problems", () => {
    const problems = generateExprValue(42, "two");
    expect(problems).toHaveLength(10);
  });
});
