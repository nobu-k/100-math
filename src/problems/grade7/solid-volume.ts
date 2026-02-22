import { mulberry32 } from "../random";

export type SolidType = "cylinder" | "cone" | "sphere" | "prism";
export type SolidCalcType = "volume" | "surface-area";
export type SolidMode = "cylinder" | "cone" | "sphere" | "prism" | "mixed";

export interface SolidProblem {
  solidType: SolidType;
  calcType: SolidCalcType;
  /** Dimensions */
  radius?: number; // for cylinder, cone, sphere
  height?: number; // for cylinder, cone, prism
  slantHeight?: number; // for cone surface area
  baseEdge?: number; // for prism
  baseSides?: number; // for prism (3=triangular, 4=square)
  /** Answer: coefficient of π (0 if no π involved, e.g. prism) */
  answerPiCoeff: number;
  /** Answer: non-π part (for prism volume, etc.) */
  answerPlain: number;
  /** Whether answer involves π */
  hasPI: boolean;
  /** Display answer */
  answerDisplay: string;
}

export const generateSolid = (
  seed: number,
  mode: SolidMode = "mixed",
  calcType: SolidCalcType = "volume",
): SolidProblem[] => {
  const rng = mulberry32(seed);
  const problems: SolidProblem[] = [];
  const seen = new Set<string>();

  const types: SolidType[] =
    mode === "mixed"
      ? ["cylinder", "cone", "sphere", "prism"]
      : [mode as SolidType];

  for (let i = 0; i < 6; i++) {
    for (let attempt = 0; attempt < 30; attempt++) {
      const solidType = types[Math.floor(rng() * types.length)];
      const ct: SolidCalcType =
        calcType === "volume"
          ? "volume"
          : rng() < 0.5
            ? "volume"
            : "surface-area";

      let problem: SolidProblem | null = null;

      if (solidType === "cylinder") {
        const r = Math.floor(rng() * 8) + 2; // 2-9
        const h = Math.floor(rng() * 12) + 2; // 2-13

        if (ct === "volume") {
          // V = πr²h
          const coeff = r * r * h;
          problem = {
            solidType,
            calcType: ct,
            radius: r,
            height: h,
            answerPiCoeff: coeff,
            answerPlain: 0,
            hasPI: true,
            answerDisplay: `${coeff}π cm³`,
          };
        } else {
          // SA = 2πr² + 2πrh = 2πr(r+h)
          const coeff = 2 * r * (r + h);
          problem = {
            solidType,
            calcType: ct,
            radius: r,
            height: h,
            answerPiCoeff: coeff,
            answerPlain: 0,
            hasPI: true,
            answerDisplay: `${coeff}π cm²`,
          };
        }
      } else if (solidType === "cone") {
        const r = Math.floor(rng() * 7) + 2; // 2-8
        const h = Math.floor(rng() * 10) + 3; // 3-12

        if (ct === "volume") {
          // V = (1/3)πr²h
          const num = r * r * h;
          if (num % 3 !== 0) continue; // ensure clean division
          const coeff = num / 3;
          problem = {
            solidType,
            calcType: ct,
            radius: r,
            height: h,
            answerPiCoeff: coeff,
            answerPlain: 0,
            hasPI: true,
            answerDisplay: `${coeff}π cm³`,
          };
        } else {
          // SA = πr² + πrl (l = slant height)
          // Use integer slant height
          const l = Math.floor(rng() * 8) + r + 1; // l > r
          const coeff = r * r + r * l;
          problem = {
            solidType,
            calcType: ct,
            radius: r,
            height: h,
            slantHeight: l,
            answerPiCoeff: coeff,
            answerPlain: 0,
            hasPI: true,
            answerDisplay: `${coeff}π cm²`,
          };
        }
      } else if (solidType === "sphere") {
        const r = Math.floor(rng() * 8) + 2; // 2-9

        if (ct === "volume") {
          // V = (4/3)πr³
          const num = 4 * r * r * r;
          if (num % 3 !== 0) continue;
          const coeff = num / 3;
          problem = {
            solidType,
            calcType: ct,
            radius: r,
            answerPiCoeff: coeff,
            answerPlain: 0,
            hasPI: true,
            answerDisplay: `${coeff}π cm³`,
          };
        } else {
          // SA = 4πr²
          const coeff = 4 * r * r;
          problem = {
            solidType,
            calcType: ct,
            radius: r,
            answerPiCoeff: coeff,
            answerPlain: 0,
            hasPI: true,
            answerDisplay: `${coeff}π cm²`,
          };
        }
      } else {
        // prism
        const sides = rng() < 0.5 ? 3 : 4; // triangular or square base
        const h = Math.floor(rng() * 10) + 3; // 3-12
        const edge = Math.floor(rng() * 8) + 2; // 2-9

        if (ct === "volume") {
          let baseArea: number;
          if (sides === 4) {
            baseArea = edge * edge;
          } else {
            // Equilateral triangle approximation, use integer area
            // Use right triangle: base=edge, height=edgeH
            const edgeH = Math.floor(rng() * 6) + 2;
            baseArea = (edge * edgeH) / 2;
            if (baseArea !== Math.floor(baseArea)) continue;
          }
          const vol = baseArea * h;
          problem = {
            solidType,
            calcType: ct,
            baseEdge: edge,
            baseSides: sides,
            height: h,
            answerPiCoeff: 0,
            answerPlain: vol,
            hasPI: false,
            answerDisplay: `${vol} cm³`,
          };
        } else {
          continue; // prism surface area is complex, skip for now
        }
      }

      if (!problem) continue;
      const key = `${solidType}-${ct}-${problem.radius ?? problem.baseEdge}-${problem.height ?? 0}`;
      if (!seen.has(key) || attempt === 29) {
        seen.add(key);
        problems.push(problem);
        break;
      }
    }
  }
  return problems;
};
