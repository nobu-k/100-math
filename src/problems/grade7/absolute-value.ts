import { mulberry32 } from "../random";

export type AbsoluteValueMode = "find" | "list" | "equation";

export interface AbsoluteValueProblem {
  mode: AbsoluteValueMode;
  /** For "find": the number whose absolute value to find */
  number?: number;
  /** For "find": the answer */
  answer?: number;
  /** For "list": the threshold, e.g. "絶対値が N 以下の整数" */
  threshold?: number;
  /** For "list": all integers with |x| <= threshold */
  listAnswer?: number[];
  /** For "equation": |x| = a, answers are ±a */
  eqValue?: number;
  eqAnswers?: number[];
}

export const generateAbsoluteValue = (
  seed: number,
  mode: AbsoluteValueMode = "find",
): AbsoluteValueProblem[] => {
  const rng = mulberry32(seed);
  const problems: AbsoluteValueProblem[] = [];
  const seen = new Set<string>();

  if (mode === "find") {
    for (let i = 0; i < 10; i++) {
      for (let attempt = 0; attempt < 20; attempt++) {
        // Mix integers and simple decimals
        let num: number;
        if (rng() < 0.2) {
          num = Math.round((rng() * 20 - 10) * 10) / 10;
        } else {
          num = Math.floor(rng() * 21) - 10;
        }
        if (num === 0 && i > 0) continue; // allow 0 once
        const key = `${num}`;
        if (!seen.has(key) || attempt === 19) {
          seen.add(key);
          problems.push({
            mode: "find",
            number: num,
            answer: Math.abs(num),
          });
          break;
        }
      }
    }
  } else if (mode === "list") {
    for (let i = 0; i < 6; i++) {
      const threshold = Math.floor(rng() * 5) + 2; // 2-6
      const listAnswer: number[] = [];
      for (let x = -threshold; x <= threshold; x++) {
        listAnswer.push(x);
      }
      problems.push({ mode: "list", threshold, listAnswer });
    }
  } else {
    // equation: |x| = a
    for (let i = 0; i < 8; i++) {
      for (let attempt = 0; attempt < 20; attempt++) {
        const val = Math.floor(rng() * 10) + 1; // 1-10
        const key = `${val}`;
        if (!seen.has(key) || attempt === 19) {
          seen.add(key);
          problems.push({
            mode: "equation",
            eqValue: val,
            eqAnswers: [val, -val],
          });
          break;
        }
      }
    }
  }
  return problems;
};
