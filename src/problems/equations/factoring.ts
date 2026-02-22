import { mulberry32 } from "../random";

export type FactoringMode = "common" | "formula" | "mixed";

export interface FactoringProblem {
  /** The expanded expression to factor */
  expr: string;
  /** The factored form */
  answerExpr: string;
}

export const generateFactoring = (
  seed: number,
  mode: FactoringMode = "mixed",
): FactoringProblem[] => {
  const rng = mulberry32(seed);
  const problems: FactoringProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = mode === "mixed"
        ? rng() < 0.25 ? "common" : "formula"
        : mode;

      let expr: string;
      let answerExpr: string;

      if (pick === "common") {
        // Common factor: qa*x² + qb*x = x(qa*x + qb)
        // Consume rng to keep deterministic
        rng(); rng(); rng();
        const qa = Math.floor(rng() * 5) + 1;
        const qb = Math.floor(rng() * 9) - 4;
        if (qb === 0) continue;
        // qa*x² + qb*x = x(qa*x + qb)
        expr = formatQuadratic(qa, qb, 0);
        if (qa === 1 && qb === 1) {
          answerExpr = "x(x + 1)";
        } else {
          const inner = qa === 1 ? "x" : `${qa}x`;
          const sign = qb > 0 ? "+" : "−";
          answerExpr = `x(${inner} ${sign} ${Math.abs(qb)})`;
        }
      } else {
        // Formula-based factoring
        const formulaType = Math.floor(rng() * 4);

        if (formulaType === 0) {
          // x² + 2ax + a² = (x + a)²
          const a = Math.floor(rng() * 9) + 1; // 1-9
          expr = formatQuadratic(1, 2 * a, a * a);
          answerExpr = `(x + ${a})²`;
        } else if (formulaType === 1) {
          // x² - 2ax + a² = (x - a)²
          const a = Math.floor(rng() * 9) + 1;
          expr = formatQuadratic(1, -2 * a, a * a);
          answerExpr = `(x − ${a})²`;
        } else if (formulaType === 2) {
          // x² - a² = (x + a)(x - a)
          const a = Math.floor(rng() * 12) + 1; // 1-12
          expr = formatQuadratic(1, 0, -(a * a));
          answerExpr = `(x + ${a})(x − ${a})`;
        } else {
          // x² + (a+b)x + ab = (x + a)(x + b)
          let a = Math.floor(rng() * 17) - 8;
          let b = Math.floor(rng() * 17) - 8;
          if (a === 0) a = 1;
          if (b === 0) b = -1;
          // Ensure a and b are different from perfect square cases
          if (a === b && a > 0) continue; // that's (x+a)², handled above
          expr = formatQuadratic(1, a + b, a * b);
          answerExpr = `(${fmtFactor(a)})(${fmtFactor(b)})`;
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

const formatQuadratic = (a: number, b: number, c: number): string => {
  const parts: string[] = [];
  if (a !== 0) {
    if (a === 1) parts.push("x²");
    else if (a === -1) parts.push("−x²");
    else parts.push(`${a}x²`);
  }
  if (b !== 0) {
    if (parts.length === 0) {
      if (b === 1) parts.push("x");
      else if (b === -1) parts.push("−x");
      else parts.push(`${b}x`);
    } else {
      if (b === 1) parts.push("+ x");
      else if (b === -1) parts.push("− x");
      else if (b > 0) parts.push(`+ ${b}x`);
      else parts.push(`− ${Math.abs(b)}x`);
    }
  }
  if (c !== 0) {
    if (parts.length === 0) parts.push(`${c}`);
    else if (c > 0) parts.push(`+ ${c}`);
    else parts.push(`− ${Math.abs(c)}`);
  }
  if (parts.length === 0) return "0";
  return parts.join(" ");
};

const fmtFactor = (a: number): string => {
  if (a >= 0) return `x + ${a}`;
  return `x − ${Math.abs(a)}`;
};
