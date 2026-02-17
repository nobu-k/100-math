import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

/* ---- decimal-shift ---- */
export function generateDecimalShift(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const muls = [10, 100, 1000];
  const divs = [10, 100, 1000];

  for (let i = 0; i < 10; i++) {
    // generate a decimal number
    const intPart = 1 + Math.floor(rng() * 99);
    const decPart = Math.floor(rng() * 100);
    const n = intPart + decPart / 100;
    const nStr = n % 1 === 0 ? String(n) : n.toFixed(2).replace(/0+$/, "").replace(/\.$/, "");

    if (rng() < 0.5) {
      const mul = muls[Math.floor(rng() * muls.length)];
      const result = n * mul;
      const resultStr = result % 1 === 0 ? String(result) : Number(result.toFixed(5)).toString();
      problems.push({ question: `${nStr}の${mul}倍は？`, answer: resultStr });
    } else {
      const div = divs[Math.floor(rng() * divs.length)];
      const result = n / div;
      const resultStr = Number(result.toFixed(5)).toString();
      problems.push({ question: `${nStr}の1/${div}は？`, answer: resultStr });
    }
  }
  return problems;
}
