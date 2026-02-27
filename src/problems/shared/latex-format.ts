/* ================================================================
   Higher-level LaTeX formatting utilities
   ================================================================ */

import { gcd } from "./math-utils";

/**
 * Simplify √n into outer√inner where outer² divides n.
 * e.g. simplifyRoot(12) → [2, 3] meaning 2√3
 */
export const simplifyRoot = (n: number): [outer: number, inner: number] => {
  let outer = 1;
  let inner = n;
  for (let d = 2; d * d <= inner; d++) {
    while (inner % (d * d) === 0) {
      outer *= d;
      inner /= d * d;
    }
  }
  return [outer, inner];
};

/**
 * Format √n as LaTeX, simplifying if possible.
 * e.g. 12 → "2\\sqrt{3}", 4 → "2", 3 → "\\sqrt{3}"
 */
export const formatRootLatex = (n: number): string => {
  const [outer, inner] = simplifyRoot(n);
  if (inner === 1) return `${outer}`;
  if (outer === 1) return `\\sqrt{${inner}}`;
  return `${outer}\\sqrt{${inner}}`;
};

/**
 * Format a reduced fraction as LaTeX.
 * Automatically reduces num/den by GCD.
 * Returns integer string if den divides num.
 */
export const formatFracLatex = (num: number, den: number): string => {
  if (den === 0) return "\\text{undefined}";
  const sign = (num < 0) !== (den < 0) ? "-" : "";
  const an = Math.abs(num);
  const ad = Math.abs(den);
  const g = gcd(an, ad);
  const rn = an / g;
  const rd = ad / g;
  if (rd === 1) return `${sign}${rn}`;
  return `${sign}\\frac{${rn}}{${rd}}`;
};

/**
 * Format complex number as LaTeX.
 * e.g. formatComplexLatex(3, 2) → "3 + 2i"
 */
export const formatComplexLatex = (re: number, im: number): string => {
  if (re === 0 && im === 0) return "0";
  const parts: string[] = [];
  if (re !== 0) parts.push(`${re}`);
  if (im !== 0) {
    const absIm = Math.abs(im);
    const imStr = absIm === 1 ? "i" : `${absIm}i`;
    if (parts.length === 0) {
      parts.push(im < 0 ? `-${imStr}` : imStr);
    } else {
      parts.push(im > 0 ? `+ ${imStr}` : `- ${imStr}`);
    }
  }
  return parts.join(" ");
};

/** Permutation: nPr = n! / (n-r)! */
export const nPr = (n: number, r: number): number => {
  let result = 1;
  for (let i = 0; i < r; i++) result *= n - i;
  return result;
};

/** Combination: nCr = n! / (r! * (n-r)!) */
export const nCr = (n: number, r: number): number => {
  if (r > n) return 0;
  if (r === 0 || r === n) return 1;
  // Use smaller r for efficiency
  const k = Math.min(r, n - r);
  let result = 1;
  for (let i = 0; i < k; i++) {
    result = result * (n - i) / (i + 1);
  }
  return Math.round(result);
};

/** Factorial */
export const factorial = (n: number): number => {
  let r = 1;
  for (let i = 2; i <= n; i++) r *= i;
  return r;
};
