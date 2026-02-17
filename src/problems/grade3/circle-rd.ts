import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

export function generateCircleRD(seed: number): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const type = Math.floor(rng() * 3);
    switch (type) {
      case 0: {
        // radius -> diameter
        const r = 1 + Math.floor(rng() * 20);
        problems.push({ question: `半径${r}cmの円の直径は？`, answer: `${r * 2}cm` });
        break;
      }
      case 1: {
        // diameter -> radius
        const d = 2 + Math.floor(rng() * 10) * 2; // even for integer radius
        problems.push({ question: `直径${d}cmの円の半径は？`, answer: `${d / 2}cm` });
        break;
      }
      default: {
        // given radius, find diameter from description
        const r = 1 + Math.floor(rng() * 15);
        problems.push({
          question: `半径が${r}cmの円があります。直径は半径の何倍ですか？`,
          answer: `2倍`,
        });
        break;
      }
    }
  }
  return problems;
}
