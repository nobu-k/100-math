import { describe, it, expect } from "vitest";
import { generateKukuBlank } from "./kuku-blank";

const seeds = [1, 2, 42, 100, 999];

describe("generateKukuBlank", () => {
  it("returns 15 problems", () => {
    const problems = generateKukuBlank(42, "any");
    expect(problems).toHaveLength(15);
  });

  it("product equals a * b for every problem", () => {
    for (const seed of seeds) {
      for (const mode of ["any", "product", "factor"] as const) {
        const problems = generateKukuBlank(seed, mode);
        for (const p of problems) {
          expect(p.product).toBe(p.a * p.b);
        }
      }
    }
  });

  it("answer matches the blanked position", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "any");
      for (const p of problems) {
        if (p.blankPos === "a") expect(p.answer).toBe(p.a);
        else if (p.blankPos === "b") expect(p.answer).toBe(p.b);
        else expect(p.answer).toBe(p.product);
      }
    }
  });

  it("a and b are between 1 and 9", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "any");
      for (const p of problems) {
        expect(p.a).toBeGreaterThanOrEqual(1);
        expect(p.a).toBeLessThanOrEqual(9);
        expect(p.b).toBeGreaterThanOrEqual(1);
        expect(p.b).toBeLessThanOrEqual(9);
      }
    }
  });

  it("product mode: blankPos is always 'product'", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "product");
      for (const p of problems) {
        expect(p.blankPos).toBe("product");
        expect(p.answer).toBe(p.product);
      }
    }
  });

  it("factor mode: blankPos is always 'a' or 'b'", () => {
    for (const seed of seeds) {
      const problems = generateKukuBlank(seed, "factor");
      for (const p of problems) {
        expect(["a", "b"]).toContain(p.blankPos);
      }
    }
  });

  it("any mode produces all three blank positions", () => {
    let hasA = false;
    let hasB = false;
    let hasProduct = false;
    for (const seed of [1, 2, 3, 4, 5, 10, 20, 50]) {
      const problems = generateKukuBlank(seed, "any");
      for (const p of problems) {
        if (p.blankPos === "a") hasA = true;
        if (p.blankPos === "b") hasB = true;
        if (p.blankPos === "product") hasProduct = true;
      }
    }
    expect(hasA).toBe(true);
    expect(hasB).toBe(true);
    expect(hasProduct).toBe(true);
  });

  it("is deterministic with the same seed", () => {
    const a = generateKukuBlank(42, "any");
    const b = generateKukuBlank(42, "any");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generateKukuBlank(1, "any");
    const b = generateKukuBlank(2, "any");
    const aAnswers = a.map((p) => p.answer);
    const bAnswers = b.map((p) => p.answer);
    expect(aAnswers).not.toEqual(bAnswers);
  });
});
