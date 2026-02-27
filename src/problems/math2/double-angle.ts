import { mulberry32 } from "../random";

export interface TrigFuncProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateDoubleAngle = (
  seed: number,
  count = 10,
): TrigFuncProblem[] => {
  const rng = mulberry32(seed);
  const problems: TrigFuncProblem[] = [];
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

const generateOne = (rng: () => number): TrigFuncProblem | null => {
  const triples: [number, number, number][] = [
    [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
  ];
  const [opp, adj, hyp] = triples[Math.floor(rng() * triples.length)];

  if (rng() < 0.5) {
    const num = 2 * opp * adj;
    const den = hyp * hyp;
    const g = gcd(num, den);
    const expr = `sin θ = ${opp}/${hyp}（0° < θ < 90°）のとき，sin 2θ の値`;
    const answerExpr = `2 × ${opp}/${hyp} × ${adj}/${hyp} = ${num / g}/${den / g}`;
    return { expr, answerExpr, isNL: true };
  }

  const num = adj * adj - opp * opp;
  const den = hyp * hyp;
  const g = gcd(Math.abs(num), den);
  const sign = num < 0 ? "−" : "";
  const expr = `sin θ = ${opp}/${hyp}（0° < θ < 90°）のとき，cos 2θ の値`;
  const answerExpr = `${sign}${Math.abs(num) / g}/${den / g}`;
  return { expr, answerExpr, isNL: true };
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
