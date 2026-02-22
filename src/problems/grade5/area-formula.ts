import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export const generateAreaFormula = (
  seed: number,
  shape: "triangle" | "parallelogram" | "trapezoid" | "mixed",
): TextProblem[] => {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = shape === "mixed"
      ? (["triangle", "parallelogram", "trapezoid"] as const)[Math.floor(rng() * 3)]
      : shape;

    switch (type) {
      case "triangle": {
        const base = 2 + Math.floor(rng() * 18);
        const height = 2 + Math.floor(rng() * 18);
        const b = base % 2 === 0 ? base : base + 1;
        const area = (b * height) / 2;
        problems.push({ question: `底辺${b}cm、高さ${height}cmの三角形の面積は？`, answer: `${area}cm²` });
        break;
      }
      case "parallelogram": {
        const base = 2 + Math.floor(rng() * 18);
        const height = 2 + Math.floor(rng() * 18);
        const area = base * height;
        problems.push({ question: `底辺${base}cm、高さ${height}cmの平行四辺形の面積は？`, answer: `${area}cm²` });
        break;
      }
      case "trapezoid": {
        const upper = 2 + Math.floor(rng() * 10);
        const lower = upper + 2 + Math.floor(rng() * 10);
        const height = 2 + Math.floor(rng() * 14);
        const sum = upper + lower;
        const h = sum % 2 === 0 ? height : (height % 2 === 0 ? height : height + 1);
        const area = (sum * h) / 2;
        problems.push({ question: `上底${upper}cm、下底${lower}cm、高さ${h}cmの台形の面積は？`, answer: `${area}cm²` });
        break;
      }
    }
  }
  return problems;
};
