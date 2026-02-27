import { mulberry32 } from "../random";

export interface SeqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateGeometricSeq = (
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
    const a1 = Math.floor(rng() * 4) + 1;
    const rChoices = [2, 3, -2, -3, 1/2, 1/3];
    const r = rChoices[Math.floor(rng() * rChoices.length)];
    const n = Math.floor(rng() * 4) + 3;
    const an = a1 * Math.pow(r, n - 1);

    if (!Number.isFinite(an) || Math.abs(an) > 10000) return null;

    const rStr = Number.isInteger(r) ? fmt(r) : (r === 0.5 ? "1/2" : "1/3");
    const anStr = Number.isInteger(an) ? fmt(an) : formatFrac(an);

    const expr = `初項 ${a1}，公比 ${rStr} の等比数列の第 ${n} 項`;
    const answerExpr = `a${subscript(n)} = ${anStr}`;
    return { expr, answerExpr, isNL: true };
  }

  if (variant === 1) {
    const a1 = Math.floor(rng() * 3) + 1;
    const r = [2, 3, -2][Math.floor(rng() * 3)];
    const n = Math.floor(rng() * 4) + 3;
    const rn = Math.pow(r, n);
    const sn = a1 * (1 - rn) / (1 - r);

    if (!Number.isInteger(sn) || Math.abs(sn) > 10000) return null;

    const expr = `初項 ${a1}，公比 ${fmt(r)} の等比数列の初項から第 ${n} 項までの和`;
    const answerExpr = `S${subscript(n)} = ${fmt(sn)}`;
    return { expr, answerExpr, isNL: true };
  }

  const a1 = Math.floor(rng() * 3) + 1;
  const r = [2, 3, -2][Math.floor(rng() * 3)];
  const n2 = Math.floor(rng() * 3) + 3;
  const v1 = a1;
  const v2 = a1 * Math.pow(r, n2 - 1);

  if (Math.abs(v2) > 5000) return null;

  const expr = `等比数列で a₁ = ${fmt(v1)}, a${subscript(n2)} = ${fmt(v2)} のとき，公比 r`;
  const answerExpr = `r = ${fmt(r)}`;
  return { expr, answerExpr, isNL: true };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const formatFrac = (n: number): string => {
  for (const d of [2, 3, 4, 8, 9, 16, 27]) {
    const num = Math.round(n * d);
    if (Math.abs(num / d - n) < 0.0001) {
      const g = gcd(Math.abs(num), d);
      const sign = num < 0 ? "−" : "";
      return `${sign}${Math.abs(num) / g}/${d / g}`;
    }
  }
  return `${Math.round(n * 100) / 100}`;
};

const subscript = (n: number): string => {
  const sub: Record<string, string> = {
    "0": "₀", "1": "₁", "2": "₂", "3": "₃", "4": "₄",
    "5": "₅", "6": "₆", "7": "₇", "8": "₈", "9": "₉",
  };
  return `${n}`.split("").map((d) => sub[d] ?? d).join("");
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
