import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateEstimate = (
  seed: number,
  roundTo: number,
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const ops: ("+" | "−" | "×")[] = ["+", "−", "×"];

  for (let i = 0; i < 10; i++) {
    const op = ops[Math.floor(rng() * ops.length)];
    const a = (1 + Math.floor(rng() * 9)) * roundTo + Math.floor(rng() * roundTo);
    let b = (1 + Math.floor(rng() * 9)) * roundTo + Math.floor(rng() * roundTo);

    if (op === "−") {
      b = Math.min(b, a - 1);
      if (b < 1) b = 1 + Math.floor(rng() * (a - 1));
    }

    const aRound = Math.round(a / roundTo) * roundTo;
    const bRound = Math.round(b / roundTo) * roundTo;

    let answer: number;
    let opStr: string;
    switch (op) {
      case "+": answer = aRound + bRound; opStr = "＋"; break;
      case "−": answer = aRound - bRound; opStr = "−"; break;
      default: answer = aRound * bRound; opStr = "×"; break;
    }

    problems.push({
      question: `${a} ${opStr} ${b} をそれぞれ${roundTo === 10 ? "十" : "百"}の位までの概数にして見積もりなさい`,
      answer: `${aRound} ${opStr} ${bRound} ＝ ${answer}`,
    });
  }
  return problems;
};
