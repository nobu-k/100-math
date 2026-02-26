import { mulberry32, seedToHex } from "../random";

export type FractionOperator = "addition" | "reduction" | "commonDenom";

export interface AdditionProblem {
  kind: "addition";
  numerators: [number, number];
  denominator: number;
  answerNumerator: number;
  answerDenominator: number;
}

export interface ReductionProblem {
  kind: "reduction";
  numerator: number;
  denominator: number;
  answerNumerator: number;
  answerDenominator: number;
}

export interface CommonDenomProblem {
  kind: "commonDenom";
  fractions: [{ n: number; d: number }, { n: number; d: number }];
  commonDenom: number;
  answerNumerators: [number, number];
  multipliers: [number, number];
}

export type FractionProblem = AdditionProblem | ReductionProblem | CommonDenomProblem;

export const DEFAULTS: Record<FractionOperator, { dmin: number; dmax: number }> = {
  addition: { dmin: 2, dmax: 10 },
  reduction: { dmin: 4, dmax: 20 },
  commonDenom: { dmin: 2, dmax: 12 },
};

export const PARAM_KEYS = ["q", "answers", "dmin", "dmax"];

export const frac = (n: number, d: number): string =>
  d === 1 ? String(n) : `\\dfrac{${n}}{${d}}`;

export const updateUrl = (
  seed: number,
  showAnswers: boolean,
  minDenom: number,
  maxDenom: number,
  defaults: { dmin: number; dmax: number },
) => {
  const url = new URL(window.location.href);
  for (const key of PARAM_KEYS) {
    url.searchParams.delete(key);
  }
  url.searchParams.set("q", seedToHex(seed));
  if (showAnswers) url.searchParams.set("answers", "1");
  if (minDenom !== defaults.dmin) url.searchParams.set("dmin", String(minDenom));
  if (maxDenom !== defaults.dmax) url.searchParams.set("dmax", String(maxDenom));
  window.history.replaceState(null, "", url.toString());
};

export const generateAdditionProblems = (
  seed: number,
  minDenom: number,
  maxDenom: number,
): AdditionProblem[] => {
  const rng = mulberry32(seed);
  const problems: AdditionProblem[] = [];
  for (let i = 0; i < 10; i++) {
    const d = minDenom + Math.floor(rng() * (maxDenom - minDenom + 1));
    const a = 1 + Math.floor(rng() * (d - 1));
    const b = 1 + Math.floor(rng() * (d - 1));
    problems.push({
      kind: "addition",
      numerators: [a, b],
      denominator: d,
      answerNumerator: a + b,
      answerDenominator: d,
    });
  }
  return problems;
};

export const generateReductionProblems = (
  seed: number,
  minDenom: number,
  maxDenom: number,
): ReductionProblem[] => {
  const rng = mulberry32(seed);
  const problems: ReductionProblem[] = [];
  const candidates: { n: number; D: number; rn: number; rd: number }[] = [];
  for (let D = Math.max(minDenom, 4); D <= maxDenom; D++) {
    for (let n = 1; n < D; n++) {
      const g = gcd(n, D);
      if (g > 1) {
        candidates.push({ n, D, rn: n / g, rd: D / g });
      }
    }
  }
  if (candidates.length === 0) {
    for (let i = 0; i < 10; i++) {
      problems.push({
        kind: "reduction",
        numerator: 2,
        denominator: 4,
        answerNumerator: 1,
        answerDenominator: 2,
      });
    }
    return problems;
  }
  for (let i = 0; i < 10; i++) {
    const idx = Math.floor(rng() * candidates.length);
    const c = candidates[idx];
    problems.push({
      kind: "reduction",
      numerator: c.n,
      denominator: c.D,
      answerNumerator: c.rn,
      answerDenominator: c.rd,
    });
  }
  return problems;
};

export const generateCommonDenomProblems = (
  seed: number,
  minDenom: number,
  maxDenom: number,
): CommonDenomProblem[] => {
  const rng = mulberry32(seed);
  const problems: CommonDenomProblem[] = [];
  for (let i = 0; i < 10; i++) {
    let found = false;
    for (let attempt = 0; attempt < 100; attempt++) {
      const useInteger = rng() < 0.1;
      let d1: number, d2: number;
      if (useInteger) {
        const fracDenom = Math.max(minDenom, 2) + Math.floor(rng() * (maxDenom - Math.max(minDenom, 2) + 1));
        if (rng() < 0.5) { d1 = 1; d2 = fracDenom; } else { d1 = fracDenom; d2 = 1; }
      } else {
        d1 = Math.max(minDenom, 2) + Math.floor(rng() * (maxDenom - Math.max(minDenom, 2) + 1));
        d2 = Math.max(minDenom, 2) + Math.floor(rng() * (maxDenom - Math.max(minDenom, 2) + 1));
      }
      if (d1 === d2) continue;
      const lcd = lcm(d1, d2);
      if (lcd > 99) continue;
      const n1 = d1 === 1 ? 1 + Math.floor(rng() * 9) : 1 + Math.floor(rng() * (d1 - 1));
      const n2 = d2 === 1 ? 1 + Math.floor(rng() * 9) : 1 + Math.floor(rng() * (d2 - 1));
      const m1 = lcd / d1;
      const m2 = lcd / d2;
      problems.push({
        kind: "commonDenom",
        fractions: [{ n: n1, d: d1 }, { n: n2, d: d2 }],
        commonDenom: lcd,
        answerNumerators: [n1 * m1, n2 * m2],
        multipliers: [m1, m2],
      });
      found = true;
      break;
    }
    if (!found) {
      problems.push({
        kind: "commonDenom",
        fractions: [{ n: 1, d: 2 }, { n: 1, d: 3 }],
        commonDenom: 6,
        answerNumerators: [3, 2],
        multipliers: [3, 2],
      });
    }
  }
  return problems;
};

const gcd = (a: number, b: number): number => {
  while (b) {
    [a, b] = [b, a % b];
  }
  return a;
};

const lcm = (a: number, b: number): number => (a / gcd(a, b)) * b;
