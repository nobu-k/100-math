import { mulberry32 } from "../random";

export interface PosNegMixedProblem {
  /** Display expression, e.g. "(−3)² + 4 × (−2)" */
  expr: string;
  /** The answer */
  answer: number;
}

type Template = {
  build: (rng: () => number) => { expr: string; answer: number } | null;
};

const templates: Template[] = [
  {
    // a + b × c
    build: (rng) => {
      const a = Math.floor(rng() * 21) - 10;
      const b = Math.floor(rng() * 13) - 6;
      const c = Math.floor(rng() * 13) - 6;
      if (b === 0 || c === 0) return null;
      const answer = a + b * c;
      const expr = `${a} + ${formatS(b)} × ${formatS(c)}`;
      return { expr, answer };
    },
  },
  {
    // a − b × c
    build: (rng) => {
      const a = Math.floor(rng() * 21) - 10;
      const b = Math.floor(rng() * 13) - 6;
      const c = Math.floor(rng() * 13) - 6;
      if (b === 0 || c === 0) return null;
      const answer = a - b * c;
      const expr = `${a} − ${formatS(b)} × ${formatS(c)}`;
      return { expr, answer };
    },
  },
  {
    // a × b + c × d
    build: (rng) => {
      const a = Math.floor(rng() * 9) - 4;
      const b = Math.floor(rng() * 9) - 4;
      const c = Math.floor(rng() * 9) - 4;
      const d = Math.floor(rng() * 9) - 4;
      if (a === 0 || b === 0 || c === 0 || d === 0) return null;
      const answer = a * b + c * d;
      const expr = `${formatS(a)} × ${formatS(b)} + ${formatS(c)} × ${formatS(d)}`;
      return { expr, answer };
    },
  },
  {
    // a² + b × c (with power)
    build: (rng) => {
      const base = Math.floor(rng() * 9) - 4;
      const b = Math.floor(rng() * 9) - 4;
      const c = Math.floor(rng() * 9) - 4;
      if (base === 0 || b === 0 || c === 0) return null;
      const answer = base * base + b * c;
      const sign = base < 0 ? `(${base})²` : `${base}²`;
      const expr = `${sign} + ${formatS(b)} × ${formatS(c)}`;
      return { expr, answer };
    },
  },
  {
    // a × (b + c)
    build: (rng) => {
      const a = Math.floor(rng() * 13) - 6;
      const b = Math.floor(rng() * 13) - 6;
      const c = Math.floor(rng() * 13) - 6;
      if (a === 0) return null;
      const answer = a * (b + c);
      const expr = `${formatS(a)} × (${b} + ${formatS(c)})`;
      return { expr, answer };
    },
  },
  {
    // a ÷ b + c (division then add)
    build: (rng) => {
      const b = Math.floor(rng() * 9) + 1; // 1-9
      const q = Math.floor(rng() * 9) - 4; // quotient
      const signB = rng() < 0.5 ? 1 : -1;
      const a = q * b * signB;
      const c = Math.floor(rng() * 13) - 6;
      if (a === 0) return null;
      const answer = a / (b * signB) + c;
      const expr = `${formatS(a)} ÷ ${formatS(b * signB)} + ${formatS(c)}`;
      return { expr, answer };
    },
  },
];

function formatS(n: number): string {
  if (n < 0) return `(${n})`;
  return `${n}`;
}

export function generatePosNegMixed(
  seed: number,
  includePower: boolean = true,
): PosNegMixedProblem[] {
  const rng = mulberry32(seed);
  const problems: PosNegMixedProblem[] = [];
  const seen = new Set<string>();
  const available = includePower
    ? templates
    : templates.filter((_, i) => i !== 3);

  for (let i = 0; i < 10; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const tmpl = available[Math.floor(rng() * available.length)];
      const result = tmpl.build(rng);
      if (!result) continue;
      if (Math.abs(result.answer) > 50) continue;
      if (!seen.has(result.expr) || attempt === 39) {
        seen.add(result.expr);
        problems.push(result);
        break;
      }
    }
  }
  return problems;
}
