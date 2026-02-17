import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateCounting(seed: number): TextProblem[] {
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

  for (let i = 0; i < 8; i++) {
    if (rng() < 0.5) {
      // permutation
      const n = 3 + Math.floor(rng() * 3); // 3-5
      const tmpl = permTemplates[Math.floor(rng() * permTemplates.length)];
      const { q, a } = tmpl(n);
      problems.push({ question: q, answer: `${a}通り` });
    } else {
      // combination
      const n = 4 + Math.floor(rng() * 3); // 4-6
      const r = 2 + Math.floor(rng() * Math.min(2, n - 2)); // 2-3
      const tmpl = combTemplates[Math.floor(rng() * combTemplates.length)];
      const { q, a } = tmpl(n, r);
      problems.push({ question: q, answer: `${a}通り` });
    }
  }
  return problems;
}

function factorial(n: number): number {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
}

function comb(n: number, r: number): number {
  return factorial(n) / (factorial(r) * factorial(n - r));
}
