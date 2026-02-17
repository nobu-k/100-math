import { mulberry32 } from "../random";

export interface BoxEqProblem {
  display: string;
  answer: number;
}

export function generateBoxEq(
  seed: number,
  ops: "addsub" | "all",
): BoxEqProblem[] {
  const rng = mulberry32(seed);
  const problems: BoxEqProblem[] = [];

  for (let i = 0; i < 12; i++) {
    const useMultDiv = ops === "all" && rng() < 0.5;

    if (useMultDiv) {
      const useMul = rng() < 0.5;
      if (useMul) {
        const a = 2 + Math.floor(rng() * 8);
        const b = 2 + Math.floor(rng() * 8);
        const c = a * b;
        if (rng() < 0.5) {
          problems.push({ display: `□ × ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} × □ ＝ ${c}`, answer: b });
        }
      } else {
        const b = 2 + Math.floor(rng() * 8);
        const c = 1 + Math.floor(rng() * 9);
        const a = b * c;
        if (rng() < 0.5) {
          problems.push({ display: `□ ÷ ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} ÷ □ ＝ ${c}`, answer: b });
        }
      }
    } else {
      const useAdd = rng() < 0.5;
      if (useAdd) {
        const c = 10 + Math.floor(rng() * 90);
        const a = 1 + Math.floor(rng() * (c - 1));
        const b = c - a;
        if (rng() < 0.5) {
          problems.push({ display: `□ ＋ ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} ＋ □ ＝ ${c}`, answer: b });
        }
      } else {
        const a = 10 + Math.floor(rng() * 90);
        const b = 1 + Math.floor(rng() * (a - 1));
        const c = a - b;
        if (rng() < 0.5) {
          problems.push({ display: `□ − ${b} ＝ ${c}`, answer: a });
        } else {
          problems.push({ display: `${a} − □ ＝ ${c}`, answer: b });
        }
      }
    }
  }
  return problems;
}
