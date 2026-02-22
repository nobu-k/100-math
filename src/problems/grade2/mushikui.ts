import { mulberry32 } from "../random";

export interface MushikuiProblem {
  left: number | null;
  right: number | null;
  result: number | null;
  op: "+" | "−";
  answer: number;
}

export const generateMushikui = (
  seed: number,
  max: number,
  mode: "add" | "sub" | "mixed",
): MushikuiProblem[] => {
  const rng = mulberry32(seed);
  const problems: MushikuiProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const useAdd = mode === "add" ? true : mode === "sub" ? false : rng() < 0.5;
    if (useAdd) {
      const result = 10 + Math.floor(rng() * (max - 9));
      const left = 1 + Math.floor(rng() * (result - 1));
      const right = result - left;
      const r = rng();
      if (r < 0.33) {
        problems.push({ left: null, right, result, op: "+", answer: left });
      } else if (r < 0.66) {
        problems.push({ left, right: null, result, op: "+", answer: right });
      } else {
        problems.push({ left, right, result: null, op: "+", answer: result });
      }
    } else {
      const left = 10 + Math.floor(rng() * (max - 9));
      const right = 1 + Math.floor(rng() * (left - 1));
      const result = left - right;
      const r = rng();
      if (r < 0.33) {
        problems.push({ left: null, right, result, op: "−", answer: left });
      } else if (r < 0.66) {
        problems.push({ left, right: null, result, op: "−", answer: right });
      } else {
        problems.push({ left, right, result: null, op: "−", answer: result });
      }
    }
  }
  return problems;
};
