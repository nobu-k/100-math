import { mulberry32 } from "../random";

export interface VarianceSdProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateVarianceSd = (
  seed: number,
  count = 10,
): VarianceSdProblem[] => {
  const rng = mulberry32(seed);
  const problems: VarianceSdProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const result = generateOne(rng);
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

const generateOne = (rng: () => number): VarianceSdProblem | null => {
  const variant = Math.floor(rng() * 3);

  if (variant === 0) return generateMean(rng);
  if (variant === 1) return generateVariance(rng);
  return generateCorrelation(rng);
};

const generateMean = (rng: () => number): VarianceSdProblem | null => {
  const n = Math.floor(rng() * 3) + 5;
  const data = makeCleanData(rng, n);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  if (!Number.isInteger(mean)) return null;

  const expr = `データ {${data.join(", ")}} の平均値`;
  const answerExpr = `(${data.join(" + ")}) ÷ ${n} = ${mean}`;
  return { expr, answerExpr, isNL: true };
};

const generateVariance = (rng: () => number): VarianceSdProblem | null => {
  const n = Math.floor(rng() * 2) + 5;
  const data = makeCleanData(rng, n);
  const sum = data.reduce((a, b) => a + b, 0);
  const mean = sum / n;
  if (!Number.isInteger(mean)) return null;

  const diffs2 = data.map((x) => (x - mean) * (x - mean));
  const variance = diffs2.reduce((a, b) => a + b, 0) / n;
  if (!Number.isInteger(variance) && !isCleanDecimal(variance)) return null;

  const sd = Math.sqrt(variance);
  const sdStr = Number.isInteger(sd) ? `${sd}` : `√${fmtNum(variance)}`;

  const expr = `データ {${data.join(", ")}} の分散と標準偏差`;
  const answerExpr = `平均 = ${fmtNum(mean)}，分散 = ${fmtNum(variance)}，標準偏差 = ${sdStr}`;
  return { expr, answerExpr, isNL: true };
};

const generateCorrelation = (rng: () => number): VarianceSdProblem | null => {
  const n = Math.floor(rng() * 2) + 5;
  const positive = rng() < 0.5;

  const x: number[] = [];
  const y: number[] = [];
  for (let i = 0; i < n; i++) {
    const xi = Math.floor(rng() * 10) + 1;
    x.push(xi);
    const noise = Math.floor(rng() * 5) - 2;
    y.push(positive ? xi + noise : 12 - xi + noise);
  }

  const xStr = x.join(", ");
  const yStr = y.join(", ");
  const answer = positive ? "正の相関" : "負の相関";

  const expr = `x = {${xStr}}, y = {${yStr}} の相関は正か負か`;
  return { expr, answerExpr: answer, isNL: true };
};

const makeCleanData = (rng: () => number, n: number): number[] => {
  const base = Math.floor(rng() * 5) + 3;
  return Array.from({ length: n }, () => base + Math.floor(rng() * 9) - 4);
};

const isCleanDecimal = (n: number): boolean => Math.abs(n - Math.round(n * 10) / 10) < 1e-9;

const fmtNum = (n: number): string => {
  if (Number.isInteger(n)) return `${n}`;
  return `${Math.round(n * 100) / 100}`;
};
