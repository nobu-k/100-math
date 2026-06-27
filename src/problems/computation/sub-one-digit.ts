import { mulberry32 } from "../random";

export interface SubProblem {
  a: number;
  b: number;
  answer: number;
}

/**
 * Generate a list of 1-digit minus 1-digit subtractions for first graders.
 * Every problem on a page is unique and has a non-negative answer.
 * `count` is capped to the number of available unique pairs (e.g. max=5 → 15).
 */
export const generateSubOneDigit = (
  seed: number,
  max: number,
  count: number,
): SubProblem[] => {
  const rng = mulberry32(seed);
  const pairs = pickUnique(buildPool(max), count, rng);
  return pairs.map(([a, b]) => ({ a, b, answer: a - b }));
};

/** All (minuend, subtrahend) pairs with 1 ≤ b ≤ a ≤ max (no negatives, no trivial − 0). */
const buildPool = (max: number): [number, number][] => {
  const pairs: [number, number][] = [];
  for (let a = 1; a <= max; a++) {
    for (let b = 1; b <= a; b++) {
      pairs.push([a, b]);
    }
  }
  return pairs;
};

const pickUnique = (
  pool: [number, number][],
  count: number,
  rng: () => number,
): [number, number][] =>
  shuffle(pool, rng).slice(0, Math.min(count, pool.length));

const shuffle = <T>(arr: T[], rng: () => number): T[] => {
  const result = [...arr];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
};
