import { mulberry32 } from "../random";

export interface DecompositionProblem {
  target: number;
  given: number;
  answer: number;
  /** "left"  → target = given + □
   *  "right" → target = □ + given */
  position: "left" | "right";
}

export function generateDecomposition(
  seed: number,
  target: number,
): DecompositionProblem[] {
  const rng = mulberry32(seed);
  const problems: DecompositionProblem[] = [];
  for (let i = 0; i < 12; i++) {
    const given = 1 + Math.floor(rng() * (target - 1));
    const answer = target - given;
    const position: "left" | "right" = rng() < 0.5 ? "left" : "right";
    problems.push({ target, given, answer, position });
  }
  return problems;
}
