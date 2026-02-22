import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateLiteralExpr = (seed: number): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const templates1 = [
    (x: number, a: number, b: number) => ({
      expr: `${a} × x ＋ ${b}`, val: a * x + b,
    }),
    (x: number, a: number, b: number) => ({
      expr: `${a} × x − ${b}`, val: a * x - b,
    }),
    (x: number, a: number, _b: number) => ({
      expr: `x × x ＋ ${a}`, val: x * x + a,
    }),
    (x: number, a: number, _b: number) => ({
      expr: `(x ＋ ${a}) × 2`, val: (x + a) * 2,
    }),
  ];

  for (let i = 0; i < 10; i++) {
    const x = 1 + Math.floor(rng() * 10);
    const a = 1 + Math.floor(rng() * 9);
    const b = 1 + Math.floor(rng() * 9);

    if (rng() < 0.7) {
      // single variable
      const tmpl = templates1[Math.floor(rng() * templates1.length)];
      const { expr, val } = tmpl(x, a, b);
      if (val >= 0) {
        problems.push({
          question: `x ＝ ${x} のとき、${expr} の値は？`,
          answer: `${val}`,
        });
      } else {
        // fallback
        problems.push({
          question: `x ＝ ${x} のとき、${a} × x ＋ ${b} の値は？`,
          answer: `${a * x + b}`,
        });
      }
    } else {
      // two variables
      const y = 1 + Math.floor(rng() * 10);
      const val = a * x + y;
      problems.push({
        question: `a ＝ ${x}、b ＝ ${y} のとき、${a} × a ＋ b の値は？`,
        answer: `${val}`,
      });
    }
  }
  return problems;
};
