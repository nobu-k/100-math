import { mulberry32 } from "../random";

export interface FillBlankProblem {
  /** null = blank */
  left: number | null;
  right: number | null;
  result: number;
  op: "+" | "−";
  answer: number;
}

export const generateFillBlank = (
  seed: number,
  max: number,
  mode: "add" | "sub" | "mixed",
): FillBlankProblem[] => {
  const rng = mulberry32(seed);
  const problems: FillBlankProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const useAdd =
      mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const c = 2 + Math.floor(rng() * (max - 1));
      const a = 1 + Math.floor(rng() * (c - 1));
      const b = c - a;
      if (rng() < 0.5) {
        problems.push({ left: null, right: b, result: c, op: "+", answer: a });
      } else {
        problems.push({ left: a, right: null, result: c, op: "+", answer: b });
      }
    } else {
      const a = 2 + Math.floor(rng() * (max - 1));
      const b = 1 + Math.floor(rng() * (a - 1));
      const c = a - b;
      if (rng() < 0.5) {
        problems.push({ left: null, right: b, result: c, op: "−", answer: a });
      } else {
        problems.push({ left: a, right: null, result: c, op: "−", answer: b });
      }
    }
  }
  return problems;
};
