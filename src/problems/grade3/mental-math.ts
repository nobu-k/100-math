import { mulberry32 } from "../random";

export interface MentalMathProblem {
  left: number;
  right: number;
  op: "+" | "−";
  answer: number;
}

export function generateMentalMath(
  seed: number,
  mode: "add" | "sub" | "mixed",
): MentalMathProblem[] {
  const rng = mulberry32(seed);
  const problems: MentalMathProblem[] = [];

  for (let i = 0; i < 20; i++) {
    const useAdd = mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const left = 10 + Math.floor(rng() * 90);
      const right = 1 + Math.floor(rng() * 99);
      const r = Math.min(right, 200 - left);
      if (r < 1) { continue; }
      problems.push({ left, right: r, op: "+", answer: left + r });
    } else {
      const left = 10 + Math.floor(rng() * 90);
      const right = 1 + Math.floor(rng() * (left - 1));
      problems.push({ left, right, op: "−", answer: left - right });
    }
  }
  return problems.slice(0, 20);
}
