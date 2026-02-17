import { mulberry32 } from "../random";

export interface KukuBlankProblem {
  a: number;
  b: number;
  product: number;
  blankPos: "a" | "b" | "product";
  answer: number;
}

export function generateKukuBlank(
  seed: number,
  blankMode: "any" | "product" | "factor",
): KukuBlankProblem[] {
  const rng = mulberry32(seed);
  const problems: KukuBlankProblem[] = [];
  for (let i = 0; i < 15; i++) {
    const a = 1 + Math.floor(rng() * 9);
    const b = 1 + Math.floor(rng() * 9);
    const product = a * b;
    let blankPos: "a" | "b" | "product";
    if (blankMode === "product") {
      blankPos = "product";
    } else if (blankMode === "factor") {
      blankPos = rng() < 0.5 ? "a" : "b";
    } else {
      const r = rng();
      blankPos = r < 0.33 ? "a" : r < 0.66 ? "b" : "product";
    }
    const answer = blankPos === "a" ? a : blankPos === "b" ? b : product;
    problems.push({ a, b, product, blankPos, answer });
  }
  return problems;
}
