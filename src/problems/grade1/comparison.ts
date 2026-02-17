import { mulberry32 } from "../random";

export interface ComparisonProblem {
  left: number;
  right: number;
  answer: "＞" | "＜" | "＝";
}

export function generateComparison(
  seed: number,
  max: number,
): ComparisonProblem[] {
  const rng = mulberry32(seed);
  const problems: ComparisonProblem[] = [];
  for (let i = 0; i < 15; i++) {
    let left: number, right: number;
    if (i < 2) {
      // guarantee a couple of equal pairs
      left = 1 + Math.floor(rng() * max);
      right = left;
    } else {
      left = 1 + Math.floor(rng() * max);
      right = 1 + Math.floor(rng() * max);
    }
    const answer: "＞" | "＜" | "＝" =
      left > right ? "＞" : left < right ? "＜" : "＝";
    problems.push({ left, right, answer });
  }
  return problems;
}
