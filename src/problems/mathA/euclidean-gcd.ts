import { mulberry32 } from "../random";

export type EuclideanGcdMode = "gcd" | "diophantine" | "mixed";

export interface EuclideanGcdProblem {
  expr: string;
  answerExpr: string;
}

export const generateEuclideanGcd = (
  seed: number,
  mode: EuclideanGcdMode = "mixed",
  count = 8,
): EuclideanGcdProblem[] => {
  const rng = mulberry32(seed);
  const problems: EuclideanGcdProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = mode === "mixed"
        ? rng() < 0.6 ? "gcd" : "diophantine"
        : mode;

      const result = pick === "gcd"
        ? generateGcd(rng)
        : generateDiophantine(rng);

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

const generateGcd = (rng: () => number): EuclideanGcdProblem | null => {
  const a = Math.floor(rng() * 400) + 50;  // [50..449]
  const b = Math.floor(rng() * 300) + 50;  // [50..349]
  if (a === b) return null;

  const [big, small] = a >= b ? [a, b] : [b, a];
  const g = gcdCalc(big, small);

  // Show Euclidean algorithm steps
  const steps: string[] = [];
  let x = big;
  let y = small;
  while (y > 0) {
    const q = Math.floor(x / y);
    const r = x % y;
    steps.push(`${x} = ${y} × ${q} + ${r}`);
    x = y;
    y = r;
  }

  const expr = `ユークリッドの互除法で gcd(${big}, ${small}) を求めよ`;
  const answerExpr = `${steps.join("，")}　よって gcd = ${g}`;

  return { expr, answerExpr };
};

const generateDiophantine = (rng: () => number): EuclideanGcdProblem | null => {
  // Generate ax + by = gcd(a,b)
  // Pick a, b with small gcd
  const a = Math.floor(rng() * 80) + 20;  // [20..99]
  const b = Math.floor(rng() * 60) + 15;  // [15..74]
  if (a === b) return null;

  const [big, small] = a >= b ? [a, b] : [b, a];
  const g = gcdCalc(big, small);

  // Extended Euclidean algorithm
  const { x, y } = extendedGcd(big, small);

  const expr = `${big}x + ${small}y = ${g} を満たす整数 x, y の一組を求めよ`;
  const answerExpr = `x = ${x}, y = ${y}`;

  return { expr, answerExpr };
};

const gcdCalc = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};

const extendedGcd = (a: number, b: number): { g: number; x: number; y: number } => {
  if (b === 0) return { g: a, x: 1, y: 0 };
  const { g, x: x1, y: y1 } = extendedGcd(b, a % b);
  return { g, x: y1, y: x1 - Math.floor(a / b) * y1 };
};
