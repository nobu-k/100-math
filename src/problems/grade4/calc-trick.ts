import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateCalcTrick = (seed: number): TextProblem[] => {
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

  // Round-robin: 2 of each pattern (4 patterns × 2 = 8)
  const patternOrder: number[] = [];
  for (let j = 0; j < 2; j++) {
    for (let k = 0; k < patterns.length; k++) {
      patternOrder.push(k);
    }
  }
  // Shuffle for variety
  for (let i = patternOrder.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [patternOrder[i], patternOrder[j]] = [patternOrder[j], patternOrder[i]];
  }

  const seen = new Set<string>();
  for (const patIdx of patternOrder) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const p = patterns[patIdx]();
      if (!seen.has(p.question) || attempt === 19) {
        seen.add(p.question);
        problems.push(p);
        break;
      }
    }
  }
  return problems;
};
