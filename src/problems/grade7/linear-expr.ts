import { mulberry32 } from "../random";

export type LinearExprMode = "add-sub" | "mul-div" | "mixed";

export interface LinearExprProblem {
  /** Display expression, e.g. "3x + 2 + 5x − 7" */
  expr: string;
  /** Answer coefficient of x */
  answerCoeff: number;
  /** Answer constant term */
  answerConst: number;
  /** Formatted answer string, e.g. "8x − 5" */
  answerExpr: string;
}

export const generateLinearExpr = (
  seed: number,
  mode: LinearExprMode = "mixed",
): LinearExprProblem[] => {
  const rng = mulberry32(seed);
  const problems: LinearExprProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      let expr: string;
      let ansCoeff: number;
      let ansConst: number;

      const pick =
        mode === "mixed"
          ? rng() < 0.4
            ? "add-sub"
            : rng() < 0.7
              ? "mul-div"
              : "bracket"
          : mode;

      if (pick === "add-sub") {
        // (ax + b) + (cx + d) or (ax + b) − (cx + d)
        const a = Math.floor(rng() * 13) - 6;
        const b = Math.floor(rng() * 13) - 6;
        const c = Math.floor(rng() * 13) - 6;
        const d = Math.floor(rng() * 13) - 6;
        if (a === 0 && c === 0) continue;
        const isSub = rng() < 0.5;
        if (isSub) {
          ansCoeff = a - c;
          ansConst = b - d;
          expr = `(${formatLinear(a, b)}) − (${formatLinear(c, d)})`;
        } else {
          ansCoeff = a + c;
          ansConst = b + d;
          expr = `(${formatLinear(a, b)}) + (${formatLinear(c, d)})`;
        }
      } else if (pick === "mul-div") {
        // n(ax + b) or (ax + b) ÷ n
        const a = Math.floor(rng() * 7) - 3;
        const b = Math.floor(rng() * 7) - 3;
        if (a === 0) continue;
        const isMul = rng() < 0.6;
        if (isMul) {
          const n = Math.floor(rng() * 7) - 3;
          if (n === 0) continue;
          ansCoeff = n * a;
          ansConst = n * b;
          expr = `${n}(${formatLinear(a, b)})`;
        } else {
          const n = Math.floor(rng() * 4) + 2; // 2-5
          // Make sure a and b are divisible by n
          const realA = a * n;
          const realB = b * n;
          ansCoeff = a;
          ansConst = b;
          expr = `(${formatLinear(realA, realB)}) ÷ ${n}`;
        }
      } else {
        // bracket: mix like ax + b + cx − d (no brackets, just combine terms)
        const a = Math.floor(rng() * 9) - 4;
        const b = Math.floor(rng() * 11) - 5;
        const c = Math.floor(rng() * 9) - 4;
        const d = Math.floor(rng() * 11) - 5;
        if (a === 0 && c === 0) continue;
        ansCoeff = a + c;
        ansConst = b + d;
        // Build expression with interleaved terms
        const parts: string[] = [];
        if (a !== 0) parts.push(fmtTerm(a, parts.length === 0));
        if (b !== 0) parts.push(fmtConst(b, parts.length === 0));
        if (c !== 0) parts.push(fmtTerm(c, parts.length === 0));
        if (d !== 0) parts.push(fmtConst(d, parts.length === 0));
        if (parts.length === 0) continue;
        expr = parts.join(" ");
      }

      if (ansCoeff === 0 && ansConst === 0) continue;
      const answerExpr = formatLinear(ansCoeff, ansConst);
      const key = expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push({ expr, answerCoeff: ansCoeff, answerConst: ansConst, answerExpr });
        break;
      }
    }
  }
  return problems;
};

/* ---- helpers ---- */

const formatLinear = (coeff: number, constant: number): string => {
  let result = "";
  if (coeff === 0) {
    return `${constant}`;
  }
  if (coeff === 1) result = "x";
  else if (coeff === -1) result = "−x";
  else if (coeff < 0) result = `−${Math.abs(coeff)}x`;
  else result = `${coeff}x`;

  if (constant === 0) return result;
  if (constant > 0) return `${result} + ${constant}`;
  return `${result} − ${Math.abs(constant)}`;
};

const fmtTerm = (coeff: number, isFirst: boolean): string => {
  if (isFirst) {
    if (coeff === 1) return "x";
    if (coeff === -1) return "−x";
    return `${coeff}x`;
  }
  if (coeff === 1) return "+ x";
  if (coeff === -1) return "− x";
  if (coeff > 0) return `+ ${coeff}x`;
  return `− ${Math.abs(coeff)}x`;
};

const fmtConst = (n: number, isFirst: boolean): string => {
  if (isFirst) return `${n}`;
  if (n > 0) return `+ ${n}`;
  return `− ${Math.abs(n)}`;
};
