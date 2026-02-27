import { mulberry32 } from "../random";

export type NormalDistMode = "standardize" | "probability" | "mixed";

export interface NormalDistProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateNormalDist = (
  seed: number,
  mode: NormalDistMode = "mixed",
  count = 8,
): NormalDistProblem[] => {
  const rng = mulberry32(seed);
  const problems: NormalDistProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = mode === "mixed"
        ? rng() < 0.5 ? "standardize" : "probability"
        : mode;

      const result = pick === "standardize"
        ? generateStandardize(rng)
        : generateProbabilityCalc(rng);

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

const generateStandardize = (rng: () => number): NormalDistProblem | null => {
  // Z = (X - μ) / σ, pick μ, σ, X so Z is a standard value
  const mu = Math.floor(rng() * 40) + 30;  // [30..69]
  const sigma = Math.floor(rng() * 8) + 2; // [2..9]
  const zChoices = [-2, -1, 0, 1, 2];
  const z = zChoices[Math.floor(rng() * zChoices.length)];
  const x = mu + z * sigma;

  const expr = `X ~ N(${mu}, ${sigma}²) のとき，X = ${x} を標準化せよ`;
  const zStr = z < 0 ? `−${Math.abs(z)}` : `${z}`;
  const answerExpr = `Z = (${x} − ${mu})/${sigma} = ${zStr}`;

  return { expr, answerExpr, isNL: true };
};

const generateProbabilityCalc = (rng: () => number): NormalDistProblem | null => {
  // P(X ≤ x) using Z-table values
  const mu = Math.floor(rng() * 30) + 40;  // [40..69]
  const sigma = Math.floor(rng() * 6) + 2; // [2..7]

  // Pick Z from standard values with known probabilities
  const zTable: [number, string][] = [
    [1, "0.8413"],
    [2, "0.9772"],
    [-1, "0.1587"],
    [-2, "0.0228"],
  ];
  const [z, prob] = zTable[Math.floor(rng() * zTable.length)];
  const x = mu + z * sigma;

  const expr = `X ~ N(${mu}, ${sigma}²) のとき，P(X ≤ ${x})（正規分布表を用いよ）`;
  const zStr = z < 0 ? `−${Math.abs(z)}` : `${z}`;
  const answerExpr = `Z = ${zStr} より P(X ≤ ${x}) = ${prob}`;

  return { expr, answerExpr, isNL: true };
};
