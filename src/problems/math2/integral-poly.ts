import { mulberry32 } from "../random";
import { type Poly, polyInteg, polyEval, formatPoly } from "../shared/poly-utils";

export type IntegralPolyMode = "indefinite" | "definite" | "area" | "mixed";

export interface IntegralPolyProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateIntegralPoly = (
  seed: number,
  mode: IntegralPolyMode = "mixed",
  count = 10,
): IntegralPolyProblem[] => {
  const rng = mulberry32(seed);
  const problems: IntegralPolyProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: IntegralPolyProblem | null = null;
      if (pick === "indefinite") result = generateIndefinite(rng);
      else if (pick === "definite") result = generateDefinite(rng);
      else result = generateArea(rng);

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

const pickMode = (rng: () => number, mode: IntegralPolyMode): "indefinite" | "definite" | "area" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "indefinite";
  if (r < 0.7) return "definite";
  return "area";
};

const generateIndefinite = (rng: () => number): IntegralPolyProblem | null => {
  // ∫(ax² + bx + c)dx
  const deg = Math.floor(rng() * 2) + 1; // degree 1 or 2
  const coeffs: Poly = [];
  for (let i = 0; i <= deg; i++) {
    let c = Math.floor(rng() * 9) - 4; // [-4..4]
    if (i === deg && c === 0) c = 1;
    coeffs.push(c);
  }

  const antideriv = polyInteg(coeffs);

  // Check all coefficients are nice integers or simple fractions
  const hasNonInteger = antideriv.some((c) => !Number.isInteger(c) && c !== 0);

  const expr = `∫(${formatPoly(coeffs)})dx`;

  if (hasNonInteger) {
    // Format with fractions
    const parts: string[] = [];
    for (let i = antideriv.length - 1; i >= 0; i--) {
      if (antideriv[i] === 0) continue;
      const c = coeffs[i - 1]; // original coefficient
      if (c === undefined) continue;
      const den = i;
      if (Number.isInteger(antideriv[i])) {
        appendTermStr(parts, antideriv[i], powerStr(i));
      } else {
        // Show as fraction
        const num = c;
        const isFirst = parts.length === 0;
        const sign = num > 0 ? (isFirst ? "" : "+ ") : (isFirst ? "−" : "− ");
        const absNum = Math.abs(num);
        const numStr = `${absNum === 1 && den > 0 ? "" : absNum}${powerStr(i)}`;
        parts.push(`${sign}(${numStr})/${den}`);
      }
    }
    const answerExpr = `${parts.join(" ")} + C`;
    return { expr, answerExpr };
  }

  // All integer coefficients
  const resultParts: string[] = [];
  for (let i = antideriv.length - 1; i >= 1; i--) {
    appendTermStr(resultParts, antideriv[i], powerStr(i));
  }
  const answerExpr = `${resultParts.join(" ")} + C`;
  return { expr, answerExpr };
};

const generateDefinite = (rng: () => number): IntegralPolyProblem | null => {
  // ∫_a^b f(x)dx with integer result
  const deg = Math.floor(rng() * 2) + 1; // degree 1 or 2
  const coeffs: Poly = [];
  for (let i = 0; i <= deg; i++) {
    let c = Math.floor(rng() * 7) - 3; // [-3..3]
    if (i === deg && c === 0) c = 1;
    coeffs.push(c);
  }

  const a = Math.floor(rng() * 3) - 1; // [-1..1]
  const b = a + Math.floor(rng() * 3) + 1; // a+[1..3]

  const antideriv = polyInteg(coeffs);
  const result = polyEval(antideriv, b) - polyEval(antideriv, a);

  // Only accept if result is a nice number
  if (!Number.isFinite(result)) return null;

  // Round to avoid floating point issues
  const rounded = Math.round(result * 6) / 6;
  const isNice = Number.isInteger(rounded) || Number.isInteger(rounded * 2) || Number.isInteger(rounded * 3) || Number.isInteger(rounded * 6);
  if (!isNice) return null;

  const aStr = a < 0 ? `−${Math.abs(a)}` : `${a}`;
  const bStr = b < 0 ? `−${Math.abs(b)}` : `${b}`;

  const expr = `∫[${aStr}→${bStr}](${formatPoly(coeffs)})dx`;

  // Format answer as fraction if needed
  let answerExpr: string;
  if (Number.isInteger(result)) {
    answerExpr = result < 0 ? `−${Math.abs(result)}` : `${result}`;
  } else {
    // Find nice fraction representation
    for (const d of [2, 3, 6]) {
      const n = Math.round(result * d);
      if (Math.abs(n / d - result) < 0.0001) {
        const g = gcd(Math.abs(n), d);
        const sign = n < 0 ? "−" : "";
        answerExpr = `${sign}${Math.abs(n) / g}/${d / g}`;
        return { expr, answerExpr };
      }
    }
    answerExpr = `${Math.round(result * 100) / 100}`;
  }

  return { expr, answerExpr };
};

const generateArea = (rng: () => number): IntegralPolyProblem | null => {
  // Area between y = (x - r1)(x - r2) and x-axis
  let r1 = Math.floor(rng() * 5) - 2; // [-2..2]
  let r2 = Math.floor(rng() * 5) - 2;
  if (r1 === r2) r2 = r1 + 2;
  if (r1 > r2) [r1, r2] = [r2, r1];

  // y = x² - (r1+r2)x + r1·r2
  const coeffs: Poly = [r1 * r2, -(r1 + r2), 1];

  const antideriv = polyInteg(coeffs);
  const integral = polyEval(antideriv, r2) - polyEval(antideriv, r1);
  const area = Math.abs(integral);

  const isNL = true;
  const expr = `y = ${formatPoly(coeffs)} と x 軸で囲まれた面積`;

  let answerExpr: string;
  if (Number.isInteger(area)) {
    answerExpr = `${area}`;
  } else {
    for (const d of [2, 3, 6]) {
      const n = Math.round(area * d);
      if (Math.abs(n / d - area) < 0.0001) {
        const g = gcd(n, d);
        answerExpr = `${n / g}/${d / g}`;
        return { expr, answerExpr, isNL };
      }
    }
    answerExpr = `${Math.round(area * 100) / 100}`;
  }

  return { expr, answerExpr, isNL };
};

const appendTermStr = (parts: string[], coeff: number, v: string) => {
  if (coeff === 0) return;
  const isFirst = parts.length === 0;
  const abs = Math.abs(coeff);
  if (v === "") {
    parts.push(isFirst ? `${coeff}` : (coeff > 0 ? `+ ${abs}` : `− ${abs}`));
  } else {
    const c = abs === 1 ? "" : `${abs}`;
    if (isFirst) {
      parts.push(coeff < 0 ? `−${c}${v}` : `${c}${v}`);
    } else {
      parts.push(coeff > 0 ? `+ ${c}${v}` : `− ${c}${v}`);
    }
  }
};

const powerStr = (n: number): string => {
  if (n === 0) return "";
  if (n === 1) return "x";
  const sup: Record<number, string> = { 2: "²", 3: "³", 4: "⁴" };
  return `x${sup[n] ?? `^${n}`}`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
