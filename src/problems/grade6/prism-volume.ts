import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generatePrismVolume(
  seed: number,
  shape: "prism" | "cylinder" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const useCylinder = shape === "cylinder" ? true : shape === "prism" ? false : rng() < 0.5;

    if (useCylinder) {
      const r = 1 + Math.floor(rng() * 10);
      const h = 1 + Math.floor(rng() * 15);
      const vol = r * r * 3.14 * h;
      const volStr = Number(vol.toFixed(2)).toString();
      problems.push({
        question: `底面の半径${r}cm、高さ${h}cmの円柱の体積は？（円周率3.14）`,
        answer: `${volStr}cm³`,
      });
    } else {
      // triangular prism: base area = base * height / 2
      const type = Math.floor(rng() * 2);
      if (type === 0) {
        // triangular prism
        const base = 2 + Math.floor(rng() * 8) * 2; // even for clean division
        const triHeight = 2 + Math.floor(rng() * 10);
        const h = 2 + Math.floor(rng() * 10);
        const baseArea = (base * triHeight) / 2;
        const vol = baseArea * h;
        problems.push({
          question: `底面が底辺${base}cm・高さ${triHeight}cmの三角形で、高さ${h}cmの三角柱の体積は？`,
          answer: `${vol}cm³`,
        });
      } else {
        // quadrilateral prism (given base area)
        const baseArea = (2 + Math.floor(rng() * 20)) * 5; // multiples of 5
        const h = 2 + Math.floor(rng() * 10);
        const vol = baseArea * h;
        problems.push({
          question: `底面積${baseArea}cm²、高さ${h}cmの角柱の体積は？`,
          answer: `${vol}cm³`,
        });
      }
    }
  }
  return problems;
}
