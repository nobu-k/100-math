import { mulberry32 } from "../random";
import { nCr } from "../shared/latex-format";

export type BinomialDistMode = "probability" | "mean-var" | "mixed";

export interface BinomialDistProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateBinomialDist = (
  seed: number,
  mode: BinomialDistMode = "mixed",
  count = 8,
): BinomialDistProblem[] => {
  const rng = mulberry32(seed);
  const problems: BinomialDistProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = mode === "mixed"
        ? rng() < 0.6 ? "probability" : "mean-var"
        : mode;

      const result = pick === "probability"
        ? generateProbability(rng)
        : generateMeanVar(rng);

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

const generateProbability = (rng: () => number): BinomialDistProblem | null => {
  // P(X=k) = nCk * p^k * (1-p)^(n-k)
  const n = Math.floor(rng() * 5) + 3; // [3..7]
  const k = Math.floor(rng() * (n + 1)); // [0..n]

  // Use nice probabilities
  const pChoices: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 6], [1, 5]];
  const [pNum, pDen] = pChoices[Math.floor(rng() * pChoices.length)];
  const qNum = pDen - pNum;
  const qDen = pDen;

  const comb = nCr(n, k);
  // P = comb * (pNum/pDen)^k * (qNum/qDen)^(n-k)
  const numPow = Math.pow(pNum, k) * Math.pow(qNum, n - k);
  const denPow = Math.pow(pDen, n);
  const g = gcd(comb * numPow, denPow);

  const ansNum = (comb * numPow) / g;
  const ansDen = denPow / g;

  const expr = `X ~ B(${n}, ${pNum}/${pDen}) のとき，P(X = ${k})`;
  const answerExpr = ansDen === 1
    ? `${ansNum}`
    : `${n}C${k} × (${pNum}/${pDen})${sup(k)} × (${qNum}/${qDen})${sup(n - k)} = ${ansNum}/${ansDen}`;

  return { expr, answerExpr, isNL: true };
};

const generateMeanVar = (rng: () => number): BinomialDistProblem | null => {
  // E(X) = np, V(X) = np(1-p)
  const n = Math.floor(rng() * 8) + 3; // [3..10]
  const pChoices: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [1, 5], [1, 6]];
  const [pNum, pDen] = pChoices[Math.floor(rng() * pChoices.length)];

  // E(X) = n * pNum/pDen
  const eNum = n * pNum;
  const eDen = pDen;
  const eG = gcd(eNum, eDen);
  const eStr = eDen / eG === 1 ? `${eNum / eG}` : `${eNum / eG}/${eDen / eG}`;

  // V(X) = n * pNum/pDen * (pDen-pNum)/pDen
  const vNum = n * pNum * (pDen - pNum);
  const vDen = pDen * pDen;
  const vG = gcd(vNum, vDen);
  const vStr = vDen / vG === 1 ? `${vNum / vG}` : `${vNum / vG}/${vDen / vG}`;

  const expr = `X ~ B(${n}, ${pNum}/${pDen}) のとき，E(X) と V(X)`;
  const answerExpr = `E(X) = ${eStr}, V(X) = ${vStr}`;

  return { expr, answerExpr, isNL: true };
};

const sup = (n: number): string => {
  const s: Record<number, string> = { 0: "⁰", 1: "¹", 2: "²", 3: "³", 4: "⁴", 5: "⁵", 6: "⁶", 7: "⁷" };
  return s[n] ?? `^${n}`;
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
