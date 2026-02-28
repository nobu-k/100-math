import { mulberry32 } from "../random";

export interface ProofIneqProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateProofIneq = (
  seed: number,
  count = 10,
): ProofIneqProblem[] => {
  const rng = mulberry32(seed);
  const problems: ProofIneqProblem[] = [];
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

const generateOne = (rng: () => number): ProofIneqProblem | null => {
  const variant = Math.floor(rng() * 4);

  if (variant === 0) return generateAmGm(rng);
  if (variant === 1) return generateAmGmOptimize(rng);
  if (variant === 2) return generateCauchySchwarz(rng);
  return generateVerifyIdentity(rng);
};

const generateAmGm = (rng: () => number): ProofIneqProblem | null => {
  // a > 0, b > 0, a + b = S のとき ab の最大値
  const s = Math.floor(rng() * 8) + 4;
  const maxAb = s * s / 4;
  const ansStr = Number.isInteger(maxAb) ? `${maxAb}` : `${s}²/4`;

  const expr = `a > 0, b > 0, a + b = ${s} のとき，ab の最大値`;
  const answerExpr = `相加・相乗平均より ab ≤ (a+b)²/4 = ${ansStr}`;
  return { expr, answerExpr, isNL: true };
};

const generateAmGmOptimize = (rng: () => number): ProofIneqProblem | null => {
  // x > 0 のとき x + k/x の最小値 → 2√k
  const k = Math.floor(rng() * 5) + 1;
  const k2 = k * k;
  const min = 2 * k;

  const expr = `x > 0 のとき，x + ${k2}/x の最小値`;
  const answerExpr = `相加・相乗平均より x + ${k2}/x ≥ 2√${k2} = ${min}`;
  return { expr, answerExpr, isNL: true };
};

const generateCauchySchwarz = (rng: () => number): ProofIneqProblem | null => {
  // Verify (a²+b²)(c²+d²) ≥ (ac+bd)²
  const a = Math.floor(rng() * 5) + 1;
  const b = Math.floor(rng() * 5) + 1;
  const c = Math.floor(rng() * 5) + 1;
  const d = Math.floor(rng() * 5) + 1;

  const lhs = (a * a + b * b) * (c * c + d * d);
  const rhs = (a * c + b * d) * (a * c + b * d);

  const expr = `a = ${a}, b = ${b}, c = ${c}, d = ${d} のとき，(a²+b²)(c²+d²) と (ac+bd)² を比較せよ`;
  const answerExpr = `(a²+b²)(c²+d²) = ${lhs}，(ac+bd)² = ${rhs}，${lhs} ≥ ${rhs}`;
  return { expr, answerExpr, isNL: true };
};

const generateVerifyIdentity = (rng: () => number): ProofIneqProblem | null => {
  // Verify a² + b² ≥ 2ab for given values
  const a = Math.floor(rng() * 7) + 1;
  const b = Math.floor(rng() * 7) + 1;
  if (a === b) return null;

  const lhs = a * a + b * b;
  const rhs = 2 * a * b;

  const expr = `a = ${a}, b = ${b} のとき，a² + b² と 2ab を比較せよ`;
  const answerExpr = `a² + b² = ${lhs}，2ab = ${rhs}，${lhs} ≥ ${rhs}`;
  return { expr, answerExpr, isNL: true };
};
