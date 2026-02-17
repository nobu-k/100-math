import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

/* ---- volume ---- */
export function generateVolume(
  seed: number,
  shape: "cube" | "rect" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const useCube = shape === "cube" ? true : shape === "rect" ? false : rng() < 0.4;

    if (useCube) {
      const side = 1 + Math.floor(rng() * 10);
      const vol = side * side * side;
      problems.push({
        question: `一辺${side}cmの立方体の体積は？`,
        answer: `${vol}cm³`,
      });
    } else {
      const a = 2 + Math.floor(rng() * 10);
      const b = 2 + Math.floor(rng() * 10);
      const c = 2 + Math.floor(rng() * 10);
      const vol = a * b * c;
      problems.push({
        question: `たて${a}cm、よこ${b}cm、高さ${c}cmの直方体の体積は？`,
        answer: `${vol}cm³`,
      });
    }
  }
  return problems;
}
