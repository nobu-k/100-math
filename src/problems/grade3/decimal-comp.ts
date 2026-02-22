import { mulberry32 } from "../random";

export interface DecimalCompProblem {
  left: string;
  right: string;
  answer: "＞" | "＜" | "＝";
}

export const generateDecimalComp = (
  seed: number,
  maxVal: number,
): DecimalCompProblem[] => {
  const rng = mulberry32(seed);
  const problems: DecimalCompProblem[] = [];

  for (let i = 0; i < 15; i++) {
    let a: number, b: number;
    if (i < 2) {
      a = Math.round((0.1 + rng() * maxVal) * 10) / 10;
      b = a;
    } else {
      a = Math.round((0.1 + rng() * maxVal) * 10) / 10;
      b = Math.round((0.1 + rng() * maxVal) * 10) / 10;
    }
    const answer: "＞" | "＜" | "＝" = a > b ? "＞" : a < b ? "＜" : "＝";
    problems.push({ left: a.toFixed(1), right: b.toFixed(1), answer });
  }
  return problems;
};
