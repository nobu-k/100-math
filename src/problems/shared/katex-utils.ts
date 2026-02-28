/**
 * Convert generator Unicode math text to LaTeX.
 *
 * Handles patterns produced by the problem generators:
 *   √N, a√N, ²³⁴⁵⁶⁷⁸⁹ⁿˣ, ₀₁₂…₉, ×÷±π°−, |x|,
 *   a/√b, (…)/d, (…)/(…), digit/digit,
 *   ∫, ∫[a→b], Σ[k=1→n], lim[n→∞],
 *   sin, cos, tan, ln, log, θ, α, β, ∞, a⃗, eˣ, ³√, dx
 */
export const unicodeToLatex = (text: string): string => {
  let s = text;

  // === Phase 1: Structured multi-character patterns ===

  // Definite integral: ∫[a→b] → \int_{a}^{b}
  s = s.replace(/∫\[([^\]→]+)→([^\]]+)\]/g, (_, a, b) =>
    `\\int_{${unicodeToLatex(a)}}^{${unicodeToLatex(b)}}`);

  // Sigma notation: Σ[k=1→n] → \sum\limits_{k=1}^{n}
  s = s.replace(/Σ\[(\w+=\d+)→([^\]]+)\]/g, (_, fromPart, to) => {
    const toTex = to === "∞" ? "\\infty" : to;
    return `\\sum\\limits_{${fromPart}}^{${toTex}}`;
  });

  // Limit notation: lim[n→∞] or lim(x→0) → \lim\limits_{n \to \infty}
  s = s.replace(/lim[\[(](\w+)→([^\])]*)[\])]/g, (_, v, to) => {
    const toTex = unicodeToLatex(to);
    return `\\lim\\limits_{${v} \\to ${toTex}}`;
  });

  // Bare integral sign
  s = s.replace(/∫/g, "\\int ");

  // === Phase 2: Caret-superscript grouping (before fractions) ===

  // ^(expr) → ^{expr}  (e.g. 8^(2/3) → 8^{2/3})
  s = s.replace(/\^\(([^)]+)\)/g, "^{$1}");

  // === Phase 3: Fraction patterns ===

  // Specific patterns (before general fraction rules)
  s = s.replace(/1\/cos²x/g, "\\frac{1}{\\cos^{2}x}");
  s = s.replace(/1\/x²/g, "\\frac{1}{x^{2}}");
  s = s.replace(/1\/√x/g, "\\frac{1}{\\sqrt{x}}");
  s = s.replace(/1\/x(?![²³⁴⁵⁶⁷⁸⁹\w])/g, "\\frac{1}{x}");

  // Parenthesized fraction with exponent: (a/b)ⁿ → \left(\frac{a}{b}\right)ⁿ
  s = s.replace(/\((−?\d+)\/(\d+)\)(?=[⁰¹²³⁴⁵⁶⁷⁸⁹ⁿˣ^])/g, "\\left(\\frac{$1}{$2}\\right)");

  // Parenthesized simple fraction: (a/b) → \frac{a}{b}  (cosmetic grouping)
  s = s.replace(/\((\d+)\/(\d+)\)/g, "\\frac{$1}{$2}");

  // Two-parenthesized fraction: (…)/(…)
  s = s.replace(/\(([^)]+)\)\/\(([^)]+)\)/g, (_, num, den) =>
    `\\frac{${unicodeToLatex(num)}}{${unicodeToLatex(den)}}`);

  // Parenthesised fraction: (…)/digits — e.g. "(3 ± √5)/4"
  s = s.replace(/\(([^)]+)\)\/(\d+)/g, (_, num, den) =>
    `\\frac{${unicodeToLatex(num)}}{${den}}`);

  // Rationalize fraction: coeff√base/den  — e.g. "2√3/3" or "√5/5"
  s = s.replace(/(\d*)√(\d+)\/(\d+)/g, (_, coeff, base, den) =>
    `\\frac{${coeff || ""}\\sqrt{${base}}}{${den}}`);

  // digit(s)/√digit(s) — e.g. "3/√5"
  s = s.replace(/(\d+)\/√(\d+)/g, (_, num, base) =>
    `\\frac{${num}}{\\sqrt{${base}}}`);

  // Simple numeric fraction: digit(s)/digit(s) — bounded by non-word chars
  s = s.replace(/(?<![.\w/])(\d+)\/(\d+)(?![.\w/])/g, "\\frac{$1}{$2}");

  // === Phase 4: Roots ===

  // Cube root: ³√digits
  s = s.replace(/³√(\d+)/g, (_, n) => `\\sqrt[3]{${n}}`);

  // Square root with coefficient: digit(s)√digit(s) — e.g. "3√5"
  s = s.replace(/(\d+)√(\d+)/g, (_, coeff, n) => `${coeff}\\sqrt{${n}}`);

  // Bare square root: √digit(s)
  s = s.replace(/√(\d+)/g, (_, n) => `\\sqrt{${n}}`);

  // √x
  s = s.replace(/√x/g, "\\sqrt{x}");

  // === Phase 5: Unicode subscripts → LaTeX ===

  s = s.replace(/[₀₁₂₃₄₅₆₇₈₉]+/g, (match) => {
    const digits = [...match].map(ch => {
      const i = "₀₁₂₃₄₅₆₇₈₉".indexOf(ch);
      return i >= 0 ? String(i) : ch;
    }).join("");
    return `_{${digits}}`;
  });

  // === Phase 6: Unicode superscripts → LaTeX ===

  s = s.replace(/⁰/g, "^{0}");
  s = s.replace(/¹/g, "^{1}");
  s = s.replace(/²/g, "^{2}");
  s = s.replace(/³/g, "^{3}");
  s = s.replace(/⁴/g, "^{4}");
  s = s.replace(/⁵/g, "^{5}");
  s = s.replace(/⁶/g, "^{6}");
  s = s.replace(/⁷/g, "^{7}");
  s = s.replace(/⁸/g, "^{8}");
  s = s.replace(/⁹/g, "^{9}");
  s = s.replace(/ⁿ/g, "^{n}");
  s = s.replace(/ˣ/g, "^{x}");

  // === Phase 7: Math functions ===

  s = s.replace(/(?<![a-zA-Z\\])(sin|cos|tan|ln|log|lim)(?![a-zA-Z])/g, "\\$1");

  // === Phase 8: Greek letters ===

  s = s.replace(/θ/g, "\\theta ");
  s = s.replace(/α/g, "\\alpha ");
  s = s.replace(/β/g, "\\beta ");

  // === Phase 9: Special symbols ===

  s = s.replace(/∞/g, "\\infty ");
  s = s.replace(/→/g, "\\to ");
  // Vector arrow: a⃗ → \vec{a}
  s = s.replace(/(.)⃗/gu, (_, ch) => `\\vec{${ch}}`);
  // Middle dot
  s = s.replace(/·/g, "\\cdot ");

  // === Phase 10: Operators and common symbols ===

  s = s.replace(/×/g, "\\times ");
  s = s.replace(/÷/g, "\\div ");
  s = s.replace(/±/g, "\\pm ");
  s = s.replace(/π/g, "\\pi ");
  s = s.replace(/°/g, "^{\\circ}");

  s = s.replace(/≥/g, "\\geq ");
  s = s.replace(/≤/g, "\\leq ");
  s = s.replace(/≠/g, "\\neq ");

  // Minus sign (U+2212) → LaTeX hyphen-minus
  s = s.replace(/−/g, "-");
  // Fullwidth plus (U+FF0B) → normal plus
  s = s.replace(/＋/g, "+");

  // Absolute value bars: |expr|
  s = s.replace(/\|([^|]+)\|/g, (_, inner) => `\\lvert ${inner} \\rvert`);

  // === Phase 11: dx for integrals ===

  s = s.replace(/\bdx\b/g, "\\,dx");

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

  // \textcolor{...}{content} → content
  s = s.replace(/\\textcolor\{[^}]*\}\{([^}]*)\}/g, "$1");

  // \dfrac{a}{b} or \frac{a}{b} → a/b
  s = s.replace(/\\d?frac\{([^}]*)\}\{([^}]*)\}/g, (_, num, den) =>
    `${latexToText(num)}/${latexToText(den)}`);

  // \sqrt[n]{N} → ⁿ√N
  s = s.replace(/\\sqrt\[3\]\{([^}]*)\}/g, "³√$1");
  // \sqrt{N} → √N
  s = s.replace(/\\sqrt\{([^}]*)\}/g, "√$1");

  // ^{\circ} → °
  s = s.replace(/\^\{\\circ\}/g, "°");

  // ^{2} → ², ^{3} → ³, ^{4} → ⁴, ^{5} → ⁵
  s = s.replace(/\^\{2\}/g, "²");
  s = s.replace(/\^\{3\}/g, "³");
  s = s.replace(/\^\{4\}/g, "⁴");
  s = s.replace(/\^\{5\}/g, "⁵");
  s = s.replace(/\^\{n\}/g, "ⁿ");
  s = s.replace(/\^\{x\}/g, "ˣ");

  // _{digits} → Unicode subscripts
  s = s.replace(/\\_\{(\d+)\}/g, (_, digits) =>
    [...digits].map((d: string) => "₀₁₂₃₄₅₆₇₈₉"[parseInt(d)] ?? d).join(""));

  // Math functions (just strip the backslash)
  s = s.replace(/\\(sin|cos|tan|ln|log|lim)\b/g, "$1");

  // Greek letters
  s = s.replace(/\\theta\s?/g, "θ");
  s = s.replace(/\\alpha\s?/g, "α");
  s = s.replace(/\\beta\s?/g, "β");
  s = s.replace(/\\infty\s?/g, "∞");
  s = s.replace(/\\to\s?/g, "→");
  s = s.replace(/\\vec\{([^}])\}/g, "$1⃗");
  s = s.replace(/\\cdot\s?/g, "·");

  // \int → ∫
  s = s.replace(/\\int\s?/g, "∫");
  // \sum → Σ
  s = s.replace(/\\sum/g, "Σ");

  // Operators
  s = s.replace(/\\times\s?/g, "×");
  s = s.replace(/\\div\s?/g, "÷");
  s = s.replace(/\\pm\s?/g, "±");
  s = s.replace(/\\pi\s?/g, "π");
  s = s.replace(/\\geq\s?/g, "≥");
  s = s.replace(/\\leq\s?/g, "≤");
  s = s.replace(/\\neq\s?/g, "≠");
  s = s.replace(/\\lvert\s?/g, "|");
  s = s.replace(/\\rvert\s?/g, "|");

  // \,dx → dx
  s = s.replace(/\\,/g, " ");
  // Explicit space
  s = s.replace(/\\ /g, " ");

  // Strip remaining braces and backslashes
  s = s.replace(/[{}]/g, "");
  s = s.replace(/\\/g, "");

  // Collapse multiple spaces
  s = s.replace(/\s{2,}/g, " ");

  return s.trim();
};
