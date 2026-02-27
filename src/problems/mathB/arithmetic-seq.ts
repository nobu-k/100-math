import { mulberry32 } from "../random";

export interface SeqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateArithmeticSeq = (
  seed: number,
  count = 10,
): SeqProblem[] => {
  const rng = mulberry32(seed);
  const problems: SeqProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = generateOne(rng);
      if (!result) continue;

      const key = result.expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push(result);
        break;
      }
    }
  }
  return problems;
};

const generateOne = (rng: () => number): SeqProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    const a1 = Math.floor(rng() * 11) - 5;
    const d = Math.floor(rng() * 9) - 4;
    if (d === 0) return null;
    const n = Math.floor(rng() * 8) + 5;
    const an = a1 + (n - 1) * d;
    const expr = `初項 ${fmt(a1)}，公差 ${fmt(d)} の等差数列の第 ${n} 項`;
    const answerExpr = `a${subscript(n)} = ${fmt(a1)} + ${n - 1} × ${fmt(d)} = ${fmt(an)}`;
    return { expr, answerExpr, isNL: true };
  }

  if (variant === 1) {
    const a1 = Math.floor(rng() * 7) - 3;
    const d = Math.floor(rng() * 5) + 1;
    const n = Math.floor(rng() * 6) + 5;
    const an = a1 + (n - 1) * d;
    const sn = n * (a1 + an) / 2;
    const expr = `初項 ${fmt(a1)}，公差 ${fmt(d)} の等差数列の初項から第 ${n} 項までの和`;
    const answerExpr = `S${subscript(n)} = ${n}(${fmt(a1)} + ${fmt(an)})/2 = ${fmt(sn)}`;
    return { expr, answerExpr, isNL: true };
  }

  const a1 = Math.floor(rng() * 7) - 3;
  const d = Math.floor(rng() * 7) - 3;
  if (d === 0) return null;
  const n1 = Math.floor(rng() * 3) + 2;
  const n2 = n1 + Math.floor(rng() * 4) + 2;
  const v1 = a1 + (n1 - 1) * d;
  const v2 = a1 + (n2 - 1) * d;
  const expr = `等差数列で a${subscript(n1)} = ${fmt(v1)}, a${subscript(n2)} = ${fmt(v2)} のとき，初項 a₁ と公差 d`;
  const answerExpr = `d = ${fmt(d)}, a₁ = ${fmt(a1)}`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const subscript = (n: number): string => {
  const sub: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  return `${n}`.split("").map((d) => sub[d] ?? d).join("");
};
