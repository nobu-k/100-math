import { mulberry32 } from "../random";
import { numberToKanji } from "../shared/math-utils";
import type { TextProblem } from "../shared/types";

export const generateLargeNum = (
  seed: number,
  maxRange: number,
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];
  const minVal = maxRange <= 100 ? 10 : maxRange <= 1000 ? 100 : 1000;

  for (let i = 0; i < 10; i++) {
    const n = minVal + Math.floor(rng() * (maxRange - minVal));
    const kanji = numberToKanji(n);
    if (rng() < 0.5) {
      problems.push({ question: String(n), answer: kanji });
    } else {
      problems.push({ question: kanji, answer: String(n) });
    }
  }
  return problems;
};
