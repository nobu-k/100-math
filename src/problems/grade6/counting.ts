import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateCounting = (seed: number): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  const permTemplates = [
    (n: number) => ({
      q: `${n}枚のカード${Array.from({ length: n }, (_, i) => String.fromCharCode(65 + i)).join(", ")}の並べ方は何通り？`,
      a: factorial(n),
    }),
    (n: number) => ({
      q: `${n}人が1列に並ぶ方法は何通り？`,
      a: factorial(n),
    }),
  ];

  const combTemplates = [
    (n: number, r: number) => ({
      q: `${n}人から${r}人を選ぶ組み合わせは何通り？`,
      a: comb(n, r),
    }),
    (n: number, r: number) => ({
      q: `${n}つの中から${r}つを選ぶ方法は何通り？`,
      a: comb(n, r),
    }),
  ];

  const seen = new Set<string>();
  for (let i = 0; i < 8; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      let q: string, a: number;
      if (rng() < 0.5) {
        // permutation
        const n = 3 + Math.floor(rng() * 5); // 3-7
        const tmpl = permTemplates[Math.floor(rng() * permTemplates.length)];
        ({ q, a } = tmpl(n));
      } else {
        // combination
        const n = 4 + Math.floor(rng() * 5); // 4-8
        const r = 2 + Math.floor(rng() * Math.min(3, n - 2)); // 2-4
        const tmpl = combTemplates[Math.floor(rng() * combTemplates.length)];
        ({ q, a } = tmpl(n, r));
      }
      if (!seen.has(q) || attempt === 19) {
        seen.add(q);
        problems.push({ question: q, answer: `${a}通り` });
        break;
      }
    }
  }
  return problems;
};

const factorial = (n: number): number => {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};

const comb = (n: number, r: number): number => {
  return factorial(n) / (factorial(r) * factorial(n - r));
};
