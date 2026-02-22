import { mulberry32 } from "../random";

export type PrimeMode = "identify" | "factorize";

export interface PrimeProblem {
  mode: PrimeMode;
  /** For "identify": list of numbers to check */
  numbers?: number[];
  /** For "identify": which of them are prime */
  primes?: number[];
  /** For "factorize": the number to factorize */
  target?: number;
  /** For "factorize": the prime factors as sorted array, e.g. [2, 3, 5] for 30 */
  factors?: number[];
  /** For "factorize": display string e.g. "2 × 3 × 5" */
  factorExpr?: string;
}

const PRIMES_UNDER_50 = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];

function isPrime(n: number): boolean {
  if (n < 2) return false;
  for (let i = 2; i * i <= n; i++) {
    if (n % i === 0) return false;
  }
  return true;
}

function primeFactorize(n: number): number[] {
  const factors: number[] = [];
  let remaining = n;
  for (let d = 2; d * d <= remaining; d++) {
    while (remaining % d === 0) {
      factors.push(d);
      remaining /= d;
    }
  }
  if (remaining > 1) factors.push(remaining);
  return factors;
}

function shuffle(arr: number[], rng: () => number): number[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function generatePrime(
  seed: number,
  mode: PrimeMode = "identify",
): PrimeProblem[] {
  const rng = mulberry32(seed);
  const problems: PrimeProblem[] = [];

  if (mode === "identify") {
    for (let i = 0; i < 8; i++) {
      // Pick 8 numbers: mix of primes and composites, always include 1
      const nums: number[] = [];
      const includeOne = i === 0; // first problem includes 1
      if (includeOne) nums.push(1);

      // Add some primes
      const primeCount = 2 + Math.floor(rng() * 3); // 2-4 primes
      const availablePrimes = shuffle([...PRIMES_UNDER_50], rng);
      for (let j = 0; j < primeCount && j < availablePrimes.length; j++) {
        nums.push(availablePrimes[j]);
      }

      // Fill rest with composites
      while (nums.length < 8) {
        const n = Math.floor(rng() * 48) + 2; // 2-49
        if (!nums.includes(n)) {
          nums.push(n);
        }
      }

      nums.sort((a, b) => a - b);
      const primes = nums.filter((n) => isPrime(n));
      problems.push({ mode: "identify", numbers: nums, primes });
    }
  } else {
    // factorize
    // Generate numbers that have interesting factorizations
    const candidates = [
      12, 18, 20, 24, 28, 30, 36, 40, 42, 45, 48, 50, 54, 56, 60, 63, 70, 72,
      75, 80, 84, 90, 96, 100, 105, 108, 120, 126, 140, 150, 168, 180, 200,
      210, 252, 300, 360,
    ];
    const shuffled = shuffle(candidates, rng);

    for (let i = 0; i < 10 && i < shuffled.length; i++) {
      const target = shuffled[i];
      const factors = primeFactorize(target);
      const factorExpr = factors.join(" × ");
      problems.push({ mode: "factorize", target, factors, factorExpr });
    }
  }
  return problems;
}
