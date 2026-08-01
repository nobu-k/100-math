import { mulberry32 } from "../random";

export type SqrtExpansionMode = "distribute" | "formula" | "mixed";

export interface SqrtExpansionProblem {
  expr: string;
  answerExpr: string;
}

/** coef × √rad; rad is square-free and rad === 1 means a rational term. */
interface Term {
  coef: number;
  rad: number;
}

const BASES = [2, 3, 5, 6, 7];

export const generateSqrtExpansion = (
  seed: number,
  mode: SqrtExpansionMode = "mixed",
  count = 12,
): SqrtExpansionProblem[] => {
  const rng = mulberry32(seed);
  const problems: SqrtExpansionProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick =
        mode === "mixed"
          ? rng() < 0.35 ? "distribute" : "formula"
          : mode;
      const problem =
        pick === "distribute" ? buildDistribute(rng) : buildFormula(rng);
      if (!problem) continue;

      if (!seen.has(problem.expr) || attempt === 39) {
        seen.add(problem.expr);
        problems.push(problem);
        break;
      }
    }
  }
  return problems;
};

/** √a(√b + √c), √a(b − √c), 2√3(√6 − √2), … */
const buildDistribute = (rng: () => number): SqrtExpansionProblem | null => {
  const mono: Term = { coef: rng() < 0.7 ? 1 : 2, rad: pickBase(rng) };
  const t1 = randInnerTerm(rng, false);
  const t2Abs = randInnerTerm(rng, t1.rad === 1);
  if (t1.rad === t2Abs.rad) return null; // inner would combine into one term
  const t2: Term = { coef: (rng() < 0.5 ? 1 : -1) * t2Abs.coef, rad: t2Abs.rad };

  const inner = [t1, t2];
  return {
    expr: `${fmtAbsTerm(mono.coef, mono.rad)}(${fmtTerms(inner)})`,
    answerExpr: fmtTerms(sortTerms(mulExprs([mono], inner))),
  };
};

/** The four 乗法公式 with radicals: (x±y)², (x+y)(x−y), (x+a)(x+b). */
const buildFormula = (rng: () => number): SqrtExpansionProblem | null => {
  const formulaType = Math.floor(rng() * 4);
  const a = pickBase(rng);

  if (formulaType === 0 || formulaType === 1) {
    // (X + Y)² or (X − Y)²
    const x: Term = { coef: rng() < 0.85 ? 1 : 2, rad: a };
    const y = randCompanion(rng, a);
    if (x.coef === 2 && y.coef === 2) return null; // 2√a ± 2√b looks unnatural
    const sign = formulaType === 0 ? 1 : -1;
    const factor = [x, { coef: sign * y.coef, rad: y.rad }];
    return {
      expr: `(${fmtTerms(factor)})²`,
      answerExpr: fmtTerms(sortTerms(mulExprs(factor, factor))),
    };
  }

  if (formulaType === 2) {
    // (X + Y)(X − Y) = X² − Y²
    const x: Term = { coef: rng() < 0.85 ? 1 : 2, rad: a };
    const y = randCompanion(rng, a);
    if (x.coef === 2 && y.coef === 2) return null; // 2√a ± 2√b looks unnatural
    const plus = [x, y];
    const minus = [x, { coef: -y.coef, rad: y.rad }];
    return {
      expr: `(${fmtTerms(plus)})(${fmtTerms(minus)})`,
      answerExpr: fmtTerms(sortTerms(mulExprs(plus, minus))),
    };
  }

  // (√a + s)(√a + t) — integer companions or a general FOIL with roots
  const x: Term = { coef: 1, rad: a };
  let s: Term;
  let t: Term;
  if (rng() < 0.5) {
    const m = randNonZero(rng, 4);
    const n = randNonZero(rng, 4);
    if (m === n || m + n === 0) return null; // duplicates of square / diff-of-squares
    s = { coef: m, rad: 1 };
    t = { coef: n, rad: 1 };
  } else {
    const b = pickBase(rng);
    const c = pickBase(rng);
    if (b === a || c === a || b === c) return null;
    s = { coef: rng() < 0.5 ? 1 : -1, rad: b };
    t = { coef: rng() < 0.5 ? 1 : -1, rad: c };
  }
  const f1 = [x, s];
  const f2 = [x, t];
  return {
    expr: `(${fmtTerms(f1)})(${fmtTerms(f2)})`,
    answerExpr: fmtTerms(sortTerms(mulExprs(f1, f2))),
  };
};

