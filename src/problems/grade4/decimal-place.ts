import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateDecimalPlace(
  seed: number,
  mode: "count" | "multiply" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = mode === "mixed" ? (rng() < 0.5 ? "count" : "multiply") : mode;

    if (sub === "count") {
      // "0.1が23個で□" or "4.7は0.1が□個"
      const count = 1 + Math.floor(rng() * 99);
      const val = count / 10;
      if (rng() < 0.5) {
        problems.push({ question: `0.1が${count}個で□`, answer: `${val}` });
      } else {
        problems.push({ question: `${val}は0.1が□個`, answer: `${count}` });
      }
    } else {
      // "3.2の10倍は□" or "3.2の1/10は□"
      const base = Math.round((1 + rng() * 98) * 10) / 100;
      const baseStr = base.toFixed(1);
      if (rng() < 0.5) {
        const mul = [10, 100][Math.floor(rng() * 2)];
        const result = base * mul;
        problems.push({ question: `${baseStr}の${mul}倍は？`, answer: `${result}` });
      } else {
        const result = base / 10;
        const resultStr = Number(result.toFixed(2)).toString();
        problems.push({ question: `${baseStr}の1/10は？`, answer: resultStr });
      }
    }
  }
  return problems;
}
