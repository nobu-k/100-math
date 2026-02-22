import { mulberry32 } from "../random";

export interface AreaFormulaFigure {
  shape: "triangle" | "parallelogram" | "trapezoid";
  base: number;
  height: number;
  upperBase?: number;
}

export interface AreaFormulaProblem {
  question: string;
  answer: string;
  figure: AreaFormulaFigure;
}

export const generateAreaFormula = (
  seed: number,
  shape: "triangle" | "parallelogram" | "trapezoid" | "mixed",
): AreaFormulaProblem[] => {
  const rng = mulberry32(seed);
  const problems: AreaFormulaProblem[] = [];

  for (let i = 0; i < 6; i++) {
    const type = shape === "mixed"
      ? (["triangle", "parallelogram", "trapezoid"] as const)[Math.floor(rng() * 3)]
      : shape;

    switch (type) {
      case "triangle": {
        const base = 2 + Math.floor(rng() * 18);
        const height = 2 + Math.floor(rng() * 18);
        const b = base % 2 === 0 ? base : base + 1;
        const area = (b * height) / 2;
        problems.push({
          question: `底辺${b}cm、高さ${height}cmの三角形の面積は？`,
          answer: `${area}cm²`,
          figure: { shape: "triangle", base: b, height },
        });
        break;
      }
      case "parallelogram": {
        const base = 2 + Math.floor(rng() * 18);
        const height = 2 + Math.floor(rng() * 18);
        const area = base * height;
        problems.push({
          question: `底辺${base}cm、高さ${height}cmの平行四辺形の面積は？`,
          answer: `${area}cm²`,
          figure: { shape: "parallelogram", base, height },
        });
        break;
      }
      case "trapezoid": {
        const upper = 2 + Math.floor(rng() * 10);
        const lower = upper + 2 + Math.floor(rng() * 10);
        const height = 2 + Math.floor(rng() * 14);
        const sum = upper + lower;
        const h = sum % 2 === 0 ? height : (height % 2 === 0 ? height : height + 1);
        const area = (sum * h) / 2;
        problems.push({
          question: `上底${upper}cm、下底${lower}cm、高さ${h}cmの台形の面積は？`,
          answer: `${area}cm²`,
          figure: { shape: "trapezoid", base: lower, height: h, upperBase: upper },
        });
        break;
      }
    }
  }
  return problems;
};
