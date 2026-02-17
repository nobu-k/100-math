import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateCalcTrick(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const patterns = [
    // 25 × N: use 25 × 4 = 100
    () => {
      const n = 4 * (1 + Math.floor(rng() * 25));
      return { question: `25 × ${n} をくふうして計算しなさい`, answer: `${25 * n}` };
    },
    // 99 × N: (100-1) × N
    () => {
      const n = 2 + Math.floor(rng() * 20);
      return { question: `99 × ${n} をくふうして計算しなさい`, answer: `${99 * n}` };
    },
    // 101 × N: (100+1) × N
    () => {
      const n = 2 + Math.floor(rng() * 20);
      return { question: `101 × ${n} をくふうして計算しなさい`, answer: `${101 * n}` };
    },
    // a × b + a × c = a × (b+c)
    () => {
      const a = 2 + Math.floor(rng() * 8);
      const b = 10 + Math.floor(rng() * 30);
      const c = 10 + Math.floor(rng() * 30);
      return {
        question: `${a} × ${b} ＋ ${a} × ${c} をくふうして計算しなさい`,
        answer: `${a * (b + c)}`,
      };
    },
  ];

  for (let i = 0; i < 8; i++) {
    const pat = patterns[Math.floor(rng() * patterns.length)];
    problems.push(pat());
  }
  return problems;
}
