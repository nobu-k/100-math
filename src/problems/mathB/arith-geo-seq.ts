import { mulberry32 } from "../random";

export type SeqMode = "arithmetic" | "geometric" | "sigma" | "mixed";

export interface SeqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateArithGeoSeq = (
  seed: number,
  mode: SeqMode = "mixed",
  count = 10,
): SeqProblem[] => {
  const rng = mulberry32(seed);
  const problems: SeqProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: SeqProblem | null = null;
      if (pick === "arithmetic") result = generateArithmetic(rng);
      else if (pick === "geometric") result = generateGeometric(rng);
      else result = generateSigma(rng);

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

const pickMode = (rng: () => number, mode: SeqMode): "arithmetic" | "geometric" | "sigma" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "arithmetic";
  if (r < 0.7) return "geometric";
  return "sigma";
};

const generateArithmetic = (rng: () => number): SeqProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // Find nth term: aₙ = a₁ + (n-1)d
    const a1 = Math.floor(rng() * 11) - 5; // [-5..5]
    const d = Math.floor(rng() * 9) - 4;   // [-4..4]
    if (d === 0) return null;
    const n = Math.floor(rng() * 8) + 5;   // [5..12]
    const an = a1 + (n - 1) * d;
    const expr = `初項 ${fmt(a1)}，公差 ${fmt(d)} の等差数列の第 ${n} 項`;
    const answerExpr = `a${subscript(n)} = ${fmt(a1)} + ${n - 1} × ${fmt(d)} = ${fmt(an)}`;
    return { expr, answerExpr, isNL: true };
  }

  if (variant === 1) {
    // Find sum: Sₙ = n(a₁+aₙ)/2
    const a1 = Math.floor(rng() * 7) - 3;
    const d = Math.floor(rng() * 5) + 1;
    const n = Math.floor(rng() * 6) + 5; // [5..10]
    const an = a1 + (n - 1) * d;
    const sn = n * (a1 + an) / 2;
    const expr = `初項 ${fmt(a1)}，公差 ${fmt(d)} の等差数列の初項から第 ${n} 項までの和`;
    const answerExpr = `S${subscript(n)} = ${n}(${fmt(a1)} + ${fmt(an)})/2 = ${fmt(sn)}`;
    return { expr, answerExpr, isNL: true };
  }

  // Find a₁ and d from two terms
  const a1 = Math.floor(rng() * 7) - 3;
  const d = Math.floor(rng() * 7) - 3;
  if (d === 0) return null;
  const n1 = Math.floor(rng() * 3) + 2; // [2..4]
  const n2 = n1 + Math.floor(rng() * 4) + 2; // n1+[2..5]
  const v1 = a1 + (n1 - 1) * d;
  const v2 = a1 + (n2 - 1) * d;
  const expr = `等差数列で a${subscript(n1)} = ${fmt(v1)}, a${subscript(n2)} = ${fmt(v2)} のとき，初項 a₁ と公差 d`;
  const answerExpr = `d = ${fmt(d)}, a₁ = ${fmt(a1)}`;
  return { expr, answerExpr, isNL: true };
};

const generateGeometric = (rng: () => number): SeqProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // Find nth term: aₙ = a₁ · r^(n-1)
    const a1 = Math.floor(rng() * 4) + 1; // [1..4]
    const rChoices = [2, 3, -2, -3, 1/2, 1/3];
    const r = rChoices[Math.floor(rng() * rChoices.length)];
    const n = Math.floor(rng() * 4) + 3; // [3..6]
    const an = a1 * Math.pow(r, n - 1);

    if (!Number.isFinite(an) || Math.abs(an) > 10000) return null;

    const rStr = Number.isInteger(r) ? fmt(r) : (r === 0.5 ? "1/2" : "1/3");
    const anStr = Number.isInteger(an) ? fmt(an) : formatFrac(an);

    const expr = `初項 ${a1}，公比 ${rStr} の等比数列の第 ${n} 項`;
    const answerExpr = `a${subscript(n)} = ${anStr}`;
    return { expr, answerExpr, isNL: true };
  }

  if (variant === 1) {
    // Sum of geometric series: Sₙ = a₁(1-rⁿ)/(1-r) for r≠1
    const a1 = Math.floor(rng() * 3) + 1;
    const r = [2, 3, -2][Math.floor(rng() * 3)];
    const n = Math.floor(rng() * 4) + 3; // [3..6]
    const rn = Math.pow(r, n);
    const sn = a1 * (1 - rn) / (1 - r);

    if (!Number.isInteger(sn) || Math.abs(sn) > 10000) return null;

    const expr = `初項 ${a1}，公比 ${fmt(r)} の等比数列の初項から第 ${n} 項までの和`;
    const answerExpr = `S${subscript(n)} = ${fmt(sn)}`;
    return { expr, answerExpr, isNL: true };
  }

  // Find a₁ and r from two terms
  const a1 = Math.floor(rng() * 3) + 1;
  const r = [2, 3, -2][Math.floor(rng() * 3)];
  const n2 = Math.floor(rng() * 3) + 3; // [3..5]
  const v1 = a1;
  const v2 = a1 * Math.pow(r, n2 - 1);

  if (Math.abs(v2) > 5000) return null;

  const expr = `等比数列で a₁ = ${fmt(v1)}, a${subscript(n2)} = ${fmt(v2)} のとき，公比 r`;
  const answerExpr = `r = ${fmt(r)}`;
  return { expr, answerExpr, isNL: true };
};

const generateSigma = (rng: () => number): SeqProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // Σk from 1 to n = n(n+1)/2
    const n = Math.floor(rng() * 15) + 5; // [5..19]
    const answer = n * (n + 1) / 2;
    const expr = `Σ[k=1→${n}] k`;
    const answerExpr = `${n}(${n} + 1)/2 = ${answer}`;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // Σk² from 1 to n = n(n+1)(2n+1)/6
    const n = Math.floor(rng() * 8) + 3; // [3..10]
    const answer = n * (n + 1) * (2 * n + 1) / 6;
    const expr = `Σ[k=1→${n}] k²`;
    const answerExpr = `${n}(${n} + 1)(${2 * n + 1})/6 = ${answer}`;
    return { expr, answerExpr };
  }

  // Σ(ak+b) from 1 to n
  const a = Math.floor(rng() * 5) + 1; // [1..5]
  const b = Math.floor(rng() * 9) - 4; // [-4..4]
  const n = Math.floor(rng() * 8) + 3; // [3..10]
  const answer = a * n * (n + 1) / 2 + b * n;

  const bStr = b === 0 ? "" : (b > 0 ? ` + ${b}` : ` − ${Math.abs(b)}`);
  const expr = `Σ[k=1→${n}] (${a}k${bStr})`;
  const answerExpr = `${answer}`;
  return { expr, answerExpr };
};

const fmt = (n: number): string => n < 0 ? `−${Math.abs(n)}` : `${n}`;

const formatFrac = (n: number): string => {
  // Handle simple fractions like 1/2, 1/4, etc.
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
