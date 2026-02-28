import { mulberry32 } from "../random";

export type ConicSectionsMode = "parabola" | "ellipse" | "hyperbola" | "mixed";

export interface ConicSectionsProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateConicSections = (
  seed: number,
  mode: ConicSectionsMode = "mixed",
  count = 10,
): ConicSectionsProblem[] => {
  const rng = mulberry32(seed);
  const problems: ConicSectionsProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: ConicSectionsProblem | null = null;
      if (pick === "parabola") result = generateParabola(rng);
      else if (pick === "ellipse") result = generateEllipse(rng);
      else result = generateHyperbola(rng);

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

const pickMode = (rng: () => number, mode: ConicSectionsMode): "parabola" | "ellipse" | "hyperbola" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.33) return "parabola";
  if (r < 0.66) return "ellipse";
  return "hyperbola";
};

const generateParabola = (rng: () => number): ConicSectionsProblem | null => {
  // y² = 4px → focus (p, 0), directrix x = −p
  const p = Math.floor(rng() * 5) + 1;
  const fourP = 4 * p;

  const expr = `放物線 y² = ${fourP}x の焦点と準線`;
  const answerExpr = `焦点 (${p}, 0)，準線 x = −${p}`;
  return { expr, answerExpr, isNL: true };
};

const generateEllipse = (rng: () => number): ConicSectionsProblem | null => {
  // x²/a² + y²/b² = 1 (a > b) → foci (±c, 0) where c² = a² − b²
  const b = Math.floor(rng() * 4) + 1;
  const a = b + Math.floor(rng() * 4) + 1;

  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 - b2;
  const c = Math.sqrt(c2);
  const cStr = Number.isInteger(c) ? `${c}` : `√${c2}`;

  const expr = `楕円 x²/${a2} + y²/${b2} = 1 の焦点`;
  const answerExpr = `c² = ${a2} − ${b2} = ${c2}，焦点 (±${cStr}, 0)`;
  return { expr, answerExpr, isNL: true };
};

const generateHyperbola = (rng: () => number): ConicSectionsProblem | null => {
  // x²/a² − y²/b² = 1 → foci (±c, 0), asymptotes y = ±(b/a)x
  const a = Math.floor(rng() * 4) + 1;
  const b = Math.floor(rng() * 4) + 1;

  const a2 = a * a;
  const b2 = b * b;
  const c2 = a2 + b2;
  const c = Math.sqrt(c2);
  const cStr = Number.isInteger(c) ? `${c}` : `√${c2}`;

  const g = gcd(b, a);
  const bn = b / g;
  const an = a / g;
  const asymStr = an === 1 ? (bn === 1 ? "x" : `${bn}x`) : `${bn}/${an}·x`;

  const expr = `双曲線 x²/${a2} − y²/${b2} = 1 の焦点と漸近線`;
  const answerExpr = `焦点 (±${cStr}, 0)，漸近線 y = ±${asymStr}`;
  return { expr, answerExpr, isNL: true };
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
