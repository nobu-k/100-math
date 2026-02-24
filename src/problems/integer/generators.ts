import { mulberry32 } from "../random";

export interface MultiplesProblem {
  kind: "multiples";
  number: number;
  count: number;
  answers: number[];
}

export interface FactorsProblem {
  kind: "factors";
  number: number;
  answers: number[];
}

export interface LcmProblem {
  kind: "lcm";
  a: number;
  b: number;
  answer: number;
  // Ladder division steps: each row is [divisor, ...remainders]
  ladder: { divisor: number; values: [number, number] }[];
  ladderBottom: [number, number];
}

export interface GcdProblem {
  kind: "gcd";
  a: number;
  b: number;
  answer: number;
  ladder: { divisor: number; values: [number, number] }[];
  ladderBottom: [number, number];
}

export const DEFAULTS = {
  multiples: { nmin: 2, nmax: 9, count: 5 },
  factors: { nmin: 2, nmax: 36, count: 5 },
  lcm: { nmin: 2, nmax: 20, count: 5 },
  gcd: { nmin: 2, nmax: 36, count: 5 },
} as const;

export const PARAM_KEYS = ["q", "answers", "nmin", "nmax", "count"];

export const generateMultiplesProblems = (
  seed: number,
  nmin: number,
  nmax: number,
  count: number,
): MultiplesProblem[] => {
  const rng = mulberry32(seed);
  const nums = pickUnique(rng, nmin, nmax, 10);
  return nums.map((n) => {
    const answers: number[] = [];
    for (let j = 1; j <= count; j++) answers.push(n * j);
    return { kind: "multiples" as const, number: n, count, answers };
  });
};

export const generateFactorsProblems = (
  seed: number,
  nmin: number,
  nmax: number,
): FactorsProblem[] => {
  const rng = mulberry32(seed);
  const nums = pickUnique(rng, nmin, nmax, 10);
  return nums.map((n) => ({
    kind: "factors" as const,
    number: n,
    answers: getFactors(n),
  }));
};

export const generateLcmProblems = (
  seed: number,
  nmin: number,
  nmax: number,
): LcmProblem[] => {
  const rng = mulberry32(seed);
  const problems: LcmProblem[] = [];
  for (let i = 0; i < 10; i++) {
    let a: number, b: number;
    // Pick a shared factor g >= 2, then two coprime multipliers
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const maxG = Math.floor(nmax / 2);
      if (maxG < 2) break;
      const g = 2 + Math.floor(rng() * (maxG - 1));
      const lo = Math.max(1, Math.ceil(nmin / g));
      const hi = Math.floor(nmax / g);
      if (hi - lo < 1) continue;
      const ma = lo + Math.floor(rng() * (hi - lo + 1));
      const mb = lo + Math.floor(rng() * (hi - lo + 1));
      if (ma === mb || gcd(ma, mb) !== 1) continue;
      a = g * ma;
      b = g * mb;
      const answer = lcmOf(a, b);
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "lcm", a, b, answer, ladder, ladderBottom: bottom });
      found = true;
      break;
    }
    if (!found) {
      a = nmin + Math.floor(rng() * (nmax - nmin + 1));
      do {
        b = nmin + Math.floor(rng() * (nmax - nmin + 1));
      } while (b === a);
      const answer = lcmOf(a, b);
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "lcm", a, b, answer, ladder, ladderBottom: bottom });
    }
  }
  return problems;
};

export const generateGcdProblems = (
  seed: number,
  nmin: number,
  nmax: number,
): GcdProblem[] => {
  const rng = mulberry32(seed);
  const problems: GcdProblem[] = [];
  for (let i = 0; i < 10; i++) {
    let a: number, b: number;
    // Pick a non-trivial GCD g, then two coprime multipliers
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const maxG = Math.floor(nmax / 2);
      if (maxG < 2) break;
      const g = 2 + Math.floor(rng() * (maxG - 1));
      const lo = Math.max(1, Math.ceil(nmin / g));
      const hi = Math.floor(nmax / g);
      if (hi - lo < 1) continue;
      const ma = lo + Math.floor(rng() * (hi - lo + 1));
      const mb = lo + Math.floor(rng() * (hi - lo + 1));
      if (ma === mb || gcd(ma, mb) !== 1) continue;
      a = g * ma;
      b = g * mb;
      const answer = g;
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "gcd", a, b, answer, ladder, ladderBottom: bottom });
      found = true;
      break;
    }
    if (!found) {
      // Fallback: random pair
      a = nmin + Math.floor(rng() * (nmax - nmin + 1));
      do {
        b = nmin + Math.floor(rng() * (nmax - nmin + 1));
      } while (b === a);
      const answer = gcd(a, b);
      const { ladder, bottom } = computeLadder(a, b);
      problems.push({ kind: "gcd", a, b, answer, ladder, ladderBottom: bottom });
    }
  }
  return problems;
};

const pickUnique = (rng: () => number, min: number, max: number, n: number): number[] => {
  const range = max - min + 1;
  const pool = Array.from({ length: range }, (_, i) => i + min);
  const limit = Math.min(n, range);
  for (let i = 0; i < limit; i++) {
    const j = i + Math.floor(rng() * (range - i));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  const result: number[] = [];
  for (let i = 0; i < n; i++) result.push(pool[i % limit]);
  return result;
};

const getFactors = (n: number): number[] => {
  const factors: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      factors.push(i);
      if (i !== n / i) factors.push(n / i);
    }
  }
  return factors.sort((a, b) => a - b);
};

const computeLadder = (a: number, b: number): { ladder: { divisor: number; values: [number, number] }[]; bottom: [number, number] } => {
  const ladder: { divisor: number; values: [number, number] }[] = [];
  let x = a, y = b;
  for (let d = 2; d <= Math.min(x, y); ) {
    if (x % d === 0 && y % d === 0) {
      ladder.push({ divisor: d, values: [x, y] });
      x /= d;
      y /= d;
    } else {
      d++;
    }
  }
  return { ladder, bottom: [x, y] };
};

const gcd = (a: number, b: number): number => {
  while (b) { [a, b] = [b, a % b]; }
  return a;
};

const lcmOf = (a: number, b: number): number => (a / gcd(a, b)) * b;
