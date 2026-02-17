import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateAverage(
  seed: number,
  count: number,
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 8; i++) {
    const n = count;
    const avg = 50 + Math.floor(rng() * 50);
    const total = avg * n;
    const values: number[] = [];
    let remaining = total;
    for (let j = 0; j < n - 1; j++) {
      const maxVal = Math.min(100, remaining - (n - j - 1));
      const minVal = Math.max(1, remaining - 100 * (n - j - 1));
      const v = minVal + Math.floor(rng() * (maxVal - minVal + 1));
      values.push(v);
      remaining -= v;
    }
    values.push(remaining);

    for (let j = values.length - 1; j > 0; j--) {
      const k = Math.floor(rng() * (j + 1));
      [values[j], values[k]] = [values[k], values[j]];
    }

    problems.push({ question: `${values.join("、")} の平均は？`, answer: `${avg}` });
  }
  return problems;
}
