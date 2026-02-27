/* ================================================================
   Polynomial arithmetic utilities
   Poly = number[] where coeffs[i] is the coefficient of x^i
   e.g. [1, 2, 3] = 1 + 2x + 3x²
   ================================================================ */

export type Poly = number[];

export const polyAdd = (a: Poly, b: Poly): Poly => {
  const len = Math.max(a.length, b.length);
  const r: Poly = [];
  for (let i = 0; i < len; i++) r.push((a[i] ?? 0) + (b[i] ?? 0));
  return polyTrim(r);
};

export const polySub = (a: Poly, b: Poly): Poly => {
  const len = Math.max(a.length, b.length);
  const r: Poly = [];
  for (let i = 0; i < len; i++) r.push((a[i] ?? 0) - (b[i] ?? 0));
  return polyTrim(r);
};

export const polyMul = (a: Poly, b: Poly): Poly => {
  if (a.length === 0 || b.length === 0) return [0];
  const r: Poly = new Array(a.length + b.length - 1).fill(0);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < b.length; j++)
      r[i + j] += a[i] * b[j];
  return polyTrim(r);
};

export const polyScale = (p: Poly, k: number): Poly =>
  polyTrim(p.map((c) => c * k));

export const polyDeriv = (p: Poly): Poly => {
  if (p.length <= 1) return [0];
  const r: Poly = [];
  for (let i = 1; i < p.length; i++) r.push(p[i] * i);
  return polyTrim(r);
};

export const polyInteg = (p: Poly): Poly => {
  const r: Poly = [0]; // +C represented as 0 constant
  for (let i = 0; i < p.length; i++) r.push(p[i] / (i + 1));
  return r;
};

export const polyEval = (p: Poly, x: number): number => {
  let result = 0;
  let power = 1;
  for (let i = 0; i < p.length; i++) {
    result += p[i] * power;
    power *= x;
  }
  return result;
};

export const polyDeg = (p: Poly): number => {
  for (let i = p.length - 1; i >= 0; i--)
    if (p[i] !== 0) return i;
  return 0;
};

/**
 * Format polynomial as unicode string.
 * Coefficients are in ascending order: [c0, c1, c2, ...] = c0 + c1*x + c2*x² + ...
 * Output uses descending order (highest degree first) for standard math display.
 */
export const formatPoly = (coeffs: Poly, varName = "x"): string => {
  const deg = polyDeg(coeffs);
  const parts: string[] = [];

  for (let i = deg; i >= 0; i--) {
    const c = coeffs[i];
    if (c === 0) continue;

    const isFirst = parts.length === 0;
    const abs = Math.abs(c);
    const sign = c > 0 ? (isFirst ? "" : "+ ") : (isFirst ? "−" : "− ");

    if (i === 0) {
      parts.push(`${sign}${isFirst && c > 0 ? c : abs}`);
    } else {
      const v = i === 1 ? varName : `${varName}${superscript(i)}`;
      if (abs === 1) {
        parts.push(`${sign}${v}`);
      } else {
        parts.push(`${sign}${abs}${v}`);
      }
    }
  }

  return parts.length === 0 ? "0" : parts.join(" ");
};

const superscript = (n: number): string => {
  if (n === 2) return "²";
  if (n === 3) return "³";
  if (n === 4) return "⁴";
  if (n === 5) return "⁵";
  return `^${n}`;
};

const polyTrim = (p: Poly): Poly => {
  const r = [...p];
  while (r.length > 1 && r[r.length - 1] === 0) r.pop();
  return r;
};
