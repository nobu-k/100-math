import { mulberry32 } from "../random";

export type ConfidenceHypothesisMode = "confidence" | "hypothesis" | "mixed";

export interface ConfidenceHypothesisProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateConfidenceHypothesis = (
  seed: number,
  mode: ConfidenceHypothesisMode = "mixed",
  count = 10,
): ConfidenceHypothesisProblem[] => {
  const rng = mulberry32(seed);
  const problems: ConfidenceHypothesisProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: ConfidenceHypothesisProblem | null = null;
      if (pick === "confidence") result = generateConfidence(rng);
      else result = generateHypothesis(rng);

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

const pickMode = (rng: () => number, mode: ConfidenceHypothesisMode): "confidence" | "hypothesis" => {
  if (mode !== "mixed") return mode;
  return rng() < 0.5 ? "confidence" : "hypothesis";
};

const generateConfidence = (rng: () => number): ConfidenceHypothesisProblem | null => {
  // Confidence interval: x̄ ± z·σ/√n
  const n = [25, 36, 49, 64, 100][Math.floor(rng() * 5)];
  const sqrtN = Math.sqrt(n);
  const xbar = Math.floor(rng() * 40) + 50;
  const sigma = Math.floor(rng() * 5) + 3;
  const is95 = rng() < 0.6;
  const z = is95 ? 1.96 : 2.576;
  const level = is95 ? "95%" : "99%";

  const margin = z * sigma / sqrtN;
  const marginStr = fmtDec(margin);
  const lo = fmtDec(xbar - margin);
  const hi = fmtDec(xbar + margin);

  const expr = `n = ${n}, x̄ = ${xbar}, σ = ${sigma}, z = ${z} のとき，${level} 信頼区間`;
  const answerExpr = `${xbar} ± ${z} × ${sigma}/√${n} = ${xbar} ± ${marginStr}，[${lo}, ${hi}]`;
  return { expr, answerExpr, isNL: true };
};

const generateHypothesis = (rng: () => number): ConfidenceHypothesisProblem | null => {
  // Hypothesis test: z = (x̄ − μ₀)/(σ/√n), compare with critical value
  const n = [25, 36, 49, 64, 100][Math.floor(rng() * 5)];
  const sqrtN = Math.sqrt(n);
  const mu0 = Math.floor(rng() * 20) + 50;
  const sigma = Math.floor(rng() * 5) + 3;
  const diff = Math.floor(rng() * 5) + 1;
  const xbar = mu0 + (rng() < 0.5 ? diff : -diff);

  const zStat = (xbar - mu0) / (sigma / sqrtN);
  const zStatStr = fmtDec(Math.abs(zStat));
  const reject = Math.abs(zStat) > 1.96;

  const expr = `H₀: μ = ${mu0}, n = ${n}, x̄ = ${xbar}, σ = ${sigma} のとき，z 統計量（有意水準 5%，z₀.₀₂₅ = 1.96）`;
  const answerExpr = `z = |${xbar} − ${mu0}|/(${sigma}/√${n}) = ${zStatStr}，${reject ? "棄却する" : "棄却しない"}`;
  return { expr, answerExpr, isNL: true };
};

const fmtDec = (n: number): string => {
  const rounded = Math.round(n * 100) / 100;
  if (Number.isInteger(rounded)) return `${rounded}`;
  return `${rounded}`;
};
