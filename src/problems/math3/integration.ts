import { mulberry32 } from "../random";

export type IntegrationMode = "basic" | "substitution" | "by-parts" | "mixed";

export interface IntegrationProblem {
  expr: string;
  answerExpr: string;
}

export const generateIntegration = (
  seed: number,
  mode: IntegrationMode = "mixed",
  count = 10,
): IntegrationProblem[] => {
  const rng = mulberry32(seed);
  const problems: IntegrationProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: IntegrationProblem | null = null;
      if (pick === "basic") result = generateBasic(rng);
      else if (pick === "substitution") result = generateSubstitution(rng);
      else result = generateByParts(rng);

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

const pickMode = (rng: () => number, mode: IntegrationMode): "basic" | "substitution" | "by-parts" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.35) return "basic";
  if (r < 0.7) return "substitution";
  return "by-parts";
};

const generateBasic = (rng: () => number): IntegrationProblem | null => {
  const funcs: [string, string][] = [
    ["sin x", "−cos x + C"],
    ["cos x", "sin x + C"],
    ["eˣ", "eˣ + C"],
    ["1/x", "ln|x| + C"],
  ];

  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    const [f, F] = funcs[Math.floor(rng() * funcs.length)];
    const expr = `∫ ${f} dx`;
    const answerExpr = F;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // ∫ a·f(x) dx
    const a = Math.floor(rng() * 4) + 2; // [2..5]
    const [f, F] = funcs[Math.floor(rng() * funcs.length)];
    const expr = `∫ ${a}${f} dx`;
    // Multiply antiderivative by a
    const ansF = F.replace(" + C", "").replace("−", "−");
    const answerExpr = `${a}(${ansF}) + C`;
    return { expr, answerExpr };
  }

  // x^n with fractional n
  const nChoices = [-2, -1/2, 1/2, 3/2];
  const n = nChoices[Math.floor(rng() * nChoices.length)];

  if (n === -1/2) {
    const expr = "∫ 1/√x dx";
    const answerExpr = "2√x + C";
    return { expr, answerExpr };
  }
  if (n === 1/2) {
    const expr = "∫ √x dx";
    const answerExpr = "(2/3)x√x + C";
    return { expr, answerExpr };
  }
  if (n === -2) {
    const expr = "∫ 1/x² dx";
    const answerExpr = "−1/x + C";
    return { expr, answerExpr };
  }
  // n = 3/2
  const expr = "∫ x√x dx";
  const answerExpr = "(2/5)x²√x + C";
  return { expr, answerExpr };
};

const generateSubstitution = (rng: () => number): IntegrationProblem | null => {
  // ∫ f(ax+b) dx — linear substitution
  const variant = Math.floor(rng() * 4);
  const a = Math.floor(rng() * 3) + 2; // [2..4]
  const b = Math.floor(rng() * 5) + 1; // [1..5]

  if (variant === 0) {
    // ∫ sin(ax+b) dx = -cos(ax+b)/a + C
    const expr = `∫ sin(${a}x + ${b}) dx`;
    const answerExpr = `−(1/${a})cos(${a}x + ${b}) + C`;
    return { expr, answerExpr };
  }
  if (variant === 1) {
    // ∫ cos(ax+b) dx = sin(ax+b)/a + C
    const expr = `∫ cos(${a}x + ${b}) dx`;
    const answerExpr = `(1/${a})sin(${a}x + ${b}) + C`;
    return { expr, answerExpr };
  }
  if (variant === 2) {
    // ∫ e^(ax+b) dx = e^(ax+b)/a + C
    const expr = `∫ e^(${a}x + ${b}) dx`;
    const answerExpr = `(1/${a})e^(${a}x + ${b}) + C`;
    return { expr, answerExpr };
  }
  // ∫ (ax+b)^n dx = (ax+b)^(n+1) / (a(n+1)) + C
  const n = Math.floor(rng() * 3) + 2; // [2..4]
  const expr = `∫ (${a}x + ${b})${sup(n)} dx`;
  const answerExpr = `(1/${a * (n + 1)})(${a}x + ${b})${sup(n + 1)} + C`;
  return { expr, answerExpr };
};

const generateByParts = (rng: () => number): IntegrationProblem | null => {
  // Single application of integration by parts
  const variant = Math.floor(rng() * 3);

  if (variant === 0) {
    // ∫ xe^x dx = xe^x - e^x + C = (x-1)e^x + C
    const a = Math.floor(rng() * 3) + 1; // [1..3]
    if (a === 1) {
      const expr = "∫ xeˣ dx";
      const answerExpr = "(x − 1)eˣ + C";
      return { expr, answerExpr };
    }
    const expr = `∫ ${a}xeˣ dx`;
    const answerExpr = `${a}(x − 1)eˣ + C`;
    return { expr, answerExpr };
  }

  if (variant === 1) {
    // ∫ x·sinx dx = -x·cosx + sinx + C
    const expr = "∫ x sin x dx";
    const answerExpr = "−x cos x + sin x + C";
    return { expr, answerExpr };
  }

  // ∫ lnx dx = x·lnx - x + C
  const expr = "∫ ln x dx";
  const answerExpr = "x ln x − x + C";
  return { expr, answerExpr };
};

const sup = (n: number): string => {
  const s: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return s[n] ?? `^${n}`;
};
