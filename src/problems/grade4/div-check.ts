import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateDivCheck(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const divisor = 2 + Math.floor(rng() * 8); // 2-9
    const quotient = 1 + Math.floor(rng() * 20);
    const remainder = Math.floor(rng() * divisor); // 0 to divisor-1
    const dividend = divisor * quotient + remainder;

    if (remainder === 0) {
      problems.push({
        question: `${dividend} ÷ ${divisor} ＝ ${quotient} を確かめなさい`,
        answer: `${divisor} × ${quotient} ＝ ${dividend}`,
      });
    } else {
      problems.push({
        question: `${dividend} ÷ ${divisor} ＝ ${quotient} あまり ${remainder} を確かめなさい`,
        answer: `${divisor} × ${quotient} ＋ ${remainder} ＝ ${dividend}`,
      });
    }
  }
  return problems;
}
