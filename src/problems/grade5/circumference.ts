import { mulberry32 } from "../random";
import type { TextProblem } from "../shared/types";

/* ---- circumference ---- */
export function generateCircumference(
  seed: number,
  mode: "forward" | "reverse" | "mixed",
): TextProblem[] {
  const rng = mulberry32(seed);
  const problems: TextProblem[] = [];

  for (let i = 0; i < 10; i++) {
    const sub = mode === "mixed" ? (rng() < 0.6 ? "forward" : "reverse") : mode;

    if (sub === "forward") {
      const d = 1 + Math.floor(rng() * 20);
      const circ = d * 3.14;
      const circStr = Number(circ.toFixed(2)).toString();
      problems.push({
        question: `直径${d}cmの円の円周は？（円周率3.14）`,
        answer: `${circStr}cm`,
      });
    } else {
      // reverse: given circumference, find diameter
      const d = 2 + Math.floor(rng() * 20);
      const circ = d * 3.14;
      const circStr = Number(circ.toFixed(2)).toString();
      problems.push({
        question: `円周が${circStr}cmの円の直径は？（円周率3.14）`,
        answer: `${d}cm`,
      });
    }
  }
  return problems;
}
