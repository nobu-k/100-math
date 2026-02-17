import { describe, it, expect } from "vitest";
import { gcd, simplify } from "./math-utils";

// ---------------------------------------------------------------------------
// gcd
// ---------------------------------------------------------------------------
describe("gcd", () => {
  it("computes greatest common divisor", () => {
    expect(gcd(12, 8)).toBe(4);
    expect(gcd(7, 13)).toBe(1);
    expect(gcd(0, 5)).toBe(5);
    expect(gcd(18, 24)).toBe(6);
    expect(gcd(100, 100)).toBe(100);
  });

  it("handles negative inputs", () => {
    expect(gcd(-12, 8)).toBe(4);
    expect(gcd(12, -8)).toBe(4);
  });
});

// ---------------------------------------------------------------------------
// simplify
// ---------------------------------------------------------------------------
describe("simplify", () => {
  it("reduces fractions to lowest terms", () => {
    expect(simplify(4, 8)).toEqual([1, 2]);
    expect(simplify(6, 9)).toEqual([2, 3]);
    expect(simplify(7, 3)).toEqual([7, 3]);
    expect(simplify(12, 4)).toEqual([3, 1]);
  });
});
