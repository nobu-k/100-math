import { mulberry32 } from "../random";
import { STANDARD_ANGLES } from "../shared/trig-utils";

export type TrigFuncMode = "general-angle" | "addition" | "double-angle" | "synthesis" | "mixed";

export interface TrigFuncProblem {
  expr: string;
  answerExpr: string;
  isNL?: boolean;
}

export const generateTrigFunc = (
  seed: number,
  mode: TrigFuncMode = "mixed",
  count = 10,
): TrigFuncProblem[] => {
  const rng = mulberry32(seed);
  const problems: TrigFuncProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: TrigFuncProblem | null = null;
      if (pick === "general-angle") result = generateGeneralAngle(rng);
      else if (pick === "addition") result = generateAddition(rng);
      else if (pick === "double-angle") result = generateDoubleAngle(rng);
      else result = generateSynthesis(rng);

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

const pickMode = (rng: () => number, mode: TrigFuncMode): "general-angle" | "addition" | "double-angle" | "synthesis" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.25) return "general-angle";
  if (r < 0.5) return "addition";
  if (r < 0.75) return "double-angle";
  return "synthesis";
};

const generateGeneralAngle = (rng: () => number): TrigFuncProblem | null => {
  // sin/cos/tan of angle beyond 0-180°, like sin390°, cos(-120°)
  const variant = Math.floor(rng() * 2);

  if (variant === 0) {
    // Angle > 360° or < 0°
    const baseAngles = [30, 45, 60, 90, 120, 135, 150, 180, 210, 240, 270, 300, 330];
    const base = baseAngles[Math.floor(rng() * baseAngles.length)];
    const extraRotations = Math.floor(rng() * 2) + 1; // 1 or 2 full rotations
    const deg = base + 360 * extraRotations;

    const funcs = ["sin", "cos"] as const;
    const func = funcs[Math.floor(rng() * funcs.length)];

    const entry = STANDARD_ANGLES.find((a) => a.degrees === base);
    if (!entry) return null;
    if (func === "sin" && entry.sin === "\\text{undefined}") return null;
    if (func === "cos" && entry.cos === "\\text{undefined}") return null;

    const answer = func === "sin" ? entry.sin : entry.cos;
    const expr = `${func} ${deg}°`;
    const answerExpr = `${func} ${base}° = ${latexToUnicode(answer)}`;
    return { expr, answerExpr };
  }

  // Negative angle
  const baseAngles = [30, 45, 60, 120, 135, 150];
  const base = baseAngles[Math.floor(rng() * baseAngles.length)];

  // sin(-θ) = -sinθ, cos(-θ) = cosθ
  const funcs = ["sin", "cos"] as const;
  const func = funcs[Math.floor(rng() * funcs.length)];

  const entry = STANDARD_ANGLES.find((a) => a.degrees === base);
  if (!entry) return null;

  let answer: string;
  if (func === "sin") {
    answer = negateLatex(entry.sin);
  } else {
    answer = entry.cos;
  }

  const expr = `${func}(−${base}°)`;
  const answerExpr = latexToUnicode(answer);
  return { expr, answerExpr };
};

const generateAddition = (rng: () => number): TrigFuncProblem | null => {
  // sin(α±β), cos(α±β) using standard angle pairs
  const pairs: [number, number][] = [
    [45, 30], [60, 45], [60, 30], [45, 15], [30, 15],
  ];
  const [a, b] = pairs[Math.floor(rng() * pairs.length)];
  const isAdd = rng() < 0.5;
  const func = rng() < 0.5 ? "sin" : "cos";

  const resultDeg = isAdd ? a + b : a - b;
  const entry = STANDARD_ANGLES.find((e) => e.degrees === resultDeg);
  if (!entry) return null;

  const op = isAdd ? "+" : "−";
  const answer = func === "sin" ? entry.sin : entry.cos;
  const expr = `${func}(${a}° ${op} ${b}°)`;
  const answerExpr = `${func} ${resultDeg}° = ${latexToUnicode(answer)}`;
  return { expr, answerExpr };
};

const generateDoubleAngle = (rng: () => number): TrigFuncProblem | null => {
  // Given sinθ = a/c (Pythagorean triple), find sin2θ or cos2θ
  const triples: [number, number, number][] = [
    [3, 4, 5], [5, 12, 13], [8, 15, 17], [7, 24, 25],
  ];
  const [opp, adj, hyp] = triples[Math.floor(rng() * triples.length)];

  if (rng() < 0.5) {
    // sin2θ = 2sinθcosθ
    const num = 2 * opp * adj;
    const den = hyp * hyp;
    const g = gcd(num, den);
    const expr = `sin θ = ${opp}/${hyp}（0° < θ < 90°）のとき，sin 2θ の値`;
    const answerExpr = `2 × ${opp}/${hyp} × ${adj}/${hyp} = ${num / g}/${den / g}`;
    return { expr, answerExpr, isNL: true };
  }

  // cos2θ = cos²θ - sin²θ = (adj²-opp²)/hyp²
  const num = adj * adj - opp * opp;
  const den = hyp * hyp;
  const g = gcd(Math.abs(num), den);
  const sign = num < 0 ? "−" : "";
  const expr = `sin θ = ${opp}/${hyp}（0° < θ < 90°）のとき，cos 2θ の値`;
  const answerExpr = `${sign}${Math.abs(num) / g}/${den / g}`;
  return { expr, answerExpr, isNL: true };
};

const generateSynthesis = (rng: () => number): TrigFuncProblem | null => {
  // a·sinθ + b·cosθ = R·sin(θ+α), R=√(a²+b²), tanα=b/a
  const a = Math.floor(rng() * 4) + 1; // [1..4]
  const b = Math.floor(rng() * 4) + 1; // [1..4]
  const r2 = a * a + b * b;

  const [outer, inner] = simplifyRoot(r2);
  const rStr = inner === 1 ? `${outer}` : (outer === 1 ? `√${inner}` : `${outer}√${inner}`);

  const expr = `${a} sin θ + ${b} cos θ を r sin(θ + α) の形にせよ`;
  const answerExpr = `${rStr} sin(θ + α)　ただし tan α = ${b}/${a}`;
  return { expr, answerExpr, isNL: true };
};

const latexToUnicode = (latex: string): string =>
  latex
    .replace(/\\frac\{([^}]*)\}\{([^}]*)\}/g, "$1/$2")
    .replace(/\\sqrt\{([^}]*)\}/g, "√$1")
    .replace(/-/g, "−")
    .replace(/\\text\{undefined\}/g, "定義なし");

const negateLatex = (latex: string): string => {
  if (latex === "0") return "0";
  if (latex.startsWith("-")) return latex.slice(1);
  return `-${latex}`;
};

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

const gcd = (a: number, b: number): number => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a;
};
