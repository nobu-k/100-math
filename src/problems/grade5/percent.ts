import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generatePercent(
  seed: number,
  find: "ratio" | "compared" | "base" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = find === "mixed"
      ? (["ratio", "compared", "base"] as const)[Math.floor(rng() * 3)]
      : find;

    const base = (2 + Math.floor(rng() * 19)) * 10;
    const pct = (1 + Math.floor(rng() * 19)) * 5;
    const compared = base * pct / 100;

    switch (type) {
      case "ratio":
        problems.push({ question: `${base}人中${compared}人は何%？`, answer: `${pct}%` });
        break;
      case "compared":
        problems.push({ question: `${base}の${pct}%はいくつ？`, answer: `${compared}` });
        break;
      case "base":
        problems.push({ question: `□の${pct}%が${compared}のとき、□はいくつ？`, answer: `${base}` });
        break;
    }
  }
  return problems;
}
