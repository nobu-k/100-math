import { mulberry32 } from "../random";

export type SeqLimitMode = "rational" | "geometric" | "series" | "mixed";

export interface SeqLimitProblem {
  expr: string;
  answerExpr: string;
}

export const generateSeqLimit = (
  seed: number,
  mode: SeqLimitMode = "mixed",
  count = 10,
): SeqLimitProblem[] => {
  const rng = mulberry32(seed);
  const problems: SeqLimitProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: SeqLimitProblem | null = null;
      if (pick === "rational") result = generateRational(rng);
      else if (pick === "geometric") result = generateGeometric(rng);
      else result = generateSeries(rng);

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

const pickMode = (rng: () => number, mode: SeqLimitMode): "rational" | "geometric" | "series" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "rational";
  if (r < 0.7) return "geometric";
  return "series";
};

const generateRational = (rng: () => number): SeqLimitProblem | null => {
  // lim(n→∞) (an² + bn + c)/(dn² + en + f) = a/d
  const a = Math.floor(rng() * 5) + 1; // [1..5]
  const b = Math.floor(rng() * 7) - 3;
  const c = Math.floor(rng() * 7) - 3;
  const d = Math.floor(rng() * 5) + 1;
  const e = Math.floor(rng() * 7) - 3;
  const f = Math.floor(rng() * 7) - 3;

  const numStr = formatPolyN(a, b, c);
  const denStr = formatPolyN(d, e, f);

  const g = gcd(a, d);
  const ansNum = a / g;
  const ansDen = d / g;
  const ansStr = ansDen === 1 ? `${ansNum}` : `${ansNum}/${ansDen}`;

  const expr = `lim[n→∞] (${numStr})/(${denStr})`;
  const answerExpr = ansStr;
  return { expr, answerExpr };
};

const generateGeometric = (rng: () => number): SeqLimitProblem | null => {
  // lim r^n: converges if |r| < 1, diverges if |r| > 1
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // |r| < 1 → 0
    const numR = Math.floor(rng() * 3) + 1; // [1..3]
    const denR = numR + Math.floor(rng() * 3) + 1; // larger than numR
    const sign = rng() < 0.3 ? "−" : "";
    const expr = `lim[n→∞] (${sign}${numR}/${denR})ⁿ`;
    const answerExpr = "0";
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // r = 1 → 1
    const expr = "lim[n→∞] 1ⁿ";
    const answerExpr = "1";
    return { expr, answerExpr };
  }

  // |r| > 1 → diverges
  const r = Math.floor(rng() * 3) + 2; // [2..4]
  const expr = `lim[n→∞] ${r}ⁿ`;
  const answerExpr = "∞（発散）";
  return { expr, answerExpr };
};

const generateSeries = (rng: () => number): SeqLimitProblem | null => {
  const variant = Math.floor(rng() * 2);

  if (variant === 0) {
    // Infinite geometric series: a/(1-r) where |r| < 1
    const a = Math.floor(rng() * 5) + 1; // [1..5]
    const numR = Math.floor(rng() * 3) + 1; // [1..3]
    const denR = numR + Math.floor(rng() * 4) + 1;
    // Sum = a / (1 - numR/denR) = a·denR / (denR - numR)
    const sumNum = a * denR;
    const sumDen = denR - numR;
    const g = gcd(sumNum, sumDen);

    const rStr = numR === 1 ? `1/${denR}` : `${numR}/${denR}`;
    const sumStr = sumDen / g === 1 ? `${sumNum / g}` : `${sumNum / g}/${sumDen / g}`;

    const expr = `Σ[n=0→∞] ${a} × (${rStr})ⁿ`;
    const answerExpr = `${a}/(1 − ${rStr}) = ${sumStr}`;
    return { expr, answerExpr };
  }

  // Repeating decimal to fraction
  const repeating = Math.floor(rng() * 8) + 1; // [1..8] as single digit
  // 0.rrr... = r/9
  const expr = `0.${repeating}${repeating}${repeating}… を分数で表せ`;
  const g = gcd(repeating, 9);
  const answerExpr = `${repeating / g}/${9 / g}`;
  return { expr, answerExpr };
};

const formatPolyN = (a: number, b: number, c: number): string => {
  const parts: string[] = [];
  if (a === 1) parts.push("n²");
  else parts.push(`${a}n²`);
  if (b !== 0) {
    if (b === 1) parts.push("+ n");
    else if (b === -1) parts.push("− n");
    else if (b > 0) parts.push(`+ ${b}n`);
    else parts.push(`− ${Math.abs(b)}n`);
  }
  if (c !== 0) {
    if (c > 0) parts.push(`+ ${c}`);
    else parts.push(`− ${Math.abs(c)}`);
  }
  return parts.join(" ");
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
