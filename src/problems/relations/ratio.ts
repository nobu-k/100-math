import { mulberry32 } from "../random";
import { gcd } from "../shared/math-utils";
import type { TextProblem } from "../shared/types";

export const generateRatio = (
  seed: number,
  type: "simplify" | "fill" | "mixed",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const t = type === "mixed"
      ? (rng() < 0.5 ? "simplify" : "fill")
      : type;

    if (t === "simplify") {
      // Simplify a ratio: e.g. "12:18 → 2:3"
      const base1 = 1 + Math.floor(rng() * 9);
      const base2 = 1 + Math.floor(rng() * 9);
      const mult = 2 + Math.floor(rng() * 5);
      const a = base1 * mult;
      const b = base2 * mult;
      const g = gcd(a, b);
      problems.push({
        question: `${a}：${b} を最も簡単な整数の比にしなさい`,
        answer: `${a / g}：${b / g}`,
      });
    } else {
      // Fill blank: "3:5 = □:20" → 12
      const a = 1 + Math.floor(rng() * 9);
      const b = 1 + Math.floor(rng() * 9);
      const mult = 2 + Math.floor(rng() * 5);
      if (rng() < 0.5) {
        // blank on left: □:b*mult = a:b → □ = a*mult
        problems.push({
          question: `${a}：${b} ＝ □：${b * mult}`,
          answer: `${a * mult}`,
        });
      } else {
        // blank on right: a*mult:□ = a:b → □ = b*mult
        problems.push({
          question: `${a}：${b} ＝ ${a * mult}：□`,
          answer: `${b * mult}`,
        });
      }
    }
  }
  return problems;
};
