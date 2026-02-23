/**
 * Convert generator Unicode math text to LaTeX.
 *
 * Handles patterns produced by the problem generators:
 *   √N, a√N, ², ³, ×, ÷, ±, π, −, |x|, a/√b, (…)/d
 */
export const unicodeToLatex = (text: string): string => {
  let s = text;

  // Parenthesised fraction: (…)/digits at end — e.g. "(3 ± √5)/4"
  s = s.replace(/\(([^)]+)\)\/(\d+)/g, (_, num, den) =>
    `\\frac{${unicodeToLatex(num)}}{${den}}`);

  // Rationalize fraction: coeff√base/den  — e.g. "2√3/3" or "√5/5"
  s = s.replace(/(\d*)√(\d+)\/(\d+)/g, (_, coeff, base, den) =>
    `\\frac{${coeff ? coeff : ""}\\sqrt{${base}}}{${den}}`);

  // Simple numeric fraction: digits/√digits — e.g. "3/√5"
  s = s.replace(/(\d+)\/√(\d+)/g, (_, num, base) =>
    `\\frac{${num}}{\\sqrt{${base}}}`);

  // Square root with coefficient: digit(s)√digit(s) — e.g. "3√5"
  s = s.replace(/(\d+)√(\d+)/g, (_, coeff, n) => `${coeff}\\sqrt{${n}}`);

  // Bare square root: √digit(s) — e.g. "√12"
  s = s.replace(/√(\d+)/g, (_, n) => `\\sqrt{${n}}`);

  // Superscripts
  s = s.replace(/²/g, "^{2}");
  s = s.replace(/³/g, "^{3}");

  // Operators and symbols
  s = s.replace(/×/g, "\\times ");
  s = s.replace(/÷/g, "\\div ");
  s = s.replace(/±/g, "\\pm ");
  s = s.replace(/π/g, "\\pi ");
  s = s.replace(/°/g, "^{\\circ}");

  // Minus sign (U+2212) → LaTeX hyphen-minus
  s = s.replace(/−/g, "-");

  // Fullwidth plus (U+FF0B) → normal plus
  s = s.replace(/＋/g, "+");

  // Absolute value bars: |expr|
  s = s.replace(/\|([^|]+)\|/g, (_, inner) => `\\lvert ${inner} \\rvert`);

  return s;
};

/**
 * Convert our LaTeX back to Unicode plain text for clipboard.
 */
export const latexToText = (latex: string): string => {
  let s = latex;

  // \phantom{...} → □
  s = s.replace(/\\phantom\{([^}]*)\}/g, "□");

  // \boxed{...} → content
  s = s.replace(/\\boxed\{([^}]*)\}/g, "$1");

  // \text{...} → content
  s = s.replace(/\\text\{([^}]*)\}/g, "$1");

  // \frac{a}{b} → a/b
  s = s.replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, (_, num, den) =>
    `${latexToText(num)}/${latexToText(den)}`);

  // \sqrt{N} → √N
  s = s.replace(/\\sqrt\{([^}]*)\}/g, "√$1");

  // ^{\circ} → °
  s = s.replace(/\^\{\\circ\}/g, "°");

  // ^{2} → ², ^{3} → ³
  s = s.replace(/\^\{2\}/g, "²");
  s = s.replace(/\^\{3\}/g, "³");

  // Operators
  s = s.replace(/\\times\s?/g, "×");
  s = s.replace(/\\div\s?/g, "÷");
  s = s.replace(/\\pm\s?/g, "±");
  s = s.replace(/\\pi\s?/g, "π");
  s = s.replace(/\\lvert\s?/g, "|");
  s = s.replace(/\\rvert\s?/g, "|");

  // Explicit space
  s = s.replace(/\\ /g, " ");
  // \, thin space
  s = s.replace(/\\,/g, " ");

  // Strip remaining braces and backslashes
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\\/g, "");

  // Collapse multiple spaces
  s = s.replace(/\s{2,}/g, " ");

  return s.trim();
};
