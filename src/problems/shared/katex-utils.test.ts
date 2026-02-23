import { describe, it, expect } from "vitest";
import { unicodeToLatex, latexToText } from "./katex-utils";

describe("unicodeToLatex", () => {
  it("converts bare square root", () => {
    expect(unicodeToLatex("√12")).toBe("\\sqrt{12}");
  });

  it("converts coefficient + square root", () => {
    expect(unicodeToLatex("3√5")).toBe("3\\sqrt{5}");
  });

  it("converts superscripts", () => {
    expect(unicodeToLatex("x²")).toBe("x^{2}");
    expect(unicodeToLatex("x³")).toBe("x^{3}");
    expect(unicodeToLatex("(x + 3)²")).toBe("(x + 3)^{2}");
  });

  it("converts operators", () => {
    expect(unicodeToLatex("3 × 4")).toBe("3 \\times  4");
    expect(unicodeToLatex("12 ÷ 3")).toBe("12 \\div  3");
    expect(unicodeToLatex("±5")).toBe("\\pm 5");
  });

  it("converts pi and degree", () => {
    expect(unicodeToLatex("3π")).toBe("3\\pi ");
    expect(unicodeToLatex("90°")).toBe("90^{\\circ}");
  });

  it("converts minus sign (U+2212)", () => {
    expect(unicodeToLatex("5 − 3")).toBe("5 - 3");
  });

  it("converts fullwidth plus", () => {
    expect(unicodeToLatex("5 ＋ 3")).toBe("5 + 3");
  });

  it("converts absolute value", () => {
    expect(unicodeToLatex("|x|")).toBe("\\lvert x \\rvert");
    expect(unicodeToLatex("|-5|")).toBe("\\lvert -5 \\rvert");
  });

  it("converts parenthesised fraction", () => {
    expect(unicodeToLatex("(3 ± √5)/4")).toBe("\\frac{3 \\pm  \\sqrt{5}}{4}");
  });

  it("converts rationalize fraction: coeff√base/den", () => {
    expect(unicodeToLatex("2√3/3")).toBe("\\frac{2\\sqrt{3}}{3}");
    expect(unicodeToLatex("√5/5")).toBe("\\frac{\\sqrt{5}}{5}");
  });

  it("converts num/√base fraction", () => {
    expect(unicodeToLatex("3/√5")).toBe("\\frac{3}{\\sqrt{5}}");
  });

  it("handles complex expression: √12 + √27", () => {
    expect(unicodeToLatex("√12 + √27")).toBe("\\sqrt{12} + \\sqrt{27}");
  });

  it("handles monomial: 3x²y", () => {
    expect(unicodeToLatex("3x²y")).toBe("3x^{2}y");
  });

  it("handles mixed-calc: (−3)² + 4 × (−2)", () => {
    const result = unicodeToLatex("(−3)² + 4 × (−2)");
    expect(result).toBe("(-3)^{2} + 4 \\times  (-2)");
  });
});

describe("latexToText", () => {
  it("converts sqrt", () => {
    expect(latexToText("\\sqrt{12}")).toBe("√12");
  });

  it("converts frac", () => {
    expect(latexToText("\\frac{3}{5}")).toBe("3/5");
    expect(latexToText("\\dfrac{3}{5}")).toBe("3/5");
  });

  it("converts boxed", () => {
    expect(latexToText("\\boxed{42}")).toBe("42");
  });

  it("converts phantom to □", () => {
    expect(latexToText("\\boxed{\\phantom{42}}")).toBe("□");
  });

  it("converts superscripts", () => {
    expect(latexToText("x^{2}")).toBe("x²");
    expect(latexToText("x^{3}")).toBe("x³");
  });

  it("converts degree", () => {
    expect(latexToText("90^{\\circ}")).toBe("90°");
  });

  it("converts operators", () => {
    expect(latexToText("3 \\times 4")).toBe("3 ×4");
    expect(latexToText("12 \\div 3")).toBe("12 ÷3");
    expect(latexToText("\\pm 5")).toBe("±5");
    expect(latexToText("3\\pi")).toBe("3π");
  });

  it("converts absolute value", () => {
    expect(latexToText("\\lvert x \\rvert")).toBe("|x |");
  });

  it("converts text command", () => {
    expect(latexToText("\\text{ cm}")).toBe("cm");
  });
});

describe("round-trip", () => {
  const cases = [
    "√12",
    "3√5",
    "x²",
    "3 × 4",
    "12 ÷ 3",
    "±5",
  ];

  for (const input of cases) {
    it(`preserves "${input}"`, () => {
      const latex = unicodeToLatex(input);
      const text = latexToText(latex);
      // Normalize spaces for comparison
      const normalized = text.replace(/\s+/g, " ").trim();
      const expected = input.replace(/−/g, "-").replace(/＋/g, "+").replace(/\s+/g, " ").trim();
      expect(normalized).toBe(expected);
    });
  }
});
