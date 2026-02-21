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
  const seen = new Set<string>();
  for (let i = 0; i < 12; i++) {
    for (let attempt = 0; attempt < 20; attempt++) {
      const given = 1 + Math.floor(rng() * (target - 1));
      const answer = target - given;
      const position: "left" | "right" = rng() < 0.5 ? "left" : "right";
      const key = `${given}-${position}`;
      if (!seen.has(key) || attempt === 19) {
        seen.add(key);
        problems.push({ target, given, answer, position });
        break;
      }
    }
  }
  return problems;
}
