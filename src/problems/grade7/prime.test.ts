import { describe, it, expect } from "vitest";
import { generatePrime } from "./prime";

const seeds = [1, 2, 42, 100, 999];

const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
};

describe("generatePrime", () => {
  it("identify mode returns 8 problems", () => {
    const problems = generatePrime(42, "identify");
    expect(problems).toHaveLength(8);
  });

  it("factorize mode returns 10 problems", () => {
    const problems = generatePrime(42, "factorize");
    expect(problems).toHaveLength(10);
  });

  it("defaults to identify mode", () => {
    const a = generatePrime(42);
    const b = generatePrime(42, "identify");
    expect(a).toEqual(b);
  });

  it("is deterministic with the same seed", () => {
    const a = generatePrime(42, "identify");
    const b = generatePrime(42, "identify");
    expect(a).toEqual(b);
  });

  it("produces different results with different seeds", () => {
    const a = generatePrime(1, "factorize");
    const b = generatePrime(2, "factorize");
    const aTargets = a.map((p) => p.target);
    const bTargets = b.map((p) => p.target);
    expect(aTargets).not.toEqual(bTargets);
  });

  it("identify mode: each problem has 8 numbers", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "identify");
      for (const p of problems) {
        expect(p.numbers).toHaveLength(8);
      }
    }
  });

  it("identify mode: primes array contains only primes from numbers", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "identify");
      for (const p of problems) {
        for (const prime of p.primes!) {
          expect(p.numbers).toContain(prime);
          expect(isPrime(prime)).toBe(true);
        }
      }
    }
  });

  it("identify mode: all primes in numbers are included in primes array", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "identify");
      for (const p of problems) {
        const primesInNumbers = p.numbers!.filter((n) => isPrime(n));
        expect(p.primes!.sort((a, b) => a - b)).toEqual(
          primesInNumbers.sort((a, b) => a - b),
        );
      }
    }
  });

  it("identify mode: numbers are sorted in ascending order", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "identify");
      for (const p of problems) {
        for (let i = 1; i < p.numbers!.length; i++) {
          expect(p.numbers![i]).toBeGreaterThanOrEqual(p.numbers![i - 1]);
        }
      }
    }
  });

  it("factorize mode: factors multiply to target", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "factorize");
      for (const p of problems) {
        const product = p.factors!.reduce((a, b) => a * b, 1);
        expect(product).toBe(p.target);
      }
    }
  });

  it("factorize mode: all factors are prime", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "factorize");
      for (const p of problems) {
        for (const f of p.factors!) {
          expect(isPrime(f)).toBe(true);
        }
      }
    }
  });

  it("factorize mode: factors are in non-decreasing order", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "factorize");
      for (const p of problems) {
        for (let i = 1; i < p.factors!.length; i++) {
          expect(p.factors![i]).toBeGreaterThanOrEqual(p.factors![i - 1]);
        }
      }
    }
  });

  it("factorize mode: factorExpr matches factors joined by multiplication sign", () => {
    for (const seed of seeds) {
      const problems = generatePrime(seed, "factorize");
      for (const p of problems) {
        expect(p.factorExpr).toBe(p.factors!.join(" × "));
      }
    }
  });
});
