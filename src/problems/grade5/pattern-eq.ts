import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

/* ---- pattern-eq ---- */
export function generatePatternEq(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const a = 2 + Math.floor(rng() * 8); // coefficient
    const b = Math.floor(rng() * 10); // constant (0 for y=ax)

    // show a table and ask for the rule
    const xs = [1, 2, 3, 4, 5];
    const ys = xs.map(x => a * x + b);

    const tableStr = xs.map((x, j) => `x=${x}のときy=${ys[j]}`).join("、");
    const ruleStr = b === 0 ? `y ＝ ${a} × x` : `y ＝ ${a} × x ＋ ${b}`;

    problems.push({
      question: `${tableStr} のとき、xとyの関係を式で表しなさい`,
      answer: ruleStr,
    });
  }
  return problems;
}