/** A positive term for inside the parentheses: m, √b or 2√b. */
const randInnerTerm = (rng: () => number, mustBeRadical: boolean): Term => {
  if (mustBeRadical || rng() < 0.75) {
    return { coef: rng() < 0.8 ? 1 : 2, rad: pickBase(rng) };
  }
  return { coef: 2 + Math.floor(rng() * 4), rad: 1 }; // 2-5
};

/** A positive second term Y for (X ± Y)² etc.: √b (b ≠ a), 2√b or m. */
const randCompanion = (rng: () => number, avoid: number): Term => {
  if (rng() < 0.6) {
    return { coef: rng() < 0.8 ? 1 : 2, rad: pickBaseExcept(rng, avoid) };
  }
  return { coef: 1 + Math.floor(rng() * 4), rad: 1 }; // 1-4
};

const mulExprs = (f1: Term[], f2: Term[]): Term[] => {
  const products: Term[] = [];
  for (const s of f1) {
    for (const t of f2) {
      products.push(normalizeTerm(s.coef * t.coef, s.rad * t.rad));
    }
  }
  return combineTerms(products);
};

const combineTerms = (terms: Term[]): Term[] => {
  const byRad = new Map<number, number>();
  for (const t of terms) byRad.set(t.rad, (byRad.get(t.rad) ?? 0) + t.coef);
  return [...byRad.entries()]
    .filter(([, coef]) => coef !== 0)
    .map(([rad, coef]) => ({ coef, rad }));
};

/** Rational part first, then radical terms by ascending radicand. */
const sortTerms = (terms: Term[]): Term[] =>
  [...terms].sort((s, t) => s.rad - t.rad);

/** coef√rad with the radicand reduced to square-free form. */
const normalizeTerm = (coef: number, rad: number): Term => {
  const [outer, inner] = simplifyRoot(rad);
  return { coef: coef * outer, rad: inner };
};

/**
 * Simplify √n to a√b form where b has no perfect square factors.
 * Returns [a, b] such that √n = a√b.
 */
const simplifyRoot = (n: number): [number, number] => {
  let outer = 1;
  let inner = n;
  for (let d = 2; d * d <= inner; d++) {
    while (inner % (d * d) === 0) {
      outer *= d;
      inner /= d * d;
    }
  }
  return [outer, inner];
};

const fmtTerms = (terms: Term[]): string => {
  if (terms.length === 0) return "0";
  return terms
    .map((t, i) => {
      const abs = fmtAbsTerm(Math.abs(t.coef), t.rad);
      if (i === 0) return t.coef < 0 ? `−${abs}` : abs;
      return t.coef < 0 ? ` − ${abs}` : ` + ${abs}`;
    })
    .join("");
};

const fmtAbsTerm = (coef: number, rad: number): string => {
  if (rad === 1) return `${coef}`;
  if (coef === 1) return `√${rad}`;
  return `${coef}√${rad}`;
};

const pickBase = (rng: () => number): number =>
  BASES[Math.floor(rng() * BASES.length)];

const pickBaseExcept = (rng: () => number, avoid: number): number => {
  const candidates = BASES.filter((b) => b !== avoid);
  return candidates[Math.floor(rng() * candidates.length)];
};

const randNonZero = (rng: () => number, max: number): number =>
  (1 + Math.floor(rng() * max)) * (rng() < 0.5 ? 1 : -1);
