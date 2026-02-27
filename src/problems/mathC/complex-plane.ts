import { mulberry32 } from "../random";

export type ComplexPlaneMode = "polar" | "de-moivre" | "roots" | "mixed";

export interface ComplexPlaneProblem {
  expr: string;
  answerExpr: string;
}

export const generateComplexPlane = (
  seed: number,
  mode: ComplexPlaneMode = "mixed",
  count = 10,
): ComplexPlaneProblem[] => {
  const rng = mulberry32(seed);
  const problems: ComplexPlaneProblem[] = [];
  const seen = new Set<string>();

  for (let i = 0; i < count; i++) {
    for (let attempt = 0; attempt < 40; attempt++) {
      const pick = pickMode(rng, mode);

      let result: ComplexPlaneProblem | null = null;
      if (pick === "polar") result = generatePolar(rng);
      else if (pick === "de-moivre") result = generateDeMoivre(rng);
      else result = generateRoots(rng);

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

const pickMode = (rng: () => number, mode: ComplexPlaneMode): "polar" | "de-moivre" | "roots" => {
  if (mode !== "mixed") return mode;
  const r = rng();
  if (r < 0.4) return "polar";
  if (r < 0.7) return "de-moivre";
  return "roots";
};

const generatePolar = (rng: () => number): ComplexPlaneProblem | null => {
  // Convert a+bi to polar form r(cosθ + isinθ)
  // Use values that give nice angles
  const cases: [number, number, string, string][] = [
    [1, 1, "√2", "π/4"],
    [1, -1, "√2", "−π/4"],
    [-1, 1, "√2", "3π/4"],
    [1, 0, "1", "0"],
    [0, 1, "1", "π/2"],
    [-1, 0, "1", "π"],
    [0, -1, "1", "−π/2"],
    [2, 2, "2√2", "π/4"],
    [3, 3, "3√2", "π/4"],
  ];

  const variant = Math.floor(rng() * 2);

  if (variant === 0) {
    // a+bi → polar
    const [a, b, rStr, thetaStr] = cases[Math.floor(rng() * cases.length)];
    const expr = `${fmtComplex(a, b)} を極形式で表せ`;
    const answerExpr = `${rStr}(cos ${thetaStr} + i sin ${thetaStr})`;
    return { expr, answerExpr };
  }

  // Multiply in polar form
  const r1 = Math.floor(rng() * 3) + 1;
  const r2 = Math.floor(rng() * 3) + 1;
  const angles = ["π/6", "π/4", "π/3", "π/2", "2π/3"];
  const a1 = angles[Math.floor(rng() * angles.length)];
  const a2 = angles[Math.floor(rng() * angles.length)];

  const expr = `${r1}(cos ${a1} + i sin ${a1}) × ${r2}(cos ${a2} + i sin ${a2})`;
  const answerExpr = `${r1 * r2}(cos(${a1} + ${a2}) + i sin(${a1} + ${a2}))`;
  return { expr, answerExpr };
};

const generateDeMoivre = (rng: () => number): ComplexPlaneProblem | null => {
  // (cosθ + isinθ)^n = cos(nθ) + isin(nθ)
  const angles = ["π/6", "π/4", "π/3", "π/2"];
  const theta = angles[Math.floor(rng() * angles.length)];
  const n = Math.floor(rng() * 4) + 2; // [2..5]

  const expr = `(cos ${theta} + i sin ${theta})${superscript(n)}`;
  const answerExpr = `cos ${n}·${theta} + i sin ${n}·${theta}`;
  return { expr, answerExpr };
};

const generateRoots = (rng: () => number): ComplexPlaneProblem | null => {
  // nth roots of unity
  const n = Math.floor(rng() * 3) + 3; // [3..5]

  const expr = `z${superscript(n)} = 1 の解（1の${n}乗根）をすべて求めよ`;
  const roots: string[] = [];
  for (let k = 0; k < n; k++) {
    if (k === 0) {
      roots.push("1");
    } else {
      roots.push(`cos(2·${k}π/${n}) + i sin(2·${k}π/${n})`);
    }
  }
  const answerExpr = roots.join("，");
  return { expr, answerExpr };
};

const fmtComplex = (re: number, im: number): string => {
  if (re === 0 && im === 0) return "0";
  const parts: string[] = [];
  if (re !== 0) parts.push(`${re}`);
  if (im !== 0) {
    const absIm = Math.abs(im);
    const imStr = absIm === 1 ? "i" : `${absIm}i`;
    if (parts.length === 0) {
      parts.push(im < 0 ? `−${imStr}` : imStr);
    } else {
      parts.push(im > 0 ? `+ ${imStr}` : `− ${imStr}`);
    }
  }
  return parts.join(" ");
};

const superscript = (n: number): string => {
  const sup: Record<number, string> = { 2: "²", 3: "³", 4: "⁴", 5: "⁵" };
  return sup[n] ?? `^${n}`;
};
