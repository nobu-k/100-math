import { mulberry32 } from "../random";

export type ExpansionMode = "distribute" | "formula" | "mixed";

export interface ExpansionProblem {
  expr: string;
  answerExpr: string;
}

export const generateExpansion = (
  seed: number,
  mode: ExpansionMode = "mixed",
  count = 12,
): ExpansionProblem[] => {
  const rng = mulberry32(seed);
  const problems: ExpansionProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick =
        mode === "mixed"
          ? rng() < 0.35 ? "distribute" : "formula"
          : mode;

      let expr: string;
      let answerExpr: string;

      if (pick === "distribute") {
        // monomial × binomial: a(bx + c) or (ax + b)(cx + d)
        const variant = rng();
        if (variant < 0.4) {
          // a(bx + c)
          const a = Math.floor(rng() * 9) - 4;
          if (a === 0) continue;
          const b = Math.floor(rng() * 7) - 3;
          if (b === 0) continue;
          const c = Math.floor(rng() * 11) - 5;
          const inner = fmtBinomial(b, c);
          expr = `${a}(${inner})`;
          answerExpr = formatQuadratic(0, a * b, a * c);
        } else {
          // (ax + b)(cx + d) general FOIL
          const a = Math.floor(rng() * 5) + 1; // 1-5
          const b = Math.floor(rng() * 11) - 5;
          let c = Math.floor(rng() * 5) + 1;
          const d = Math.floor(rng() * 11) - 5;
          if (rng() < 0.3) c = -c;
          const inner1 = fmtBinomial(a, b);
          const inner2 = fmtBinomial(c, d);
          expr = `(${inner1})(${inner2})`;
          // (ax+b)(cx+d) = acx² + (ad+bc)x + bd
          answerExpr = formatQuadratic(a * c, a * d + b * c, b * d);
        }
      } else {
        // Formulas
        const formulaType = Math.floor(rng() * 4);
        if (formulaType === 0) {
          // (x + a)² = x² + 2ax + a²
          const a = Math.floor(rng() * 9) + 1; // 1-9
          expr = `(x + ${a})²`;
          answerExpr = formatQuadratic(1, 2 * a, a * a);
        } else if (formulaType === 1) {
          // (x - a)² = x² - 2ax + a²
          const a = Math.floor(rng() * 9) + 1;
          expr = `(x − ${a})²`;
          answerExpr = formatQuadratic(1, -2 * a, a * a);
        } else if (formulaType === 2) {
          // (x + a)(x - a) = x² - a²
          const a = Math.floor(rng() * 9) + 1;
          expr = `(x + ${a})(x − ${a})`;
          answerExpr = formatQuadratic(1, 0, -(a * a));
        } else {
          // (x + a)(x + b) = x² + (a+b)x + ab
          let a = Math.floor(rng() * 17) - 8; // -8 to 8
          let b = Math.floor(rng() * 17) - 8;
          if (a === 0) a = 1;
          if (b === 0) b = -1;
          const inner1 = a >= 0 ? `x + ${a}` : `x − ${Math.abs(a)}`;
          const inner2 = b >= 0 ? `x + ${b}` : `x − ${Math.abs(b)}`;
          expr = `(${inner1})(${inner2})`;
          answerExpr = formatQuadratic(1, a + b, a * b);
        }
      }

      const key = expr;
      if (!seen.has(key) || attempt === 39) {
        seen.add(key);
        problems.push({ expr, answerExpr });
        break;
      }
    }
  }
  return problems;
};

const formatQuadratic = (a: number, b: number, c: number, varName: string = "x"): string => {
  const parts: string[] = [];
  if (a !== 0) {
    if (a === 1) parts.push(`${varName}²`);
    else if (a === -1) parts.push(`−${varName}²`);
    else parts.push(`${a}${varName}²`);
  }
  if (b !== 0) {
    if (parts.length === 0) {
      if (b === 1) parts.push(varName);
      else if (b === -1) parts.push(`−${varName}`);
      else parts.push(`${b}${varName}`);
    } else {
      if (b === 1) parts.push(`+ ${varName}`);
      else if (b === -1) parts.push(`− ${varName}`);
      else if (b > 0) parts.push(`+ ${b}${varName}`);
      else parts.push(`− ${Math.abs(b)}${varName}`);
    }
  }
  if (c !== 0) {
    if (parts.length === 0) {
      parts.push(`${c}`);
    } else if (c > 0) {
      parts.push(`+ ${c}`);
    } else {
      parts.push(`− ${Math.abs(c)}`);
    }
  }
  if (parts.length === 0) return "0";
  return parts.join(" ");
};

const fmtBinomial = (coeff: number, constant: number): string => {
  const parts: string[] = [];
  if (coeff === 1) parts.push("x");
  else if (coeff === -1) parts.push("−x");
  else parts.push(`${coeff}x`);

  if (constant > 0) parts.push(`+ ${constant}`);
  else if (constant < 0) parts.push(`− ${Math.abs(constant)}`);
  return parts.join(" ");
};
